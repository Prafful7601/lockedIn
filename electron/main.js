// LockedIn desktop app (Electron).
// Runs the Next.js app + local SQLite entirely on your machine — no network, no
// lag — in a frameless "glass" window with adjustable transparency and a tray.
//
// The Next server runs as a SEPARATE child process (Electron-as-node) so it
// stays isolated from the GUI main process — the robust production pattern.

const path = require("path");
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, globalShortcut, session } = require("electron");

const PORT = 3000;
const ROOT = path.join(__dirname, "..");
const ICON = path.join(__dirname, process.platform === "win32" ? "icon.ico" : "icon.png");

// Distinct taskbar identity so Windows groups + pins the app under its own icon.
if (process.platform === "win32") app.setAppUserModelId("com.lockedin.desktop");

// Instant splash shown while the local server boots (so launch feels immediate).
function pageURL(bodyHtml) {
  const html = `<!doctype html><html><body style="margin:0;height:100vh;background:#0a0c10;color:#e6edf3;font-family:system-ui;display:flex;align-items:center;justify-content:center;-webkit-app-region:drag">${bodyHtml}</body></html>`;
  return "data:text/html;charset=utf-8," + encodeURIComponent(html);
}
const SPLASH = pageURL(
  `<div style="text-align:center"><div style="font:700 24px ui-monospace,monospace;letter-spacing:1px">LOCKED<span style="color:#39d98a">IN</span></div><div style="margin-top:12px;color:#7d8694;font-size:13px">starting your control room…</div><div style="margin:20px auto 0;width:26px;height:26px;border:3px solid #1f2630;border-top-color:#39d98a;border-radius:50%;animation:s .8s linear infinite"></div><style>@keyframes s{to{transform:rotate(360deg)}}</style></div>`,
);
const errorPage = (msg) =>
  pageURL(
    `<div style="text-align:center;max-width:520px;padding:24px"><div style="font:700 20px ui-monospace,monospace">LOCKED<span style="color:#39d98a">IN</span></div><p style="color:#fb7185;margin-top:14px;font-size:14px">Couldn't start the local server.</p><p style="color:#7d8694;font-size:12px">${String(msg).replace(/</g, "")}</p><p style="color:#7d8694;font-size:12px;margin-top:10px">Try closing the app and running <b>LockedIn.bat</b> once to rebuild.</p></div>`,
  );
let serverProc = null;
let win = null;
let tray = null;

// Best-effort: make sure the local AI server (Ollama) is running, so the
// in-app assistant works without the user starting anything. Harmless if it's
// already up (the second `serve` just fails on the busy port).
function startOllama() {
  // Keep models on D: if that's where they live (saves the small C: drive).
  const models =
    process.env.OLLAMA_MODELS || (fs.existsSync("D:\\Ollama\\models") ? "D:\\Ollama\\models" : undefined);
  const env = { ...process.env, ...(models ? { OLLAMA_MODELS: models } : {}) };
  const candidates = [
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Ollama", "ollama.exe"),
    "ollama",
  ];
  for (const exe of candidates) {
    try {
      const p = spawn(exe, ["serve"], { detached: true, stdio: "ignore", windowsHide: true, env });
      p.on("error", () => {});
      p.unref();
      return;
    } catch {
      /* try next */
    }
  }
}

function startServer() {
  const nextBin = require.resolve("next/dist/bin/next");
  serverProc = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    cwd: ROOT,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: "1", // run the child as plain Node
      NODE_ENV: "production",
      LOCKEDIN_DESKTOP: "1", // → local SQLite, no login
    },
    stdio: "inherit",
  });
  serverProc.on("exit", (code) => console.log("[LockedIn] server exited", code));
}

function waitForServer(timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(`http://localhost:${PORT}/`, (res) => {
        res.destroy();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("server didn't start in time"));
        else setTimeout(tick, 400);
      });
    };
    tick();
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 880,
    minHeight: 600,
    show: true,
    frame: false,
    backgroundColor: "#0a0c10",
    title: "LockedIn",
    icon: ICON,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL(SPLASH); // appears instantly; we swap to the app once it's up
  win.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  try {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, "icon.png")) /*tray keeps png*/);
    tray.setToolTip("LockedIn — your grind, tracked");
    tray.setContextMenu(
      Menu.buildFromTemplate([
        { label: "Open LockedIn", click: () => win && win.show() },
        { type: "separator" },
        { label: "Quit", click: () => { app.isQuitting = true; app.quit(); } },
      ]),
    );
    tray.on("click", () => win && (win.isVisible() ? win.focus() : win.show()));
  } catch (e) {
    console.error("[LockedIn] tray failed:", e);
  }
}

ipcMain.on("win:minimize", () => win && win.minimize());
ipcMain.on("win:close", () => win && win.hide());
ipcMain.on("win:opacity", (_e, value) => {
  if (win) win.setOpacity(Math.max(0.25, Math.min(1, Number(value) || 1)));
});

// Only one instance — a second launch just focuses the running window (avoids a
// port-3000 conflict that would otherwise make the app "fail to start").
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

app.whenReady().then(async () => {
  startOllama();   // best-effort: bring up the local AI
  startServer();   // start the Next server (child process)
  createWindow();  // show the splash window INSTANTLY
  createTray();
  // allow mic (for future voice) — it's your own local app
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    if (win) win.isVisible() ? win.focus() : win.show();
  });

  // swap the splash for the real app as soon as the server answers
  try {
    await waitForServer(45000);
    if (win) win.loadURL(`http://localhost:${PORT}`);
  } catch (e) {
    console.error("[LockedIn]", e);
    if (win) win.loadURL(errorPage(e instanceof Error ? e.message : String(e)));
  }
});
}

app.on("window-all-closed", () => {});
app.on("before-quit", () => {
  app.isQuitting = true;
  if (serverProc) serverProc.kill();
});
app.on("will-quit", () => globalShortcut.unregisterAll());
