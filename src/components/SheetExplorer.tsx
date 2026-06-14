"use client";

// The Striver A2Z sheet itself: collapsible steps, each with checkbox problems.
// Clicking a checkbox calls toggleProblemDone and the page revalidates.

import { useState, useTransition } from "react";
import type { StepProgress } from "@/lib/dsa";
import { toggleProblemDone } from "@/app/actions";

const DIFF_COLOR: Record<string, string> = {
  easy: "text-accent",
  medium: "text-amber-400",
  hard: "text-rose-400",
};

export default function SheetExplorer({ steps }: { steps: StepProgress[] }) {
  // open the first step that isn't fully complete
  const firstIncomplete = steps.find((s) => s.done < s.total)?.step ?? steps[0]?.step;
  const [open, setOpen] = useState<number | null>(firstIncomplete ?? null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      {steps.map((step) => {
        const pct = step.total ? Math.round((step.done / step.total) * 100) : 0;
        const isOpen = open === step.step;
        return (
          <div key={step.step} className="panel overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : step.step)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ink-700"
            >
              <span className="font-mono text-xs text-muted">{String(step.step).padStart(2, "0")}</span>
              <span className="flex-1 text-sm font-medium text-gray-100">{step.name}</span>
              <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-ink-700 sm:block">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </span>
              <span className="font-mono text-xs text-muted">
                {step.done}/{step.total}
              </span>
              <span className={`text-muted transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
            </button>

            {isOpen && (
              <div className={`border-t border-ink-600 px-4 py-3 ${pending ? "opacity-60" : ""}`}>
                {step.topics.map((topic) => (
                  <div key={topic.name} className="mb-3 last:mb-0">
                    <p className="label mb-1.5">{topic.name}</p>
                    <ul className="space-y-0.5">
                      {topic.problems.map((p) => (
                        <li key={p.key}>
                          <button
                            onClick={() => startTransition(() => toggleProblemDone(p.key))}
                            className="group flex w-full items-center gap-2.5 rounded px-1.5 py-1 text-left hover:bg-ink-700"
                          >
                            <span
                              className={`flex h-4 w-4 flex-none items-center justify-center rounded border text-[10px] ${
                                p.done
                                  ? "border-accent bg-accent text-ink-900"
                                  : "border-ink-500 text-transparent group-hover:border-accent"
                              }`}
                            >
                              ✓
                            </span>
                            <span className={`flex-1 text-sm ${p.done ? "text-muted line-through" : "text-gray-200"}`}>
                              {p.url ? (
                                <a
                                  href={p.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="hover:text-accent hover:underline"
                                >
                                  {p.title}
                                </a>
                              ) : (
                                p.title
                              )}
                            </span>
                            <span className={`font-mono text-[10px] uppercase ${DIFF_COLOR[p.difficulty] ?? "text-muted"}`}>
                              {p.difficulty}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
