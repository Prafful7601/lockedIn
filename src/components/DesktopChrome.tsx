"use client";

// Custom titlebar for the Electron desktop app: draggable region, an always-on
// assistant command bar (command the app from anywhere), a transparency slider,
// and minimize/close. Renders nothing in the browser (web) build.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Bridge = {
  isDesktop: boolean;
  minimize: () => void;
  close: () => void;
  setOpacity: (v: number) => void;
};

declare global {
  interface Window {
    lockedin?: Bridge;
  }
}

const drag = { WebkitAppRegion: "drag" } as React.CSSProperties;
const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

export default function DesktopChrome() {
  const router = useRouter();
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const [opacity, setOpacity] = useState(100);
  const [cmd, setCmd] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.lockedin?.isDesktop) setBridge(window.lockedin);
  }, []);

  if (!bridge) return null;

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  async function run() {
    const instruction = cmd.trim();
    if (!instruction) return;
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const d = (await res.json()) as { message?: string; actions?: string[]; error?: string; configured?: boolean };
      if (!d.configured) flash("Add GEMINI_API_KEY to enable the assistant.");
      else if (d.error) flash(d.error);
      else {
        flash((d.actions && d.actions.length ? d.actions.join(" · ") : d.message) || "Done.");
        setCmd("");
        router.refresh();
      }
    } catch (e) {
      flash(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div style={drag} className="flex h-11 items-center gap-3 border-b border-ink-600/60 bg-ink-950/80 px-3 backdrop-blur-xl">
        {/* brand */}
        <span className="flex items-center gap-2 pl-1">
          <span className="h-2 w-2 rounded-full bg-accent shadow-glow-sm" />
          <span className="font-mono text-xs font-bold tracking-wide">
            LOCKED<span className="text-accent">IN</span>
          </span>
        </span>

        {/* assistant command bar */}
        <div style={noDrag} className="mx-auto flex w-full max-w-xl items-center gap-2">
          <span className="text-accent">✦</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && run()}
            placeholder="Command LockedIn…  e.g. “mark today's DSA done”, “log 8 glasses water”"
            className="flex-1 rounded-md border border-ink-600 bg-ink-900/80 px-3 py-1.5 text-xs text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
          <button onClick={run} disabled={busy} className="btn-accent px-2.5 py-1 text-xs">
            {busy ? "…" : "Run"}
          </button>
        </div>

        {/* transparency + window controls */}
        <div style={noDrag} className="flex items-center gap-2">
          <span className="text-[10px] text-muted">◐</span>
          <input
            type="range"
            min={40}
            max={100}
            value={opacity}
            onChange={(e) => {
              const v = Number(e.target.value);
              setOpacity(v);
              bridge.setOpacity(v / 100);
            }}
            title={`Opacity ${opacity}%`}
            className="h-1 w-20 cursor-pointer accent-accent"
          />
          <button onClick={() => bridge.minimize()} className="px-2 text-muted hover:text-gray-100" title="Minimize">▁</button>
          <button onClick={() => bridge.close()} className="px-2 text-muted hover:text-viz-rose" title="Hide to tray">✕</button>
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none fixed right-4 top-14 z-50 max-w-sm rounded-lg border border-accent/30 bg-ink-800/95 px-3 py-2 text-xs text-gray-100 shadow-glow">
          {toast}
        </div>
      )}
    </>
  );
}
