// LockedIn desktop app (Electron).
// Runs the Next.js app + local SQLite entirely on your machine — no network, no
// lag — in a frameless "glass" window with adjustable transparency and a tray.
//
// The Next server runs as a SEPARATE child process (Electron-as-node) so it
// stays isolated from the GUI main process — the robust production pattern.

const path = require("path");
const http = require("http");
const { spawn } = require("child_process");
const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, globalShortcut } = require("electron");

const PORT = 3000;
const ROOT = path.join(__dirname, "..");
const ICON = path.join(__dirname, process.platform === "win32" ? "icon.ico" : "icon.png");

// Distinct taskbar identity so Windows groups + pins the app under its own icon.
if (process.platform === "win32") app.setAppUserModelId("com.lockedin.desktop");
let serverProc = null;
let win = null;
let tray = null;

// Best-effort: make sure the local AI server (Ollama) is running, so the
// in-app assistant works without the user starting anything. Harmless if it's
// already up (the second `serve` just fails on the busy port).
function startOllama() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Ollama", "ollama.exe"),
    "ollama",
  ];
  for (const exe of candidates) {
    try {
      const p = spawn(exe, ["serve"], { detached: true, stdio: "ignore", windowsHide: true });
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
    show: false,
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
  win.loadURL(`http://localhost:${PORT}`);
  win.once("ready-to-show", () => win.show());
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

app.whenReady().then(async () => {
  startServer();
  try {
    await waitForServer();
  } catch (e) {
    console.error("[LockedIn]", e);
  }
  createWindow();
  createTray();
  globalShortcut.register("CommandOrControl+Shift+L", () => {
    if (win) win.isVisible() ? win.focus() : win.show();
  });
});

app.on("window-all-closed", () => {});
app.on("before-quit", () => {
  app.isQuitting = true;
  if (serverProc) serverProc.kill();
});
app.on("will-quit", () => globalShortcut.unregisterAll());
