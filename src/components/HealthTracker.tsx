"use client";

// Health goals: define goals (water/sleep/workout), log today's value with
// +/- steppers or a direct input, and see a 7-day history. All via server
// actions; the page revalidates so the dashboard mirror stays in sync.

import { useState, useTransition } from "react";
import type { HealthGoalOverview } from "@/lib/data";
import { addHealthGoal, deleteHealthGoal, editHealthGoal, logHealth } from "@/app/actions";

function GoalCard({ goal }: { goal: HealthGoalOverview }) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<string>(String(goal.todayValue));
  const [editing, setEditing] = useState(false);
  const [eName, setEName] = useState(goal.name);
  const [eUnit, setEUnit] = useState(goal.unit);
  const [eTarget, setETarget] = useState(String(goal.target));
  const pct = goal.target ? Math.min(100, (goal.todayValue / goal.target) * 100) : 0;
  const hit = goal.todayValue >= goal.target;
  const maxHist = Math.max(goal.target, ...goal.history.map((h) => h.value), 1);

  const set = (v: number) => {
    setDraft(String(v));
    startTransition(() => void logHealth(goal.id, v));
  };

  const saveEdit = () => {
    setEditing(false);
    startTransition(() =>
      void editHealthGoal(goal.id, { name: eName, unit: eUnit, target: parseFloat(eTarget) }),
    );
  };

  return (
    <div className={`panel p-5 ${pending ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between">
        {editing ? (
          <div className="flex flex-1 flex-wrap items-end gap-2">
            <input value={eName} onChange={(e) => setEName(e.target.value)} className="w-28 rounded border border-ink-500 bg-ink-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent" />
            <input value={eTarget} onChange={(e) => setETarget(e.target.value)} inputMode="decimal" className="w-16 rounded border border-ink-500 bg-ink-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent" />
            <input value={eUnit} onChange={(e) => setEUnit(e.target.value)} className="w-24 rounded border border-ink-500 bg-ink-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent" />
            <button onClick={saveEdit} className="btn px-2 py-1 text-xs">Save</button>
          </div>
        ) : (
          <button onClick={() => { setEName(goal.name); setEUnit(goal.unit); setETarget(String(goal.target)); setEditing(true); }} className="text-left" title="Click to edit goal">
            <h3 className="text-sm font-semibold text-gray-100">{goal.name}</h3>
            <p className="label mt-0.5">target {goal.target} {goal.unit} · avg {goal.weekAvg}/day · ✎</p>
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(`Remove "${goal.name}"?`)) startTransition(() => void deleteHealthGoal(goal.id));
          }}
          className="rounded px-1.5 py-0.5 text-muted hover:bg-rose-500/10 hover:text-rose-400"
          aria-label="Delete goal"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className={`font-mono text-3xl ${hit ? "text-accent" : "text-gray-100"}`}>
          {goal.todayValue}
        </span>
        <span className="mb-1 font-mono text-sm text-muted">/ {goal.target} {goal.unit}</span>
        {hit && <span className="mb-1.5 ml-auto font-mono text-xs text-accent">✓ goal hit</span>}
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* steppers + direct input */}
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => set(Math.max(0, goal.todayValue - goal.step))} className="btn px-3">
          −
        </button>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const n = parseFloat(draft);
            if (!Number.isNaN(n) && n !== goal.todayValue) set(Math.max(0, n));
            else setDraft(String(goal.todayValue));
          }}
          inputMode="decimal"
          className="w-16 rounded border border-ink-600 bg-ink-900 px-2 py-1 text-center font-mono text-sm text-gray-100 outline-none focus:border-accent"
        />
        <button onClick={() => set(goal.todayValue + goal.step)} className="btn px-3">
          +
        </button>
        <span className="ml-1 text-xs text-muted">+{goal.step} {goal.unit}</span>
      </div>

      {/* 7-day history */}
      <div className="mt-4 flex items-end gap-1.5">
        {goal.history.map((h) => {
          const height = Math.max(6, (h.value / maxHist) * 40);
          const met = h.value >= goal.target;
          return (
            <div key={h.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                title={`${h.date}: ${h.value} ${goal.unit}`}
                className={`w-full rounded-sm ${met ? "bg-accent/80" : "bg-ink-500"}`}
                style={{ height }}
              />
              <span className="font-mono text-[9px] text-muted">
                {new Date(h.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function HealthTracker({ goals }: { goals: HealthGoalOverview[] }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [target, setTarget] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = () => {
    const t = parseFloat(target);
    if (!name.trim() || !unit.trim() || Number.isNaN(t) || t <= 0) return;
    const args = { name, unit, t };
    setName("");
    setUnit("");
    setTarget("");
    startTransition(() => void addHealthGoal(args.name, args.unit, args.t));
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="panel flex flex-wrap items-end gap-2 p-4"
      >
        <div className="flex-1">
          <label className="label">Goal</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Water"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <div className="w-28">
          <label className="label">Unit</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="glasses"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <div className="w-24">
          <label className="label">Target</label>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="8"
            inputMode="decimal"
            className="mt-1 w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
          />
        </div>
        <button type="submit" disabled={pending} className="btn-accent h-[38px]">
          + Add goal
        </button>
      </form>

      {goals.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-muted">
          No health goals yet. Add one above — water, sleep, workout…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} />
          ))}
        </div>
      )}
    </div>
  );
}
