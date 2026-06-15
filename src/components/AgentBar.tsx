"use client";

// The "Jarvis" command bar. Type (or speak) a natural-language instruction; the
// agent executes real actions via /api/agent, then we refresh the page so the
// changes show immediately. Reusable across Dashboard, DSA, and Tasks.

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type SpeechResultLike = { results: { [j: number]: { transcript: string } }[] };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: (e: SpeechResultLike) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

export default function AgentBar({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
      lockedin?: { isDesktop?: boolean };
    };
    // Web Speech recognition has no backend in Electron, so only offer voice in
    // the browser build (not the desktop app).
    const desktop = !!w.lockedin?.isDesktop;
    setVoiceOk(!desktop && !!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function startVoice() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    setListening(true);
    rec.onresult = (e) => setText(e.results[0][0].transcript);
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    recRef.current = rec;
  }

  async function run() {
    const instruction = text.trim();
    if (!instruction) return;
    setLoading(true);
    setError(null);
    setActions(null);
    setMessage(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction }),
      });
      const data = (await res.json()) as {
        configured: boolean;
        message?: string;
        actions?: string[];
        error?: string;
      };
      if (!data.configured) setError("Add your GEMINI_API_KEY to use the assistant.");
      else if (data.error) setError(data.error);
      else {
        setMessage(data.message ?? null);
        setActions(data.actions ?? []);
        setText("");
        router.refresh(); // pull fresh server data into the page
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-accent/30 bg-ink-800/70 bg-panel-grad p-3 shadow-glow-sm">
      <div className="flex items-center gap-2">
        <span className="hidden pl-1 text-accent sm:inline">✦</span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && run()}
          placeholder={listening ? "Listening…" : placeholder ?? "Tell LockedIn what to do… e.g. “add a task to apply to 1 job and mark today’s DSA done”"}
          className="flex-1 bg-transparent px-1 py-1.5 text-sm text-gray-100 outline-none placeholder:text-muted"
        />
        {voiceOk && (
          <button
            onClick={startVoice}
            title="Speak"
            className={`btn-ghost px-2 ${listening ? "text-accent animate-pulse-soft" : ""}`}
          >
            🎤
          </button>
        )}
        <button onClick={run} disabled={loading || !text.trim()} className="btn-accent">
          {loading ? "Working…" : "Run ▷"}
        </button>
      </div>

      {error && <p className="mt-2 px-1 text-sm text-viz-rose">⚠ {error}</p>}
      {(message || (actions && actions.length > 0)) && (
        <div className="mt-2 border-t border-ink-600 px-1 pt-2">
          {message && <p className="text-sm text-gray-200">{message}</p>}
          {actions && actions.length > 0 && (
            <ul className="mt-1 space-y-0.5">
              {actions.map((a, i) => (
                <li key={i} className="font-mono text-xs text-muted">{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
