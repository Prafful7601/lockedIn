"use client";

// Editable "Today's tasks" for the dashboard: check off, add, rename (click the
// name), and delete — without leaving the dashboard. Uses the shared habit
// server actions.

import { useState, useTransition } from "react";
import type { HabitToday } from "@/lib/data";
import { toggleHabitToday, addHabit, renameHabit, deleteHabit } from "@/app/actions";

function Row({ h }: { h: HabitToday }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(h.name);
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  return (
    <li className={`group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-ink-700 ${pending ? "opacity-60" : ""}`}>
      <button
        onClick={() => run(() => toggleHabitToday(h.id))}
        className={`flex h-4 w-4 flex-none items-center justify-center rounded border text-[10px] ${
          h.doneToday ? "border-accent bg-accent text-ink-900" : "border-ink-500 text-transparent group-hover:border-accent"
        }`}
      >
        ✓
      </button>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            setEditing(false);
            if (draft.trim() && draft !== h.name) run(() => renameHabit(h.id, draft));
          }}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="flex-1 rounded border border-ink-500 bg-ink-900 px-2 py-0.5 text-sm text-gray-100 outline-none focus:border-accent"
        />
      ) : (
        <button
          onClick={() => { setDraft(h.name); setEditing(true); }}
          className={`flex-1 text-left text-sm ${h.doneToday ? "text-muted line-through" : "text-gray-200"}`}
          title="Click to rename"
        >
          {h.name}
        </button>
      )}

      <span className="flex items-center gap-1 font-mono text-xs text-muted">
        <span className="text-accent">🔥</span>
        {h.streak.current}
      </span>
      <button
        onClick={() => { if (confirm(`Remove "${h.name}"?`)) run(() => deleteHabit(h.id)); }}
        className="text-muted opacity-0 transition-opacity hover:text-viz-rose group-hover:opacity-100"
        aria-label="Delete"
      >
        ✕
      </button>
    </li>
  );
}

export default function DashboardTasks({ habits }: { habits: HabitToday[] }) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      {habits.length === 0 ? (
        <p className="px-2 text-sm text-muted">No tasks yet — add one below.</p>
      ) : (
        <ul className="space-y-0.5">
          {habits.map((h) => <Row key={h.id} h={h} />)}
        </ul>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const v = name;
          setName("");
          startTransition(() => void addHabit(v));
        }}
        className="mt-2 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="+ add a recurring task"
          className="flex-1 rounded-md border border-ink-600 bg-ink-900 px-2.5 py-1.5 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
        />
        <button type="submit" disabled={pending || !name.trim()} className="btn px-3">
          Add
        </button>
      </form>
    </div>
  );
}
