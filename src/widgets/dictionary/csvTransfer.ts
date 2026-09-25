import { langCodeSchema } from "../../../shared/api";
import type { DictWord } from "../../../shared/widgetConfigs";
import { parseDelimited, toCsv } from "@/lib/csv";

export const MAX_WORDS = 1000;
const MAX_WORD_LENGTH = 500;

type LangPair = { from: string; to: string };

const isLangCode = (value: string) => langCodeSchema.safeParse(value).success;
const wordKey = (word: Pick<DictWord, "text" | "from" | "to">) =>
  `${word.from}\u0000${word.to}\u0000${word.text.toLowerCase()}`;

/**
 * Reads pasted text or a CSV/TSV file. The first column is the word; language
 * codes in later columns set from/to, and anything else (e.g. an Anki
 * translation column) is ignored because translations are always live.
 */
export function wordsFromText(
  input: string,
  defaultPair: LangPair,
  existing: DictWord[]
): DictWord[] {
  const rows = parseDelimited(input);
  if (rows[0]?.[0]?.toLowerCase() === "word") rows.shift();

  const seen = new Set(existing.map(wordKey));
  const imported: DictWord[] = [];
  for (const [first = "", ...rest] of rows) {
    const text = first.slice(0, MAX_WORD_LENGTH);
    const [from = defaultPair.from, to = defaultPair.to] = rest.filter(isLangCode);
    const word = { id: crypto.randomUUID(), from, to, text };
    if (!text || seen.has(wordKey(word))) continue;
    if (existing.length + imported.length >= MAX_WORDS) break;
    seen.add(wordKey(word));
    imported.push(word);
  }
  return imported;
}

export function wordsToCsv(
  words: Pick<DictWord, "text" | "from" | "to">[],
  translations: string[]
): string {
  return toCsv([
    ["word", "translation", "from", "to"],
    ...words.map((word, i) => [word.text, translations[i] ?? "", word.from, word.to]),
  ]);
}
