// Batches watch-time ticks from content.js and flushes them to LockedIn's
// /api/track endpoint once a minute (and whenever the buffer gets large).
//
// POST body: { source: "youtube", seconds }

// Defaults to the local LockedIn desktop app (which runs on port 3000 and stays
// alive in the tray). Override anytime via the extension's Options.
const DEFAULT_ENDPOINT = "http://localhost:3000/api/track";
const FLUSH_ALARM = "lockedin-flush";

let buffer = 0;
let lastProject = null;

async function getEndpoint() {
  const { endpoint } = await chrome.storage.sync.get("endpoint");
  return endpoint || DEFAULT_ENDPOINT;
}

async function flush() {
  if (buffer <= 0) return;
  const seconds = buffer;
  buffer = 0;
  const endpoint = await getEndpoint();
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "youtube", seconds, project: lastProject || undefined }),
    });
    console.log(`[LockedIn] flushed ${seconds}s → ${endpoint} (HTTP ${res.status})`);
  } catch (err) {
    buffer += seconds; // keep it for the next flush if the server is down
    console.warn(`[LockedIn] YT flush FAILED → ${endpoint}:`, err && err.message);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "yt-tick" && typeof msg.seconds === "number") {
    buffer += msg.seconds;
    if (msg.project) lastProject = msg.project;
    if (buffer >= 30) flush(); // flush quickly so data shows up fast
  }
});

// Periodic flush via alarms (service workers can be suspended; alarms wake us).
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 });
});
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 });
});
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === FLUSH_ALARM) flush();
});
