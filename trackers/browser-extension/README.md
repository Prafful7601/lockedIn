# LockedIn — YouTube Watch-Time Tracker (Chrome/Edge, Manifest V3)

Sends your **YouTube watch time** to LockedIn's `POST /api/track` endpoint as:

```json
{ "source": "youtube", "seconds": 15 }
```

It only counts time while a video is **actually playing** in a **visible** tab —
paused/background videos don't count.

## Install (unpacked)

1. Open **chrome://extensions** (or **edge://extensions**).
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** → select this folder (`trackers/browser-extension`).
4. Make sure LockedIn is running (`npm run dev`).
5. Play a YouTube video for a minute → check the dashboard, "YouTube today" goes up.

## Point it at your deployed app

Click the extension's **Details → Extension options**, set the endpoint to your
Vercel URL (e.g. `https://yourapp.vercel.app/api/track`), Save. You'll also need to
add that origin to `host_permissions` in `manifest.json` and reload the extension.

## How it works

- `content.js` runs on youtube.com, checks every 15s whether a `<video>` is playing.
- It messages `background.js`, which **batches** the seconds and POSTs once a minute
  (via `chrome.alarms`, so it survives the service worker sleeping).
- If the server is down, buffered time is kept and retried on the next flush.
