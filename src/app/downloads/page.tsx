// Downloads — every downloadable artifact in one place (the companion trackers),
// plus the raw /api/track contract so anyone can build their own sender.

import Link from "next/link";

export const metadata = { title: "Downloads · LockedIn" };

type Download = {
  name: string;
  file: string;
  size: string;
  blurb: string;
  install: string;
};

const DOWNLOADS: Download[] = [
  {
    name: "VS Code Time Tracker",
    file: "/files/lockedin-vscode-tracker.zip",
    size: "≈ 3 KB",
    blurb: "Sends your active coding time to LockedIn. Counts only focused, non-idle editing.",
    install: "Unzip → open the folder in VS Code → press F5 (or copy it into your VS Code extensions folder).",
  },
  {
    name: "YouTube Watch Tracker (Chrome/Edge)",
    file: "/files/lockedin-youtube-tracker.zip",
    size: "≈ 4 KB",
    blurb: "Sends your YouTube watch time to LockedIn. Counts only videos actually playing in a visible tab.",
    install: "Unzip → chrome://extensions → enable Developer mode → Load unpacked → pick the folder.",
  },
];

export default function DownloadsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="label">Downloads</p>
        <h1 className="mt-1 text-2xl font-semibold">Companion trackers</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          These small apps feed your coding + YouTube time into LockedIn. They&apos;re optional —
          the app works without them — but they&apos;re what makes the time charts real. Full
          step-by-step setup is on the{" "}
          <Link href="/guide" className="text-accent hover:underline">
            How to use
          </Link>{" "}
          page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DOWNLOADS.map((d) => (
          <div key={d.file} className="panel flex flex-col p-5">
            <h2 className="text-sm font-semibold text-gray-100">{d.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{d.blurb}</p>
            <p className="mt-3 rounded-md bg-ink-900 p-3 text-xs text-gray-300">
              <span className="label">install</span>
              <br />
              {d.install}
            </p>
            <a
              href={d.file}
              download
              className="btn-accent mt-4 w-full"
            >
              ⬇ Download .zip <span className="font-mono text-xs opacity-70">({d.size})</span>
            </a>
          </div>
        ))}
      </div>

      <div className="panel p-5">
        <h2 className="text-sm font-semibold">Build your own tracker</h2>
        <p className="mt-2 text-sm text-muted">
          Anything that can POST JSON can feed LockedIn. Send to{" "}
          <span className="font-mono text-accent">/api/track</span>:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-ink-900 p-4 font-mono text-xs text-gray-200">
{`curl -X POST http://localhost:3000/api/track \\
  -H "Content-Type: application/json" \\
  -d '{"source":"vscode","seconds":1500,"project":"my-repo"}'`}
        </pre>
        <p className="mt-3 text-xs text-muted">
          <span className="font-mono">source</span> = &quot;vscode&quot; | &quot;youtube&quot; ·{" "}
          <span className="font-mono">seconds</span> (required) ·{" "}
          <span className="font-mono">project</span>, <span className="font-mono">date</span> optional.
          Repeated pings are summed.
        </p>
      </div>
    </div>
  );
}
