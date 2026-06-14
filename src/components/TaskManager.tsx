"use client";

// Full recurring-task manager: add, rename (inline), delete, reorder, check off
// today, edit any of the last 14 days, and see current/longest streak + rate.

import { useState, useEffect, useTransition } from "react";
import type { HabitOverview } from "@/lib/data";
import {
  addHabit,
  renameHabit,
  deleteHabit,
  moveHabit,
  toggleHabitOnDate,
} from "@/app/actions";

// Minimal typings for the browser SpeechRecognition API (not in TS lib DOM).
type SpeechResultLike = { results: { [j: number]: { transcript: string } }[] };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: (e: SpeechResultLike) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
};

function weekdayShort(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" });
}

function HabitRow({
  habit,
  isFirst,
  isLast,
  today,
}: {
  habit: HabitOverview;
  isFirst: boolean;
  isLast: boolean;
  today: string;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.name);

  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  return (
    <li className={`panel p-4 ${pending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-3">
        {/* today's checkbox */}
        <button
          onClick={() => run(() => toggleHabitOnDate(habit.id, today))}
          aria-label="Toggle today"
          className={`flex h-6 w-6 flex-none items-center justify-center rounded border text-xs ${
            habit.doneToday
              ? "border-accent bg-accent text-ink-900"
              : "border-ink-500 text-transparent hover:border-accent"
          }`}
        >
          ✓
        </button>

        {/* name / inline editor */}
        <div className="flex-1">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditing(false);
                if (draft.trim() && draft !== habit.name) run(() => renameHabit(habit.id, draft));
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => {
                  setEditing(false);
                  if (draft.trim() && draft !== habit.name) run(() => renameHabit(habit.id, draft));
                }}
                className="w-full rounded border border-ink-500 bg-ink-900 px-2 py-1 text-sm text-gray-100 outline-none focus:border-accent"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setDraft(habit.name);
                setEditing(true);
              }}
              className="text-left text-sm text-gray-100 hover:text-accent"
              title="Click to rename"
            >
              {habit.name}
            </button>
          )}
          <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] text-muted">
            <span className="text-accent">🔥 {habit.streak.current}d</span>
            <span>best {habit.streak.longest}d</span>
            <span>{habit.rate}% / 14d</span>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center gap-1">
          <button
            disabled={isFirst}
            onClick={() => run(() => moveHabit(habit.id, "up"))}
            className="rounded px-1.5 py-0.5 text-muted hover:bg-ink-700 hover:text-gray-100 disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            disabled={isLast}
            onClick={() => run(() => moveHabit(habit.id, "down"))}
            className="rounded px-1.5 py-0.5 text-muted hover:bg-ink-700 hover:text-gray-100 disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => {
              if (confirm(`Remove "${habit.name}"? Its history is kept but it leaves your active list.`))
                run(() => deleteHabit(habit.id));
            }}
            className="rounded px-1.5 py-0.5 text-muted hover:bg-rose-500/10 hover:text-rose-400"
            aria-label="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 14-day history strip (click any day to toggle) */}
      <div className="mt-3 flex gap-1">
        {habit.history.map((c) => (
          <button
            key={c.date}
            onClick={() => run(() => toggleHabitOnDate(habit.id, c.date))}
            title={`${c.date} · ${c.done ? "done" : "not done"}`}
            className={`flex h-6 flex-1 flex-col items-center justify-center rounded border text-[8px] ${
              c.done
                ? "border-accent/50 bg-accent/70 text-ink-900"
                : "border-ink-600 bg-ink-700 text-muted hover:border-accent"
            } ${c.date === today ? "ring-1 ring-accent" : ""}`}
          >
            {weekdayShort(c.date)}
          </button>
        ))}
      </div>
    </li>
  );
}

export default function TaskManager({
  habits,
  today,
}: {
  habits: HabitOverview[];
  today: string;
}) {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    setVoiceSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  function startVoice() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (e: SpeechResultLike) => {
      const text = e.results[0][0].transcript.trim();
      // capitalize first letter, drop trailing period
      setName(text.charAt(0).toUpperCase() + text.slice(1).replace(/\.$/, ""));
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
  }

  return (
    <div className="space-y-4">
      {/* add form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          const value = name;
          setName("");
          startTransition(() => void addHabit(value));
        }}
        className="flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={listening ? "Listening… speak your task" : "New recurring task, e.g. “Apply to 1 job”"}
          className="flex-1 rounded-md border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-muted focus:border-accent"
        />
        {voiceSupported && (
          <button
            type="button"
            onClick={startVoice}
            title="Add by voice"
            className={`btn px-3 ${listening ? "border-accent text-accent animate-pulse-soft" : ""}`}
          >
            🎤
          </button>
        )}
        <button type="submit" disabled={pending || !name.trim()} className="btn-accent">
          + Add
        </button>
      </form>

      {habits.length === 0 ? (
        <div className="panel p-8 text-center text-sm text-muted">
          No recurring tasks yet. Add one above — it&apos;ll reset every day and start a streak.
        </div>
      ) : (
        <ul className="space-y-3">
          {habits.map((h, i) => (
            <HabitRow
              key={h.id}
              habit={h}
              isFirst={i === 0}
              isLast={i === habits.length - 1}
              today={today}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
