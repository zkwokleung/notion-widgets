import { describe as suite, expect, it } from "vitest";
import {
  describe,
  dotsFor,
  elapsedFraction,
  floorPercent,
  formatPercent,
  nextTickDelay,
  periodLabel,
  periodSpan,
  remainingLabel,
  sortPeriods,
} from "./progress";

const local = (year: number, month: number, day: number, hour = 0, minute = 0) =>
  new Date(year, month, day, hour, minute).getTime();
const NOW = local(2026, 8, 29, 6);

suite("periodSpan", () => {
  it("bounds the year, quarter, month and day", () => {
    expect(periodSpan("year", NOW, "monday")).toEqual({ start: local(2026, 0, 1), end: local(2027, 0, 1) });
    expect(periodSpan("quarter", NOW, "monday")).toEqual({ start: local(2026, 6, 1), end: local(2026, 9, 1) });
    expect(periodSpan("month", NOW, "monday")).toEqual({ start: local(2026, 8, 1), end: local(2026, 9, 1) });
    expect(periodSpan("day", NOW, "monday")).toEqual({ start: local(2026, 8, 29), end: local(2026, 8, 30) });
  });

  it("starts the week on Monday or Sunday", () => {
    expect(periodSpan("week", NOW, "monday")).toEqual({ start: local(2026, 8, 28), end: local(2026, 9, 5) });
    expect(periodSpan("week", NOW, "sunday")).toEqual({ start: local(2026, 8, 27), end: local(2026, 9, 4) });
  });

  it("keeps a Sunday inside the Monday-start week that began six days earlier", () => {
    const sunday = local(2026, 9, 4, 12);
    expect(periodSpan("week", sunday, "monday").start).toBe(local(2026, 8, 28));
    expect(periodSpan("week", sunday, "sunday").start).toBe(local(2026, 9, 4));
  });

  it("rolls the quarter and month over at year end", () => {
    const december = local(2026, 11, 15);
    expect(periodSpan("quarter", december, "monday").end).toBe(local(2027, 0, 1));
    expect(periodSpan("month", december, "monday").end).toBe(local(2027, 0, 1));
  });
});

suite("elapsedFraction", () => {
  it("is a quarter of the way through a day at 06:00", () => {
    expect(elapsedFraction(periodSpan("day", NOW, "monday"), NOW)).toBeCloseTo(0.25);
  });

  it("clamps outside the span", () => {
    const span = { start: 100, end: 200 };
    expect(elapsedFraction(span, 50)).toBe(0);
    expect(elapsedFraction(span, 250)).toBe(1);
  });
});

suite("floorPercent", () => {
  it("rounds down to the requested decimals", () => {
    expect(floorPercent(0.72399, 0)).toBe(72);
    expect(floorPercent(0.72399, 1)).toBe(72.3);
    expect(floorPercent(0.72399, 2)).toBe(72.39);
  });

  it("does not reach 100 before the end", () => {
    expect(floorPercent(0.99999, 2)).toBe(99.99);
    expect(floorPercent(1, 2)).toBe(100);
  });

  it("survives float error", () => {
    expect(floorPercent(0.723, 1)).toBe(72.3);
  });
});

suite("formatPercent", () => {
  it("shows the requested decimals", () => {
    expect(formatPercent(0.25, 1)).toMatch(/^25[.,]0\s?%$/);
    expect(formatPercent(0.25, 0)).toMatch(/^25\s?%$/);
  });
});

suite("nextTickDelay", () => {
  it("waits until the next displayed step", () => {
    const span = periodSpan("day", NOW, "monday");
    expect(nextTickDelay(span, span.start, 2)).toBe(8640);
    expect(nextTickDelay(span, span.start + 100, 2)).toBe(8540);
  });

  it("caps long waits so a throttled tab resyncs", () => {
    expect(nextTickDelay(periodSpan("year", NOW, "monday"), NOW, 1)).toBe(60_000);
  });
});

suite("dotsFor", () => {
  it("counts days for long periods and hours for the day", () => {
    expect(dotsFor("year", periodSpan("year", NOW, "monday"), NOW)).toEqual({ total: 365, done: 271 });
    expect(dotsFor("month", periodSpan("month", NOW, "monday"), NOW)).toEqual({ total: 30, done: 28 });
    expect(dotsFor("week", periodSpan("week", NOW, "monday"), NOW)).toEqual({ total: 7, done: 1 });
    expect(dotsFor("day", periodSpan("day", NOW, "monday"), NOW)).toEqual({ total: 24, done: 6 });
  });
});

suite("labels", () => {
  it("names each period", () => {
    expect(periodLabel("year", periodSpan("year", NOW, "monday"))).toBe("2026");
    expect(periodLabel("quarter", periodSpan("quarter", NOW, "monday"))).toBe("Q3 2026");
    expect(periodLabel("month", periodSpan("month", NOW, "monday"))).toBe("September");
    expect(periodLabel("week", periodSpan("week", NOW, "monday"))).toMatch(/28.*4/);
    expect(periodLabel("day", periodSpan("day", NOW, "monday"))).toBe("Tuesday");
  });

  it("rounds the time left up to whole days or hours", () => {
    expect(remainingLabel("year", periodSpan("year", NOW, "monday"), NOW)).toBe("94 days left");
    expect(remainingLabel("day", periodSpan("day", NOW, "monday"), NOW)).toBe("18 hours left");
    expect(remainingLabel("day", periodSpan("day", NOW, "monday"), local(2026, 8, 29, 23, 30))).toBe("1 hour left");
  });

  it("describes a row for screen readers", () => {
    expect(describe("day", periodSpan("day", NOW, "monday"), NOW, 0)).toMatch(/^Day Tuesday: 25\s?% elapsed, 18 hours left$/);
  });
});

suite("sortPeriods", () => {
  it("orders longest first and drops repeats", () => {
    expect(sortPeriods(["day", "year", "day", "week"])).toEqual(["year", "week", "day"]);
  });
});
