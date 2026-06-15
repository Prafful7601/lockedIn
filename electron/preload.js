// Safe bridge between the web UI and Electron. Exposes only what the renderer
// needs: window controls + transparency. Presence of window.lockedin also tells
// the UI it's running as the desktop app (so it can show the custom titlebar).

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("lockedin", {
  isDesktop: true,
  minimize: () => ipcRenderer.send("win:minimize"),
  close: () => ipcRenderer.send("win:close"),
  setOpacity: (value) => ipcRenderer.send("win:opacity", value),
});
