import {
  Book as BookIcon,
  Translate as TranslateIcon,
  VolumeUp as VolumeUpIcon,
} from "@mui/icons-material";
import { lazy, type ComponentType } from "react";
import type { z } from "zod";
import type { WidgetType } from "../../shared/api";
import {
  widgetConfigSchemas,
  type WidgetConfigMap,
} from "../../shared/widgetConfigs";

export interface WidgetProps<C> {
  config: C;
  onChange: (next: C) => void;
  /** True for read-only links: hide controls that change the saved widget. */
  readOnly: boolean;
}

interface WidgetDefinition<T extends WidgetType> {
  type: T;
  title: string;
  description: string;
  Icon: ComponentType;
  schema: z.ZodType<WidgetConfigMap[T], unknown>;
  Component: ComponentType<WidgetProps<WidgetConfigMap[T]>>;
}

export interface RegisteredWidget {
  type: WidgetType;
  title: string;
  description: string;
  Icon: ComponentType;
  schema: z.ZodType<unknown, unknown>;
  Component: ComponentType<WidgetProps<unknown>>;
}

function defineWidget<T extends WidgetType>(definition: WidgetDefinition<T>) {
  // Erases the config type: the frame only ever passes the Component configs
  // produced by this same definition's schema.
  return definition as unknown as RegisteredWidget;
}

export const widgetDefinitions: RegisteredWidget[] = [
  defineWidget({
    type: "translator",
    title: "Translator",
    description: "Translate text into several languages at once.",
    Icon: TranslateIcon,
    schema: widgetConfigSchemas.translator,
    Component: lazy(() => import("./translator/Translator")),
  }),
  defineWidget({
    type: "text-to-speech",
    title: "Text-to-Speech",
    description: "A list of words or phrases you can listen to.",
    Icon: VolumeUpIcon,
    schema: widgetConfigSchemas["text-to-speech"],
    Component: lazy(() => import("./text-to-speech/TextToSpeech")),
  }),
  defineWidget({
    type: "dictionary",
    title: "Dictionary",
    description: "A vocabulary list with translations and pronunciation.",
    Icon: BookIcon,
    schema: widgetConfigSchemas.dictionary,
    Component: lazy(() => import("./dictionary/Dictionary")),
  }),
];

export function getWidgetDefinition(type: string): RegisteredWidget | undefined {
  return widgetDefinitions.find((definition) => definition.type === type);
}

/** Parses raw config, filling defaults; undefined when it can't be read. */
export function parseConfig(widget: RegisteredWidget, raw: unknown): unknown {
  const parsed = widget.schema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : undefined;
}

export function defaultConfig(widget: RegisteredWidget): unknown {
  return widget.schema.parse({});
}
