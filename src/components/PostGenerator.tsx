"use client";

// Build-in-public post generator. Generates a LinkedIn-style draft from your
// week's data via POST /api/coach (mode "post"), lets you edit it inline, and
// copy it. Regenerate for a fresh take.

import { useState } from "react";

export default function PostGenerator({ apiKeyConfigured }: { apiKeyConfigured: boolean }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "post" }),
      });
      const data = (await res.json()) as { configured: boolean; text?: string; error?: string };
      if (!data.configured) setError("Add your GEMINI_API_KEY to .env to generate posts.");
      else if (data.error) setError(data.error);
      else setText(data.text ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy — select the text and copy manually.");
    }
  }

  if (!apiKeyConfigured) {
    return (
      <div className="panel border-amber-500/40 bg-amber-500/5 p-5">
        <p className="label text-amber-400/80">🔑 API key needed</p>
        <p className="mt-1 text-sm text-gray-200">
          Add <span className="font-mono text-amber-300">GEMINI_API_KEY</span> to{" "}
          <span className="font-mono">.env</span> and restart to draft posts from your week&apos;s data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={generate} disabled={loading} className="btn-accent">
          {loading ? "Drafting…" : text ? "Regenerate" : "Generate post"}
        </button>
        {text && (
          <button onClick={copy} className="btn">
            {copied ? "Copied ✓" : "Copy"}
          </button>
        )}
        <span className="ml-auto font-mono text-xs text-muted">{text.length} chars</span>
      </div>

      {error && <p className="text-sm text-rose-400">⚠ {error}</p>}

      {text || loading ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={loading ? "Generating from your week's data…" : ""}
          rows={14}
          className="w-full resize-y rounded-lg border border-ink-600 bg-ink-800 p-4 font-sans text-sm leading-relaxed text-gray-100 outline-none focus:border-accent"
        />
      ) : (
        <div className="panel p-8 text-center text-sm text-muted">
          Hit <span className="font-mono text-accent">Generate post</span> — I&apos;ll draft a LinkedIn
          update from your coding hours, problems solved, and streaks. You can edit it before copying.
        </div>
      )}
    </div>
  );
}
