"use client";

// The AI coach slot at the top of the dashboard. Renders the daily briefing and
// offers "plan my day". All generation goes through POST /api/coach, where the
// Gemini key lives server-side. Never crashes when the key is missing.

import { useState } from "react";

type PlanState = { loading: boolean; text: string | null; error: string | null };

export default function CoachBanner({
  apiKeyConfigured,
  briefing: initialBriefing,
}: {
  apiKeyConfigured: boolean;
  briefing: string | null;
}) {
  const [briefing, setBriefing] = useState<string | null>(initialBriefing);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanState>({ loading: false, text: null, error: null });

  async function callCoach(mode: "briefing" | "plan", refresh = false) {
    const res = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, refresh }),
    });
    return res.json() as Promise<{ configured: boolean; text?: string; error?: string }>;
  }

  async function loadBriefing(refresh: boolean) {
    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const data = await callCoach("briefing", refresh);
      if (data.error) setBriefingError(data.error);
      else if (data.text) setBriefing(data.text);
    } catch (e) {
      setBriefingError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBriefingLoading(false);
    }
  }

  async function planMyDay() {
    setPlan({ loading: true, text: null, error: null });
    try {
      const data = await callCoach("plan");
      if (data.error) setPlan({ loading: false, text: null, error: data.error });
      else setPlan({ loading: false, text: data.text ?? null, error: null });
    } catch (e) {
      setPlan({ loading: false, text: null, error: e instanceof Error ? e.message : "Request failed" });
    }
  }

  // No key → never crash, just guide the user.
  if (!apiKeyConfigured) {
    return (
      <div className="panel border-amber-500/40 bg-amber-500/5 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-lg">🔑</span>
          <div>
            <p className="label text-amber-400/80">AI Coach offline</p>
            <p className="mt-1 text-sm text-gray-200">
              Add your <span className="font-mono text-amber-300">GEMINI_API_KEY</span> to the{" "}
              <span className="font-mono">.env</span> file to switch on the daily briefing,
              &ldquo;plan my day&rdquo;, and build-in-public posts.
            </p>
            <p className="mt-1 text-xs text-muted">
              Get a free key at aistudio.google.com/apikey → restart <span className="font-mono">npm run dev</span>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="label text-accent">Coach · today&apos;s briefing</p>
        <div className="flex items-center gap-2">
          <button onClick={planMyDay} disabled={plan.loading} className="btn-accent">
            {plan.loading ? "Planning…" : "Plan my day"}
          </button>
          <button onClick={() => loadBriefing(true)} disabled={briefingLoading} className="btn">
            {briefingLoading ? "…" : briefing ? "Refresh" : "Generate"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        {briefingError ? (
          <p className="text-sm text-rose-400">⚠ {briefingError}</p>
        ) : briefing ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{briefing}</p>
        ) : (
          <p className="text-sm text-muted">
            No briefing yet — hit <span className="font-mono text-accent">Generate</span> for today&apos;s focus.
          </p>
        )}
      </div>

      {(plan.text || plan.error) && (
        <div className="mt-4 border-t border-ink-600 pt-4">
          <p className="label mb-2 text-accent">Your plan for today</p>
          {plan.error ? (
            <p className="text-sm text-rose-400">⚠ {plan.error}</p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200">{plan.text}</p>
          )}
        </div>
      )}
    </div>
  );
}
