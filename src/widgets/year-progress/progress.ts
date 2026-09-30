import {
  PROGRESS_PERIODS,
  type ProgressPeriod,
  type YearProgressConfig,
} from "../../../shared/widgetConfigs";

export type WeekStart = YearProgressConfig["weekStart"];

export interface Span {
  start: number;
  end: number;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
const MAX_TICK_MS = 60_000;

export function sortPeriods(periods: readonly ProgressPeriod[]): ProgressPeriod[] {
  return PROGRESS_PERIODS.filter((period) => periods.includes(period));
}

export function periodSpan(period: ProgressPeriod, now: number, weekStart: WeekStart): Span {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  switch (period) {
    case "year":
      return { start: +new Date(year, 0, 1), end: +new Date(year + 1, 0, 1) };
    case "quarter": {
      const first = Math.floor(month / 3) * 3;
      return { start: +new Date(year, first, 1), end: +new Date(year, first + 3, 1) };
    }
    case "month":
      return { start: +new Date(year, month, 1), end: +new Date(year, month + 1, 1) };
    case "week": {
      const offset = weekStart === "monday" ? (date.getDay() + 6) % 7 : date.getDay();
      return { start: +new Date(year, month, day - offset), end: +new Date(year, month, day - offset + 7) };
    }
    case "day":
      return { start: +new Date(year, month, day), end: +new Date(year, month, day + 1) };
  }
}

export function elapsedFraction(span: Span, now: number): number {
  return Math.min(1, Math.max(0, (now - span.start) / (span.end - span.start)));
}

export function floorPercent(fraction: number, decimals: number): number {
  const scale = 10 ** decimals;
  return Math.floor(fraction * 100 * scale + 1e-9) / scale;
}

export function formatPercent(fraction: number, decimals: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(floorPercent(fraction, decimals) / 100);
}

export function nextTickDelay(span: Span, now: number, decimals: number): number {
  const step = (span.end - span.start) / (100 * 10 ** decimals);
  const elapsed = now - span.start;
  const next = span.start + (Math.floor(elapsed / step) + 1) * step;
  return Math.min(Math.max(Math.ceil(next - now), 1), MAX_TICK_MS);
}

export interface Dots {
  total: number;
  done: number;
}

export function dotsFor(period: ProgressPeriod, span: Span, now: number): Dots {
  const unit = period === "day" ? HOUR_MS : DAY_MS;
  return {
    total: Math.round((span.end - span.start) / unit),
    done: Math.min(Math.floor((now - span.start) / unit), Math.round((span.end - span.start) / unit)),
  };
}

const dateRange = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const monthName = new Intl.DateTimeFormat(undefined, { month: "long" });
const weekdayName = new Intl.DateTimeFormat(undefined, { weekday: "long" });

export function periodLabel(period: ProgressPeriod, span: Span): string {
  const start = new Date(span.start);
  switch (period) {
    case "year":
      return String(start.getFullYear());
    case "quarter":
      return `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
    case "month":
      return monthName.format(start);
    case "week":
      return dateRange.formatRange(start, new Date(span.end - 1));
    case "day":
      return weekdayName.format(start);
  }
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function remainingLabel(period: ProgressPeriod, span: Span, now: number): string {
  const left = Math.max(0, span.end - now);
  return period === "day"
    ? `${plural(Math.ceil(left / HOUR_MS), "hour")} left`
    : `${plural(Math.ceil(left / DAY_MS), "day")} left`;
}

export const PERIOD_NAMES: Record<ProgressPeriod, string> = {
  year: "Year",
  quarter: "Quarter",
  month: "Month",
  week: "Week",
  day: "Day",
};

export function describe(period: ProgressPeriod, span: Span, now: number, decimals: number): string {
  const percent = formatPercent(elapsedFraction(span, now), decimals);
  return `${PERIOD_NAMES[period]} ${periodLabel(period, span)}: ${percent} elapsed, ${remainingLabel(period, span, now)}`;
}
