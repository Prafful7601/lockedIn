// DSA tracker — Striver's A2Z course (tab 1) + your own problem log (tab 2).

import { getSheetProgress } from "@/lib/dsa";
import { getCustomProblems } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { todayKey } from "@/lib/date";
import { computeStreak } from "@/lib/streaks";
import AgentBar from "@/components/AgentBar";
import DsaWorkspace from "@/components/DsaWorkspace";

export const dynamic = "force-dynamic";

export default async function DsaPage() {
  const { steps, totalDone, total } = await getSheetProgress();
  const custom = await getCustomProblems();

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

  const doneTasks = await prisma.dsaTask.findMany({ where: { done: true }, select: { date: true } });
  const streak = computeStreak(new Set(doneTasks.map((t) => t.date)), todayKey());

  const pct = total ? Math.round((totalDone / total) * 100) : 0;
  const stepsStarted = steps.filter((s) => s.done > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="label">DSA tracker</p>
        <h1 className="mt-1 text-2xl font-semibold">
          Striver&apos;s <span className="text-accent">A2Z</span> Course
        </h1>
      </div>

      <AgentBar placeholder="e.g. “I finished 3 lectures” or “mark today’s DSA done”" />

      <DsaWorkspace
        steps={steps}
        task={task}
        stats={{ totalDone, total, pct, stepsStarted, stepsCount: steps.length, streak }}
        custom={custom}
      />
    </div>
  );
}
