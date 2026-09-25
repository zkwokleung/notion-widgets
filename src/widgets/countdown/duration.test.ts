import { describe as suite, expect, it } from "vitest";
import {
  describe,
  encodeTarget,
  formatValue,
  isSharedInstant,
  labelFor,
  nextTickDelay,
  resolveTarget,
  splitDuration,
  toLocalInput,
  UNIT_MS,
} from "./duration";

const values = (ms: number, precision: Parameters<typeof splitDuration>[1]) =>
  splitDuration(ms, precision).map((part) => part.value);

suite("splitDuration", () => {
  it("splits a distance into days, hours, minutes and seconds", () => {
    const ms = 2 * UNIT_MS.days + 3 * UNIT_MS.hours + 4 * UNIT_MS.minutes + 5 * UNIT_MS.seconds;
    expect(values(ms, "seconds")).toEqual([2, 3, 4, 5]);
    expect(values(ms, "minutes")).toEqual([2, 3, 5]);
    expect(values(ms, "hours")).toEqual([2, 4]);
    expect(values(ms, "days")).toEqual([3]);
  });

  it("rounds up while counting down, so a partial unit still counts", () => {
    expect(values(1, "seconds")).toEqual([0, 0, 0, 1]);
    expect(values(UNIT_MS.days - 1, "days")).toEqual([1]);
    expect(values(UNIT_MS.days, "days")).toEqual([1]);
    expect(values(UNIT_MS.days + 1, "days")).toEqual([2]);
  });

  it("is all zeros at the target", () => {
    expect(values(0, "seconds")).toEqual([0, 0, 0, 0]);
    expect(values(0, "days")).toEqual([0]);
  });

  it("rounds down while counting up", () => {
    expect(values(-1, "seconds")).toEqual([0, 0, 0, 0]);
    expect(values(-UNIT_MS.seconds, "seconds")).toEqual([0, 0, 0, 1]);
    expect(values(-(UNIT_MS.days + UNIT_MS.hours), "days")).toEqual([1]);
  });
});

suite("nextTickDelay", () => {
  it("waits until the next unit boundary", () => {
    expect(nextTickDelay(5_400, "seconds")).toBe(400);
    expect(nextTickDelay(5_000, "seconds")).toBe(1_000);
    expect(nextTickDelay(UNIT_MS.minutes + 250, "minutes")).toBe(250);
  });

  it("counts up from the last boundary once the target has passed", () => {
    expect(nextTickDelay(-400, "seconds")).toBe(600);
    expect(nextTickDelay(-1_000, "seconds")).toBe(1_000);
    expect(nextTickDelay(0, "seconds")).toBe(1_000);
  });

  it("caps long waits so a throttled tab can resync", () => {
    expect(nextTickDelay(3 * UNIT_MS.days, "days")).toBe(60_000);
    expect(nextTickDelay(-(UNIT_MS.hours + 1), "hours")).toBe(60_000);
  });
});

suite("target encoding", () => {
  it("tells shared instants from local wall-clock times", () => {
    expect(isSharedInstant("2026-12-31T23:59")).toBe(false);
    expect(isSharedInstant("2026-12-31T15:59:00.000Z")).toBe(true);
    expect(isSharedInstant("2026-12-31T23:59:00+08:00")).toBe(true);
  });

  it("reads a local target in the viewer's time zone", () => {
    const local = "2026-12-31T23:59";
    expect(resolveTarget(local)).toBe(new Date(2026, 11, 31, 23, 59).getTime());
    expect(Number.isNaN(resolveTarget("not a date"))).toBe(true);
  });

  it("round-trips through the datetime-local input", () => {
    const local = "2026-03-08T09:05";
    expect(toLocalInput(resolveTarget(local))).toBe(local);
    expect(encodeTarget(local, false)).toBe(local);
    const shared = encodeTarget(local, true);
    expect(isSharedInstant(shared)).toBe(true);
    expect(resolveTarget(shared)).toBe(resolveTarget(local));
  });
});

suite("formatting", () => {
  it("pads everything but days when asked", () => {
    expect(formatValue({ unit: "days", value: 4 }, true)).toBe("4");
    expect(formatValue({ unit: "hours", value: 4 }, true)).toBe("04");
    expect(formatValue({ unit: "hours", value: 4 }, false)).toBe("4");
  });

  it("picks singular, plural, short or no labels", () => {
    expect(labelFor({ unit: "days", value: 1 }, "long")).toBe("Day");
    expect(labelFor({ unit: "days", value: 2 }, "long")).toBe("Days");
    expect(labelFor({ unit: "minutes", value: 2 }, "short")).toBe("m");
    expect(labelFor({ unit: "minutes", value: 2 }, "none")).toBe("");
  });

  it("describes the timer for screen readers", () => {
    const parts = [
      { unit: "days" as const, value: 1 },
      { unit: "hours" as const, value: 2 },
    ];
    expect(describe(parts, "down")).toBe("1 day, 2 hours left");
    expect(describe(parts, "up")).toBe("1 day, 2 hours since");
    expect(describe(parts, "done")).toBe("Time's up");
  });
});
