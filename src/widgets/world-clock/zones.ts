import type { Clock, WorldClockConfig } from "../../../shared/widgetConfigs";

type HourCycle = WorldClockConfig["hourCycle"];

const MINUTE_MS = 60_000;
const SECOND_MS = 1_000;

// For browsers without Intl.supportedValuesOf (Safari before 15.4).
const FALLBACK_ZONES = [
  "UTC",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Mexico_City",
  "America/Bogota",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Atlantic/Reykjavik",
  "Europe/London",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Taipei",
  "Asia/Manila",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

export function viewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function zoneOptions(): string[] {
  return typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : FALLBACK_ZONES;
}

export function cityName(zone: string): string {
  return (zone.split("/").pop() ?? zone).replaceAll("_", " ");
}

export function clockName(clock: Clock): string {
  return clock.label || cityName(clock.timeZone);
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale ?? ""}|${JSON.stringify(options)}`;
  let cached = formatters.get(key);
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options);
    formatters.set(key, cached);
  }
  return cached;
}

export function formatTime(now: number, zone: string, hourCycle: HourCycle, showSeconds: boolean): string {
  return formatter(undefined, {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
    ...(showSeconds && { second: "2-digit" }),
    ...(hourCycle !== "auto" && { hourCycle }),
  }).format(now);
}

export function formatDate(now: number, zone: string): string {
  return formatter(undefined, { timeZone: zone, weekday: "short", month: "short", day: "numeric" }).format(now);
}

// Fixed locale so the numeric parts are ASCII digits whatever the viewer's language.
const wallClockParts = (zone: string) =>
  formatter("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });

/** Minutes since the epoch as read off a wall clock in `zone`. */
function wallClockMinutes(now: number, zone: string): number {
  const parts = wallClockParts(zone).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  // Some engines print midnight as 24 with hourCycle h23.
  const hour = part("hour") % 24;
  return Date.UTC(part("year"), part("month") - 1, part("day"), hour, part("minute")) / MINUTE_MS;
}

export interface LocalTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export function localTime(now: number, zone: string): LocalTime {
  const total = wallClockMinutes(now, zone);
  return { hours: Math.floor(total / 60) % 24, minutes: total % 60, seconds: Math.floor(now / SECOND_MS) % 60 };
}

export function localHour(now: number, zone: string): number {
  return localTime(now, zone).hours;
}

export function isDaytime(now: number, zone: string): boolean {
  const hour = localHour(now, zone);
  return hour >= 6 && hour < 18;
}

export interface Offset {
  /** Whole minutes ahead (positive) or behind (negative) the base zone. */
  minutes: number;
  dayShift: -1 | 0 | 1;
}

export function offsetFrom(now: number, zone: string, base: string): Offset {
  const target = wallClockMinutes(now, zone);
  const origin = wallClockMinutes(now, base);
  const dayShift = Math.sign(Math.floor(target / 1440) - Math.floor(origin / 1440)) as Offset["dayShift"];
  return { minutes: target - origin, dayShift };
}

export function offsetLabel({ minutes, dayShift }: Offset): string {
  const parts: string[] = [];
  if (minutes === 0) {
    parts.push("Same time");
  } else {
    const sign = minutes > 0 ? "+" : "−";
    const hours = Math.floor(Math.abs(minutes) / 60);
    const rest = Math.abs(minutes) % 60;
    parts.push(`${sign}${hours}h${rest ? String(rest).padStart(2, "0") : ""}`);
  }
  if (dayShift === 1) parts.push("tomorrow");
  if (dayShift === -1) parts.push("yesterday");
  return parts.join(", ");
}

export function nextTickDelay(now: number, showSeconds: boolean): number {
  const step = showSeconds ? SECOND_MS : MINUTE_MS;
  return step - (now % step) || step;
}

export function describe(clock: Clock, now: number, config: WorldClockConfig, base: string): string {
  const parts = [formatTime(now, clock.timeZone, config.hourCycle, config.showSeconds)];
  if (config.showDate) parts.push(formatDate(now, clock.timeZone));
  if (config.showOffset) parts.push(offsetLabel(offsetFrom(now, clock.timeZone, base)));
  return `${clockName(clock)}: ${parts.join(", ")}`;
}
