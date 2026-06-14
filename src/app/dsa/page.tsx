// DSA tracker — Striver's A2Z sheet. Shows today's task, overall + per-step
// progress, the DSA streak, and the full clickable sheet.

import { getSheetProgress } from "@/lib/dsa";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/date";
import { computeStreak } from "@/lib/streaks";
import TodayDsaCard from "@/components/TodayDsaCard";
import SheetExplorer from "@/components/SheetExplorer";

export const dynamic = "force-dynamic";

export default async function DsaPage() {
  const { steps, totalDone, total } = await getSheetProgress();

  const taskRow = await prisma.dsaTask.findUnique({ where: { date: todayKey() } });
  const task = taskRow
    ? {
        topicName: taskRow.topicName,
        difficulty: taskRow.difficulty,
        done: taskRow.done,
        problems: JSON.parse(taskRow.problems) as {
          key: string;
          title: string;
          difficulty: string;
          url?: string | null;
        }[],
      }
    : null;

  const doneTasks = await prisma.dsaTask.findMany({
    where: { done: true },
    select: { date: true },
  });
  const streak = computeStreak(new Set(doneTasks.map((t) => t.date)), todayKey());

  const pct = total ? Math.round((totalDone / total) * 100) : 0;
  const stepsStarted = steps.filter((s) => s.done > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="label">DSA tracker</p>
        <h1 className="mt-1 text-2xl font-semibold">
          Striver&apos;s <span className="text-accent">A2Z</span> Sheet
        </h1>
      </div>

      {/* progress + streak strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4">
          <p className="label">Solved</p>
          <p className="stat mt-1">
            {totalDone}
            <span className="text-sm text-muted">/{total}</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="label">Completion</p>
          <p className="stat mt-1">{pct}%</p>
        </div>
        <div className="card p-4">
          <p className="label">Steps touched</p>
          <p className="stat mt-1">
            {stepsStarted}
            <span className="text-sm text-muted">/{steps.length}</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="label">DSA streak</p>
          <p className="stat mt-1">{streak.current}d</p>
          <p className="mt-0.5 font-mono text-xs text-muted">longest {streak.longest}d</p>
        </div>
      </div>

      <div className="track">
        <div className="track-fill" style={{ width: `${pct}%` }} />
      </div>

      <TodayDsaCard task={task} />

      <div>
        <h2 className="mb-3 text-sm font-semibold">The sheet · 18 steps</h2>
        <SheetExplorer steps={steps} />
      </div>
    </div>
  );
}
