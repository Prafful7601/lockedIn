// Runs on YouTube pages. Every TICK seconds, if a <video> is actually playing
// (not paused/ended), report the elapsed time to the background service worker.
// We count even when the tab is backgrounded — YouTube keeps playing audio, so
// that's still "watch time".

const TICK = 10; // seconds between checks

function isPlaying() {
  const v = document.querySelector("video");
  if (!v) return false;
  return !v.paused && !v.ended && v.readyState > 2 && v.currentTime > 0;
}

// The video title (so Insights can show WHAT you watch, not just how long).
function videoTitle() {
  const el = document.querySelector("h1.ytd-watch-metadata, h1.title");
  const t = (el?.textContent || document.title).replace(/^\(\d+\)\s*/, "").replace(/ - YouTube$/, "");
  return t.trim().slice(0, 80);
}

console.log("[LockedIn] YouTube tracker injected on", location.href);

setInterval(() => {
  if (isPlaying()) {
    chrome.runtime
      .sendMessage({ type: "yt-tick", seconds: TICK, project: videoTitle() })
      .catch((e) => console.warn("[LockedIn] sendMessage failed:", e?.message));
  }
}, TICK * 1000);
