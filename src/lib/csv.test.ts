import { describe, expect, it } from "vitest";
import { parseDelimited, toCsv } from "./csv";

describe("csv", () => {
  it("parses quoted CSV with commas, quotes and newlines", () => {
    const input = 'word,from,to\r\n"bonjour, toi",fr,en\n"say ""hi""",en,fr\n"two\nlines",en,ja\n';
    expect(parseDelimited(input)).toEqual([
      ["word", "from", "to"],
      ["bonjour, toi", "fr", "en"],
      ['say "hi"', "en", "fr"],
      ["two\nlines", "en", "ja"],
    ]);
  });

  it("prefers tabs for pasted spreadsheet/Anki data and skips blank lines", () => {
    expect(parseDelimited("\uFEFFeau\twater\n\n  vin \twine")).toEqual([
      ["eau", "water"],
      ["vin", "wine"],
    ]);
  });

  it("round-trips through toCsv", () => {
    const rows = [
      ["word", "note"],
      ['a "quoted", value', "line\nbreak"],
    ];
    expect(parseDelimited(toCsv(rows))).toEqual(rows);
  });
});
