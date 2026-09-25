import { describe, expect, it } from "vitest";
import { parseDelimited } from "@/lib/csv";
import { wordsFromText, wordsToCsv } from "./csvTransfer";

const pair = { from: "fr", to: "en" };
const pick = (words: { text: string; from: string; to: string }[]) =>
  words.map(({ text, from, to }) => [text, from, to]);

describe("wordsFromText", () => {
  it("treats one word per line as the default language pair", () => {
    expect(pick(wordsFromText("eau\npain\n\nvin", pair, []))).toEqual([
      ["eau", "fr", "en"],
      ["pain", "fr", "en"],
      ["vin", "fr", "en"],
    ]);
  });

  it("reads language columns from exported CSV and ignores translations", () => {
    const csv = "word,translation,from,to\r\n水,water,ja,en\r\n\"bonjour, toi\",hello,fr,de\r\n";
    expect(pick(wordsFromText(csv, pair, []))).toEqual([
      ["水", "ja", "en"],
      ["bonjour, toi", "fr", "de"],
    ]);
  });

  it("skips words already in the list, ignoring case", () => {
    const existing = [{ id: "1", from: "fr", to: "en", text: "Eau" }];
    expect(pick(wordsFromText("eau\nvin\nvin", pair, existing))).toEqual([["vin", "fr", "en"]]);
  });
});

describe("wordsToCsv", () => {
  it("exports a header plus word, translation and languages", () => {
    const csv = wordsToCsv([{ text: "eau", from: "fr", to: "en" }], ["water"]);
    expect(parseDelimited(csv)).toEqual([
      ["word", "translation", "from", "to"],
      ["eau", "water", "fr", "en"],
    ]);
  });
});
