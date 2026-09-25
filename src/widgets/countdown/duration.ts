import type { CountdownConfig } from "../../../shared/widgetConfigs";

export type Unit = "days" | "hours" | "minutes" | "seconds";
export type Precision = CountdownConfig["precision"];

export interface Part {
  unit: Unit;
  value: number;
}

export const UNITS: readonly Unit[] = ["days", "hours", "minutes", "seconds"];

export const UNIT_MS: Record<Unit, number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1_000,
};

export const unitLabels: Record<Unit, { one: string; many: string; short: string }> = {
  days: { one: "Day", many: "Days", short: "d" },
  hours: { one: "Hour", many: "Hours", short: "h" },
  minutes: { one: "Minute", many: "Minutes", short: "m" },
  seconds: { one: "Second", many: "Seconds", short: "s" },
};

/** Timestamp of the target; NaN when the string can't be read. */
export function resolveTarget(target: string): number {
  return Date.parse(target);
}

/** True when the target names one instant (Z or offset) rather than local wall-clock time. */
export function isSharedInstant(target: string): boolean {
  return /(Z|[+-]\d{2}:\d{2})$/.test(target);
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** The `datetime-local` input value (local time, minute precision) for a timestamp. */
export function toLocalInput(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Turns a `datetime-local` value into the stored target form. */
export function encodeTarget(localInput: string, shared: boolean): string {
  return shared ? new Date(localInput).toISOString() : localInput;
}

/**
 * Splits the distance to the target into units, from days down to `precision`.
 * Counting down rounds up so the display reaches zero exactly at the target and
 * never shows "0 days" while part of a day is left; counting up rounds down so
 * "1 day since" means a full day has passed.
 */
export function splitDuration(remainingMs: number, precision: Precision): Part[] {
  const step = UNIT_MS[precision];
  const whole = remainingMs >= 0 ? Math.ceil(remainingMs / step) : Math.floor(-remainingMs / step);
  let rest = whole * step;
  return UNITS.slice(0, UNITS.indexOf(precision) + 1).map((unit) => {
    const value = Math.floor(rest / UNIT_MS[unit]);
    rest -= value * UNIT_MS[unit];
    return { unit, value };
  });
}

const MAX_TICK_MS = 60_000;

/** Milliseconds until the displayed value next changes, capped so a throttled tab resyncs. */
export function nextTickDelay(remainingMs: number, precision: Precision): number {
  const step = UNIT_MS[precision];
  const past = remainingMs % step;
  const delay = remainingMs > 0 ? past || step : step - Math.abs(past);
  return Math.min(Math.max(delay, 1), MAX_TICK_MS);
}

export function formatValue(part: Part, padZero: boolean): string {
  return padZero && part.unit !== "days" ? pad2(part.value) : String(part.value);
}

export function labelFor(part: Part, labels: CountdownConfig["labels"]): string {
  const names = unitLabels[part.unit];
  if (labels === "short") return names.short;
  if (labels === "none") return "";
  return part.value === 1 ? names.one : names.many;
}

export type Direction = "down" | "up" | "done";

/** Screen-reader text for the whole timer, e.g. "12 days, 4 hours left". */
export function describe(parts: Part[], direction: Direction): string {
  if (direction === "done") return "Time's up";
  const words = parts
    .map((part) => `${part.value} ${labelFor(part, "long").toLowerCase()}`)
    .join(", ");
  return direction === "down" ? `${words} left` : `${words} since`;
}
