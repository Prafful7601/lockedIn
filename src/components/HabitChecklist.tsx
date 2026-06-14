"use client";

// Client wrapper around the today's-habits list. Checking a box calls the
// toggleHabitToday server action; useTransition keeps the UI responsive and
// shows a subtle pending state while the server revalidates.

import { useTransition } from "react";
import type { HabitToday } from "@/lib/data";
import { toggleHabitToday } from "@/app/actions";

export default function HabitChecklist({ habits }: { habits: HabitToday[] }) {
  const [pending, startTransition] = useTransition();

  if (habits.length === 0) {
    return <p className="text-sm text-muted">No habits yet. Add some on the Tasks page.</p>;
  }

  return (
    <ul className={`space-y-1.5 ${pending ? "opacity-60" : ""}`}>
      {habits.map((h) => (
        <li key={h.id}>
          <button
            onClick={() => startTransition(() => toggleHabitToday(h.id))}
            className="group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-ink-700"
          >
            <span
              className={`flex h-4 w-4 flex-none items-center justify-center rounded border text-[10px] ${
                h.doneToday
                  ? "border-accent bg-accent text-ink-900"
                  : "border-ink-500 text-transparent group-hover:border-accent"
              }`}
            >
              ✓
            </span>
            <span
              className={`flex-1 text-sm ${
                h.doneToday ? "text-muted line-through" : "text-gray-200"
              }`}
            >
              {h.name}
              {h.type === "dsa" && (
                <span className="ml-2 rounded bg-ink-600 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                  DSA
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs text-muted">
              <span className="text-accent">🔥</span>
              {h.streak.current}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
