import { describe, expect, it } from "vitest";
import { dueItems, isDue, nextIntervalLabel, review } from "./srs";

const now = new Date("2026-09-25T12:00:00.000Z");
const daysLater = (days: number) => new Date(now.getTime() + days * 86_400_000).toISOString();

describe("review (SM-2)", () => {
  it("schedules the first reviews at 1 and 6 days, then multiplies by ease", () => {
    const first = review(undefined, "good", now);
    expect(first).toMatchObject({ intervalDays: 1, repetitions: 1, dueAt: daysLater(1) });

    const second = review(first, "good", now);
    expect(second).toMatchObject({ intervalDays: 6, repetitions: 2 });

    const third = review(second, "good", now);
    expect(third.intervalDays).toBe(Math.round(6 * second.ease));
  });

  it("resets repetitions and lowers ease when forgotten", () => {
    const learned = review(review(undefined, "good", now), "good", now);
    const forgotten = review(learned, "again", now);

    expect(forgotten.repetitions).toBe(0);
    expect(forgotten.intervalDays).toBe(0);
    expect(forgotten.ease).toBeLessThan(learned.ease);
    expect(forgotten.dueAt).toBe(new Date(now.getTime() + 10 * 60_000).toISOString());
  });

  it("keeps ease within bounds", () => {
    let state = review(undefined, "again", now);
    for (let i = 0; i < 20; i++) state = review(state, "again", now);
    expect(state.ease).toBe(1.3);

    for (let i = 0; i < 40; i++) state = review(state, "easy", now);
    expect(state.ease).toBe(5);
  });

  it("labels the next interval for each button", () => {
    expect(nextIntervalLabel(undefined, "again", now)).toBe("10m");
    expect(nextIntervalLabel(undefined, "good", now)).toBe("1d");
    expect(nextIntervalLabel(undefined, "easy", now)).toBe("4d");
  });
});

describe("dueItems", () => {
  it("returns overdue cards first and new cards last", () => {
    const items = [
      { id: "new" },
      { id: "later", review: { ease: 2.5, intervalDays: 3, repetitions: 1, dueAt: daysLater(3) } },
      { id: "old", review: { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: daysLater(-2) } },
      { id: "recent", review: { ease: 2.5, intervalDays: 1, repetitions: 1, dueAt: daysLater(-1) } },
    ];

    expect(dueItems(items, now).map((item) => item.id)).toEqual(["old", "recent", "new"]);
    expect(isDue(items[1].review, now)).toBe(false);
  });
});
