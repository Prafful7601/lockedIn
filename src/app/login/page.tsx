"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Wrong password.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-grad shadow-glow">
            <span className="font-mono text-lg font-bold text-ink-950">L</span>
          </div>
          <h1 className="font-mono text-xl font-bold tracking-wide">
            LOCKED<span className="bg-accent-grad bg-clip-text text-transparent">IN</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Enter your password to continue.</p>
        </div>

        <form onSubmit={submit} className="panel space-y-3 p-6">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-gray-100 outline-none focus:border-accent"
          />
          {error && <p className="text-sm text-viz-rose">⚠ {error}</p>}
          <button type="submit" disabled={loading || !password} className="btn-accent w-full">
            {loading ? "Checking…" : "Unlock →"}
          </button>
        </form>
      </div>
    </div>
  );
}
