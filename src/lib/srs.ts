import type { ReviewState } from "../../shared/widgetConfigs";

// SM-2 (SuperMemo 2) with the four answer buttons most flashcard apps use.
export type Grade = "again" | "hard" | "good" | "easy";

const QUALITY: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

const INITIAL_EASE = 2.5;
const MIN_EASE = 1.3;
const MAX_EASE = 5;
const MAX_INTERVAL_DAYS = 3650;
const RELEARN_MINUTES = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

export function initialReviewState(now: Date): ReviewState {
  return { ease: INITIAL_EASE, intervalDays: 0, repetitions: 0, dueAt: now.toISOString() };
}

export function review(
  state: ReviewState | undefined,
  grade: Grade,
  now: Date
): ReviewState {
  const current = state ?? initialReviewState(now);
  const quality = QUALITY[grade];
  const ease = Math.min(
    MAX_EASE,
    Math.max(
      MIN_EASE,
      current.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )
  );

  if (grade === "again") {
    return {
      ease,
      intervalDays: 0,
      repetitions: 0,
      dueAt: new Date(now.getTime() + RELEARN_MINUTES * 60 * 1000).toISOString(),
    };
  }

  const repetitions = current.repetitions + 1;
  let intervalDays: number;
  if (repetitions === 1) intervalDays = grade === "easy" ? 4 : 1;
  else if (repetitions === 2) intervalDays = grade === "hard" ? 3 : 6;
  else {
    const multiplier = grade === "hard" ? 1.2 : grade === "easy" ? ease * 1.3 : ease;
    intervalDays = Math.round(current.intervalDays * multiplier);
  }
  intervalDays = Math.min(MAX_INTERVAL_DAYS, Math.max(1, intervalDays));

  return {
    ease,
    intervalDays,
    repetitions,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
  };
}

export function isDue(state: ReviewState | undefined, now: Date): boolean {
  return !state || new Date(state.dueAt).getTime() <= now.getTime();
}

/** Due items, most overdue first; never-studied items come last in list order. */
export function dueItems<T extends { review?: ReviewState }>(items: T[], now: Date): T[] {
  const due = items.filter((item) => isDue(item.review, now));
  const reviewed = due
    .filter((item) => item.review)
    .sort((a, b) => a.review!.dueAt.localeCompare(b.review!.dueAt));
  return [...reviewed, ...due.filter((item) => !item.review)];
}

/** Human label for when a grade would schedule the next review, e.g. "10m", "6d". */
export function nextIntervalLabel(
  state: ReviewState | undefined,
  grade: Grade,
  now: Date
): string {
  const next = review(state, grade, now);
  const minutes = Math.round((new Date(next.dueAt).getTime() - now.getTime()) / 60000);
  if (minutes < 60) return `${minutes}m`;
  const days = Math.round(minutes / (60 * 24));
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.round(days / 30)}mo`;
  return `${(days / 365).toFixed(1).replace(/\.0$/, "")}y`;
}
