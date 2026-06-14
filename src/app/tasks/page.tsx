// Daily task manager — your own recurring habits. They reset every day (a day
// with no log is simply unchecked) and each carries current + longest streak.

import { getHabitsOverview } from "@/lib/data";
import { todayKey } from "@/lib/date";
import TaskManager from "@/components/TaskManager";
import AgentBar from "@/components/AgentBar";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const habits = await getHabitsOverview(14);
  const today = todayKey();

  const doneToday = habits.filter((h) => h.doneToday).length;
  const bestStreak = habits.reduce((m, h) => Math.max(m, h.streak.current), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="label">Daily tasks</p>
          <h1 className="mt-1 text-2xl font-semibold">Recurring habits</h1>
        </div>
        <div className="flex gap-3 text-right">
          <div>
            <p className="stat">{doneToday}/{habits.length}</p>
            <p className="label">done today</p>
          </div>
          <div>
            <p className="stat">{bestStreak}d</p>
            <p className="label">top streak</p>
          </div>
        </div>
      </div>

      <AgentBar placeholder="e.g. “add a task to post on LinkedIn” or “mark apply to a job done”" />

      <p className="text-xs text-muted">
        Click a name to rename · click any day in the strip to backfill · tasks reset automatically each morning.
      </p>

      <TaskManager habits={habits} today={today} />
    </div>
  );
}
