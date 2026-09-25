import { z } from "zod";

export const WIDGET_TYPES = [
  "translator",
  "text-to-speech",
  "dictionary",
  "timer",
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

export const MAX_TRANSLATE_CHARS = 5000;
// Google's TTS endpoint rejects longer inputs.
export const MAX_TTS_CHARS = 200;
export const MAX_CONFIG_BYTES = 64 * 1024;

export const langCodeSchema = z.string().regex(/^[a-zA-Z]{2,3}(-[a-zA-Z]{2,4})?$/);

export interface TranslateResponse {
  text: string;
}

export interface WidgetDocument<C = unknown> {
  id: string;
  type: WidgetType;
  config: C;
  updatedAt: string;
}

export interface CreateWidgetResponse {
  id: string;
  editKey: string;
}

export interface ApiError {
  error: string;
}

export const EDIT_KEY_HEADER = "X-Edit-Key";
