// LockedIn VS Code time tracker.
// Counts a second as "active coding" when the editor window is focused AND
// you've typed/edited within the idle window. Flushes accumulated seconds to
// POST /api/track as { source: "vscode", seconds, project }.
//
// No build step — plain JS. Load it with "Run Extension" (F5) or by copying
// this folder into your VS Code extensions dir. See README.md.

const vscode = require("vscode");

let activeSeconds = 0;
let lastActivity = Date.now();
let focused = true;
let tickTimer;
let flushTimer;

function cfg() {
  const c = vscode.workspace.getConfiguration("lockedin");
  return {
    endpoint: c.get("endpoint", "http://localhost:3000/api/track"),
    idleMs: c.get("idleSeconds", 120) * 1000,
    flushMs: c.get("flushSeconds", 60) * 1000,
  };
}

function projectName() {
  const folders = vscode.workspace.workspaceFolders;
  return folders && folders.length ? folders[0].name : "unknown";
}

async function flush(endpoint) {
  if (activeSeconds <= 0) return;
  const seconds = activeSeconds;
  activeSeconds = 0;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "vscode", seconds, project: projectName() }),
    });
  } catch (err) {
    // Server down? Keep the time so it isn't lost; retry on next flush.
    activeSeconds += seconds;
    console.warn("[LockedIn] flush failed:", err && err.message);
  }
}

function markActivity() {
  lastActivity = Date.now();
}

function activate(context) {
  const { idleMs, flushMs, endpoint } = cfg();

  // Any of these counts as "you're working".
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(markActivity),
    vscode.window.onDidChangeTextEditorSelection(markActivity),
    vscode.window.onDidChangeActiveTextEditor(markActivity),
    vscode.window.onDidChangeWindowState((s) => {
      focused = s.focused;
      if (s.focused) markActivity();
    }),
  );

  // Tick every second; accrue active time.
  tickTimer = setInterval(() => {
    if (focused && Date.now() - lastActivity < idleMs) activeSeconds++;
  }, 1000);

  // Flush on an interval and once on shutdown.
  flushTimer = setInterval(() => flush(endpoint), flushMs);
  context.subscriptions.push({ dispose: () => flush(endpoint) });

  console.log("[LockedIn] tracker active →", endpoint);
}

function deactivate() {
  clearInterval(tickTimer);
  clearInterval(flushTimer);
  return flush(cfg().endpoint);
}

module.exports = { activate, deactivate };
