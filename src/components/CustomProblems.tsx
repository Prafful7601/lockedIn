"use client";

// "My Problems" — your own log of solved problems from anywhere (Codeforces,
// CSES, contests, random practice). Add, edit notes, delete.

import { useState, useTransition } from "react";
import type { CustomProblemRow } from "@/lib/data";
import { addCustomProblem, deleteCustomProblem, editCustomProblem } from "@/app/actions";

const SOURCES = ["Codeforces", "LeetCode", "CSES", "AtCoder", "GfG", "Other"];

function Row({ p }: { p: CustomProblemRow }) {
  const [pending, startTransition] = useTransition();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(p.notes ?? "");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(p.title);
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  return (
    <li className={`panel p-3 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { setEditingTitle(false); if (title.trim() && title !== p.title) run(() => editCustomProblem(p.id, { title })); }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="flex-1 rounded border border-ink-500 bg-ink-900 px-2 py-0.5 text-sm text-gray-100 outline-none focus:border-accent"
              />
            ) : (
              <span className="text-sm font-medium text-gray-100">
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">{p.title}</a>
                ) : (
                  <button onClick={() => { setTitle(p.title); setEditingTitle(true); }} className="hover:text-accent" title="Click to edit">{p.title}</button>
                )}
              </span>
            )}
            {p.source && <span className="pill-accent">{p.source}</span>}
            {p.difficulty && <span className="pill">{p.difficulty}</span>}
            <span className="font-mono text-[10px] text-muted">{p.solvedAt}</span>
          </div>
          {editingNotes ? (
            <input
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => { setEditingNotes(false); if (notes !== (p.notes ?? "")) run(() => editCustomProblem(p.id, { notes })); }}
              placeholder="notes…"
              className="mt-1.5 w-full rounded border border-ink-500 bg-ink-900 px-2 py-1 text-xs text-gray-200 outline-none focus:border-accent"
            />
          ) : (
            <button onClick={() => setEditingNotes(true)} className="mt-1 block text-left text-xs text-muted hover:text-gray-300">
              {p.notes || "+ add notes"}
            </button>
          )}
        </div>
        <button
          onClick={() => { if (confirm(`Delete "${p.title}"?`)) run(() => deleteCustomProblem(p.id)); }}
          className="rounded px-1.5 py-0.5 text-muted hover:bg-rose-500/10 hover:text-viz-rose"
          aria-label="Delete"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default function CustomProblems({ problems }: { problems: CustomProblemRow[] }) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("Codeforces");
  const [difficulty, setDifficulty] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!title.trim()) return;
    const data = { title, source, difficulty, url };
    setTitle(""); setDifficulty(""); setUrl("");
    startTransition(() => void addCustomProblem(data));
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="panel flex flex-wrap items-end gap-2 p-4"
      >
        <div className="min-w-[180px] flex-1">
          <label className="label">Problem</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Codeforces 1846D — Rudolph and Christmas Tree"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <div className="w-32">
          <label className="label">Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-gray-100 outline-none focus:border-accent"
          >
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-24">
          <label className="label">Rating</label>
          <input
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            placeholder="1500"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <div className="w-40">
          <label className="label">Link (optional)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-2 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <button type="submit" disabled={pending} className="btn-accent h-[38px]">+ Log it</button>
      </form>

      {problems.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-muted">
          Nothing logged yet. Solved something on Codeforces or in a contest? Add it above.
        </div>
      ) : (
        <ul className="space-y-2">
          {problems.map((p) => <Row key={p.id} p={p} />)}
        </ul>
      )}
    </div>
  );
}
