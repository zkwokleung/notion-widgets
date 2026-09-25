import type { WidgetType } from "../../shared/api";
import type {
  DictionaryConfig,
  TextToSpeechConfig,
  TranslatorConfig,
} from "../../shared/widgetConfigs";
import { supportedLanguages } from "../utils/lang";

// Parsers for the pre-2026 hash URLs (e.g. `#/dictionary?from=fr&to=en&text=eau`)
// that are still embedded in existing Notion pages.

function parseTranslator(search: URLSearchParams): TranslatorConfig {
  const rawFrom = search.get("from");
  const from = rawFrom && supportedLanguages.includes(rawFrom) ? rawFrom : "en";
  const to = [
    ...new Set(
      search
        .getAll("to")
        .filter((lang) => supportedLanguages.includes(lang) && lang !== from)
    ),
  ];
  return { from, to };
}

function parseTextToSpeech(
  search: URLSearchParams,
  pathLang?: string
): Partial<TextToSpeechConfig> {
  const texts = search.getAll("text");
  if (pathLang) {
    return {
      fixedLang: pathLang,
      entries: texts.map((text) => ({ id: crypto.randomUUID(), lang: pathLang, text })),
    };
  }

  const langs = search.getAll("lang");
  return {
    fixedLang: null,
    entries: langs
      .map((lang, i) => ({ id: crypto.randomUUID(), lang, text: texts[i] ?? "" }))
      .filter((entry) => entry.lang),
  };
}

function parseDictionary(search: URLSearchParams): Partial<DictionaryConfig> {
  const fixedFrom = search.get("fixedFrom");
  const fixedTo = search.get("fixedTo");
  const fixedLang = fixedFrom && fixedTo ? { from: fixedFrom, to: fixedTo } : null;
  const froms = search.getAll("from");
  const tos = search.getAll("to");

  return {
    fixedLang,
    hideOriginTTS: search.get("hotb") === "true",
    hideTranslatedTTS: search.get("httb") === "true",
    words: search.getAll("text").map((text, i) => ({
      id: crypto.randomUUID(),
      from: froms[i] ?? fixedLang?.from ?? "fr",
      to: tos[i] ?? fixedLang?.to ?? "en",
      text,
    })),
  };
}

export interface LegacyTarget {
  type: WidgetType;
  rawConfig: unknown;
}

/** Maps a legacy `#/<widget>[/<lang>]?<query>` hash to a widget and raw config. */
export function parseLegacyHash(hash: string): LegacyTarget | "home" | null {
  if (!hash.startsWith("#/")) return null;

  const url = new URL(hash.slice(1), "http://legacy.invalid");
  const [widget, pathParam] = url.pathname.split("/").filter(Boolean);
  const search = url.searchParams;

  switch (widget) {
    case undefined:
    case "notion-widgets":
      return "home";
    case "translator":
      return { type: "translator", rawConfig: parseTranslator(search) };
    case "text-to-speech":
      return {
        type: "text-to-speech",
        rawConfig: parseTextToSpeech(search, pathParam),
      };
    case "dictionary":
      return { type: "dictionary", rawConfig: parseDictionary(search) };
    default:
      return null;
  }
}
