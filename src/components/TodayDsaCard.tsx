"use client";

// Today's DSA task: either a "generate" button (no task yet) or the task with
// its problems + a "mark done" toggle. Both call server actions.

import { useTransition } from "react";
import { generateTodayDsaTask, toggleDsaTaskToday } from "@/app/actions";

type Problem = { key: string; title: string; difficulty: string; url?: string | null };

export default function TodayDsaCard({
  task,
}: {
  task: { topicName: string; difficulty: string; done: boolean; problems: Problem[] } | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Today&apos;s task</h2>
        <span className="label">next on your sheet</span>
      </div>

      {!task ? (
        <div className="mt-4">
          <p className="text-sm text-muted">
            No task generated yet. Pull the next unsolved problems from the A2Z sheet.
          </p>
          <button
            disabled={pending}
            onClick={() => startTransition(() => generateTodayDsaTask())}
            className="btn-accent mt-3"
          >
            {pending ? "Generating…" : "Generate today's task"}
          </button>
        </div>
      ) : (
        <div className={`mt-3 ${pending ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-ink-600 px-2 py-0.5 font-mono text-xs text-accent">
              {task.topicName}
            </span>
            <span className="font-mono text-xs uppercase text-muted">{task.difficulty}</span>
            {task.done && <span className="font-mono text-xs text-accent">✓ done</span>}
          </div>

          <ul className="mt-3 space-y-1.5">
            {task.problems.map((p) => (
              <li key={p.key} className="text-sm text-gray-200">
                •{" "}
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-accent hover:underline">
                    {p.title}
                  </a>
                ) : (
                  p.title
                )}{" "}
                <span className="font-mono text-[10px] text-muted">({p.difficulty})</span>
              </li>
            ))}
          </ul>

          <button
            disabled={pending}
            onClick={() => startTransition(() => toggleDsaTaskToday())}
            className={task.done ? "btn mt-4" : "btn-accent mt-4"}
          >
            {task.done ? "Mark as not done" : "Mark task done ✓"}
          </button>
        </div>
      )}
    </section>
  );
}
