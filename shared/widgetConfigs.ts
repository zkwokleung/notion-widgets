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

export type TranslatorConfig = z.infer<typeof translatorConfigSchema>;
export type SpeechEntry = z.infer<typeof speechEntrySchema>;
export type TextToSpeechConfig = z.infer<typeof textToSpeechConfigSchema>;
export type ReviewState = z.infer<typeof reviewStateSchema>;
export type DictWord = z.infer<typeof dictWordSchema>;
export type DictionaryConfig = z.infer<typeof dictionaryConfigSchema>;
export type TimerConfig = z.infer<typeof timerConfigSchema>;

export const widgetConfigSchemas = {
  translator: translatorConfigSchema,
  "text-to-speech": textToSpeechConfigSchema,
  dictionary: dictionaryConfigSchema,
  timer: timerConfigSchema,
} satisfies Record<WidgetType, z.ZodType>;

export type WidgetConfigMap = {
  [T in WidgetType]: z.infer<(typeof widgetConfigSchemas)[T]>;
};

export const createWidgetBodySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("translator"), config: translatorConfigSchema }),
  z.object({ type: z.literal("text-to-speech"), config: textToSpeechConfigSchema }),
  z.object({ type: z.literal("dictionary"), config: dictionaryConfigSchema }),
  z.object({ type: z.literal("timer"), config: timerConfigSchema }),
]);

export const updateWidgetBodySchema = z.object({ config: z.unknown() });
