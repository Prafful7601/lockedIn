// Batches watch-time ticks from content.js and flushes them to LockedIn's
// /api/track endpoint once a minute (and whenever the buffer gets large).
//
// POST body: { source: "youtube", seconds }

const DEFAULT_ENDPOINT = "http://localhost:3000/api/track";
const FLUSH_ALARM = "lockedin-flush";

let buffer = 0;

async function getEndpoint() {
  const { endpoint } = await chrome.storage.sync.get("endpoint");
  return endpoint || DEFAULT_ENDPOINT;
}

async function flush() {
  if (buffer <= 0) return;
  const seconds = buffer;
  buffer = 0;
  try {
    const endpoint = await getEndpoint();
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "youtube", seconds }),
    });
  } catch (err) {
    buffer += seconds; // keep it for the next flush if the server is down
    console.warn("[LockedIn] YT flush failed:", err && err.message);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "yt-tick" && typeof msg.seconds === "number") {
    buffer += msg.seconds;
    if (buffer >= 120) flush(); // flush early on long sessions
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
