"use client";

// The DSA page body: a tab switcher between the Striver A2Z sheet (tab 1) and
// your own "My Problems" log (tab 2).

import { useState } from "react";
import type { StepProgress } from "@/lib/dsa";
import type { CustomProblemRow } from "@/lib/data";
import type { Streak } from "@/lib/streaks";
import TodayDsaCard from "@/components/TodayDsaCard";
import SheetExplorer from "@/components/SheetExplorer";
import CustomProblems from "@/components/CustomProblems";

type Task = {
  topicName: string;
  difficulty: string;
  done: boolean;
  problems: { key: string; title: string; difficulty: string; url?: string | null }[];
} | null;

export default function DsaWorkspace({
  steps,
  task,
  stats,
  custom,
}: {
  steps: StepProgress[];
  task: Task;
  stats: { totalDone: number; total: number; pct: number; stepsStarted: number; stepsCount: number; streak: Streak };
  custom: CustomProblemRow[];
}) {
  const [tab, setTab] = useState<"striver" | "mine">("striver");

  return (
    <div className="space-y-6">
      {/* tab switcher */}
      <div className="flex gap-1 rounded-lg border border-ink-600 bg-ink-800/60 p-1">
        <button
          onClick={() => setTab("striver")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            tab === "striver" ? "bg-accent-grad text-ink-950 shadow-glow-sm" : "text-muted hover:text-gray-100"
          }`}
        >
          ◆ Striver A2Z
        </button>
        <button
          onClick={() => setTab("mine")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            tab === "mine" ? "bg-accent-grad text-ink-950 shadow-glow-sm" : "text-muted hover:text-gray-100"
          }`}
        >
          ✦ My Problems <span className="font-mono text-xs opacity-70">({custom.length})</span>
        </button>
      </div>

      {tab === "striver" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="card p-4">
              <p className="label">Solved</p>
              <p className="stat mt-1">{stats.totalDone}<span className="text-sm text-muted">/{stats.total}</span></p>
            </div>
            <div className="card p-4">
              <p className="label">Completion</p>
              <p className="stat mt-1">{stats.pct}%</p>
            </div>
            <div className="card p-4">
              <p className="label">Steps touched</p>
              <p className="stat mt-1">{stats.stepsStarted}<span className="text-sm text-muted">/{stats.stepsCount}</span></p>
            </div>
            <div className="card p-4">
              <p className="label">DSA streak</p>
              <p className="stat mt-1">{stats.streak.current}d</p>
              <p className="mt-0.5 font-mono text-xs text-muted">longest {stats.streak.longest}d</p>
            </div>
          </div>

          <div className="track">
            <div className="track-fill" style={{ width: `${stats.pct}%` }} />
          </div>

          <TodayDsaCard task={task} />

          <div>
            <h2 className="mb-3 text-sm font-semibold">The course · 12 steps</h2>
            <SheetExplorer steps={steps} />
          </div>
        </div>
      ) : (
        <CustomProblems problems={custom} />
      )}
    </div>
  );
}
