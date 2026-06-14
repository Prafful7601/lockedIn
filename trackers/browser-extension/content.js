// Runs on YouTube pages. Every TICK seconds, if a <video> is actually playing
// (not paused/ended and the tab is visible), report the elapsed time to the
// background service worker. The background worker does the POST so we don't
// fight the page's network rules.

const TICK = 15; // seconds between checks

function isWatching() {
  const v = document.querySelector("video");
  if (!v) return false;
  // playing = not paused, not ended, has data, and progressing
  const playing = !v.paused && !v.ended && v.readyState > 2 && v.currentTime > 0;
  const visible = document.visibilityState === "visible";
  return playing && visible;
}

setInterval(() => {
  if (isWatching()) {
    chrome.runtime.sendMessage({ type: "yt-tick", seconds: TICK }).catch(() => {});
  }
}, TICK * 1000);
