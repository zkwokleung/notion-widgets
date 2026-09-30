import { z } from "zod";
import { langCodeSchema, type WidgetType } from "./api";

const rowId = z.string().min(1).max(64);

export const translatorConfigSchema = z.object({
  from: langCodeSchema.default("en"),
  to: z.array(langCodeSchema).max(20).default(["fr", "ja"]),
});

export const speechEntrySchema = z.object({
  id: rowId,
  lang: langCodeSchema,
  text: z.string().max(200),
});

export const textToSpeechConfigSchema = z.object({
  fixedLang: langCodeSchema.nullable().default(null),
  rate: z.number().min(0.5).max(2).default(1),
  entries: z.array(speechEntrySchema).max(500).default([]),
});

export const reviewStateSchema = z.object({
  ease: z.number().min(1.3).max(5),
  intervalDays: z.number().min(0),
  repetitions: z.number().int().min(0),
  dueAt: z.string(),
});

export const dictWordSchema = z.object({
  id: rowId,
  from: langCodeSchema,
  to: langCodeSchema,
  text: z.string().max(500),
  review: reviewStateSchema.optional(),
});

export const dictionaryConfigSchema = z.object({
  fixedLang: z
    .object({ from: langCodeSchema, to: langCodeSchema })
    .nullable()
    .default(null),
  hideOriginTTS: z.boolean().default(false),
  hideTranslatedTTS: z.boolean().default(false),
  rate: z.number().min(0.5).max(2).default(1),
  words: z.array(dictWordSchema).max(1000).default([]),
});

export const timerConfigSchema = z.object({
  focusMinutes: z.number().int().min(1).max(180).default(25),
  shortBreakMinutes: z.number().int().min(1).max(60).default(5),
  longBreakMinutes: z.number().int().min(1).max(120).default(15),
  sessionsBeforeLongBreak: z.number().int().min(1).max(12).default(4),
});

export const whiteboardConfigSchema = z.object({
  lang: langCodeSchema.default("ja"),
  translateTo: langCodeSchema.default("en"),
  text: z.string().max(500).default(""),
});

export const WIDGET_FONTS = ["system", "serif", "mono", "display", "rounded", "script"] as const;
export const WIDGET_COLORS = [
  "default",
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
] as const;

// ISO 8601 date-time: with a Z or offset it is one instant for every viewer; without,
// Date.parse reads it as the viewer's local wall-clock time.
const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/;
const hexColor = /^#[0-9a-f]{6}$/i;

export const appearanceFields = {
  size: z.enum(["sm", "md", "lg"]).default("md"),
  font: z.enum(WIDGET_FONTS).default("system"),
  /** A preset name or a #rrggbb colour. */
  color: z
    .string()
    .refine(
      (value) => (WIDGET_COLORS as readonly string[]).includes(value) || hexColor.test(value),
      "Not a colour"
    )
    .default("default"),
};

export const appearanceSchema = z.object(appearanceFields);

export const countdownConfigSchema = z.object({
  title: z.string().max(80).default("New Year"),
  target: z
    .string()
    .regex(isoDateTime)
    .refine((value) => !Number.isNaN(Date.parse(value)), "Not a valid date")
    .default(() => `${new Date().getFullYear() + 1}-01-01T00:00`),
  doneMessage: z.string().max(120).default("It's time!"),
  afterEnd: z.enum(["message", "countUp"]).default("message"),
  layout: z.enum(["tiles", "plain", "inline"]).default("tiles"),
  precision: z.enum(["days", "hours", "minutes", "seconds"]).default("seconds"),
  labels: z.enum(["long", "short", "none"]).default("long"),
  padZero: z.boolean().default(true),
  ...appearanceFields,
});

export const PROGRESS_PERIODS = ["year", "quarter", "month", "week", "day"] as const;

export const yearProgressConfigSchema = z.object({
  title: z.string().max(80).default(""),
  periods: z.array(z.enum(PROGRESS_PERIODS)).min(1).max(PROGRESS_PERIODS.length).default(["year"]),
  style: z.enum(["bar", "ring", "dots"]).default("bar"),
  decimals: z.number().int().min(0).max(2).default(1),
  showRemaining: z.boolean().default(true),
  weekStart: z.enum(["monday", "sunday"]).default("monday"),
  ...appearanceFields,
});

export const MAX_CLOCKS = 12;

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

export const clockSchema = z.object({
  id: rowId,
  timeZone: z.string().max(64).refine(isValidTimeZone, "Unknown time zone"),
  /** Empty shows the zone's city name. */
  label: z.string().max(40).default(""),
});

const DEFAULT_ZONES = ["Europe/London", "America/New_York", "Asia/Tokyo"];

function defaultClocks(): z.output<typeof clockSchema>[] {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const zones = [local, ...DEFAULT_ZONES.filter((zone) => zone !== local)];
  return zones.map((timeZone) => ({ id: crypto.randomUUID(), timeZone, label: "" }));
}

export const worldClockConfigSchema = z.object({
  title: z.string().max(80).default(""),
  clocks: z.array(clockSchema).min(1).max(MAX_CLOCKS).default(defaultClocks),
  layout: z.enum(["list", "grid"]).default("list"),
  hourCycle: z.enum(["auto", "h12", "h23"]).default("auto"),
  showSeconds: z.boolean().default(false),
  showDate: z.boolean().default(true),
  showOffset: z.boolean().default(true),
  ...appearanceFields,
});

export const CLOCK_FACES = ["classic", "minimal", "modern", "roman", "station"] as const;

export const analogClockConfigSchema = z.object({
  title: z.string().max(80).default(""),
  /** null follows the viewer's time zone. */
  timeZone: z.string().max(64).refine(isValidTimeZone, "Unknown time zone").nullable().default(null),
  face: z.enum(CLOCK_FACES).default("classic"),
  showSeconds: z.boolean().default(true),
  showDigital: z.boolean().default(false),
  showDate: z.boolean().default(false),
  ...appearanceFields,
  color: appearanceFields.color.default("red"),
});

export type TranslatorConfig = z.infer<typeof translatorConfigSchema>;
export type SpeechEntry = z.infer<typeof speechEntrySchema>;
export type TextToSpeechConfig = z.infer<typeof textToSpeechConfigSchema>;
export type ReviewState = z.infer<typeof reviewStateSchema>;
export type DictWord = z.infer<typeof dictWordSchema>;
export type DictionaryConfig = z.infer<typeof dictionaryConfigSchema>;
export type TimerConfig = z.infer<typeof timerConfigSchema>;
export type WhiteboardConfig = z.infer<typeof whiteboardConfigSchema>;
export type CountdownConfig = z.infer<typeof countdownConfigSchema>;
export type YearProgressConfig = z.infer<typeof yearProgressConfigSchema>;
export type WorldClockConfig = z.infer<typeof worldClockConfigSchema>;
export type Clock = z.infer<typeof clockSchema>;
export type AnalogClockConfig = z.infer<typeof analogClockConfigSchema>;
export type ClockFace = (typeof CLOCK_FACES)[number];
export type ProgressPeriod = (typeof PROGRESS_PERIODS)[number];
export type Appearance = z.infer<typeof appearanceSchema>;
export type WidgetFont = (typeof WIDGET_FONTS)[number];
export type WidgetColor = (typeof WIDGET_COLORS)[number];

export const widgetConfigSchemas = {
  translator: translatorConfigSchema,
  "text-to-speech": textToSpeechConfigSchema,
  dictionary: dictionaryConfigSchema,
  timer: timerConfigSchema,
  whiteboard: whiteboardConfigSchema,
  countdown: countdownConfigSchema,
  "year-progress": yearProgressConfigSchema,
  "world-clock": worldClockConfigSchema,
  "analog-clock": analogClockConfigSchema,
} satisfies Record<WidgetType, z.ZodType>;

export type WidgetConfigMap = {
  [T in WidgetType]: z.infer<(typeof widgetConfigSchemas)[T]>;
};

export const createWidgetBodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("translator"), config: translatorConfigSchema }),
  z.object({ type: z.literal("text-to-speech"), config: textToSpeechConfigSchema }),
  z.object({ type: z.literal("dictionary"), config: dictionaryConfigSchema }),
  z.object({ type: z.literal("timer"), config: timerConfigSchema }),
  z.object({ type: z.literal("whiteboard"), config: whiteboardConfigSchema }),
  z.object({ type: z.literal("countdown"), config: countdownConfigSchema }),
  z.object({ type: z.literal("year-progress"), config: yearProgressConfigSchema }),
  z.object({ type: z.literal("world-clock"), config: worldClockConfigSchema }),
  z.object({ type: z.literal("analog-clock"), config: analogClockConfigSchema }),
]);

export const updateWidgetBodySchema = z.object({ config: z.unknown() });
