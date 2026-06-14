// Streak math, shared by the dashboard, the tasks page, and the coach.
// A "streak" is a run of consecutive calendar days that were completed.

import { addDays } from "./date";

export type Streak = { current: number; longest: number };

/**
 * Given the set of completed day-keys and today's key, return current + longest.
 *
 * - longest: the longest run of consecutive done-days anywhere in history.
 * - current: the run ending today. If today isn't done yet we still count the
 *   run ending yesterday (so a not-yet-done today doesn't read as a broken
 *   streak) — once yesterday is also missed, current is 0.
 */
export function computeStreak(doneDays: Set<string>, today: string): Streak {
  if (doneDays.size === 0) return { current: 0, longest: 0 };

  // longest run
  const sorted = [...doneDays].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
  }

  // current run: walk backwards from today (or yesterday if today not done)
  let cursor = doneDays.has(today) ? today : addDays(today, -1);
  let current = 0;
  while (doneDays.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  return { current, longest };
}
