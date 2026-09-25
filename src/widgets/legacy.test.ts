import { describe, expect, it } from "vitest";
import { widgetConfigSchemas } from "../../shared/widgetConfigs";
import { decodeConfig, encodeConfig } from "./configCodec";
import { parseLegacyHash } from "./legacy";

describe("parseLegacyHash", () => {
  it("ignores normal hashes and maps the old home paths", () => {
    expect(parseLegacyHash("")).toBeNull();
    expect(parseLegacyHash("#key=abc")).toBeNull();
    expect(parseLegacyHash("#/")).toBe("home");
    expect(parseLegacyHash("#/notion-widgets")).toBe("home");
  });

  it("parses translator links, dropping unsupported and duplicate languages", () => {
    expect(parseLegacyHash("#/translator?from=en&to=fr&to=fr&to=xx&to=en")).toEqual({
      type: "translator",
      rawConfig: { from: "en", to: ["fr"] },
    });
  });

  it("parses both text-to-speech link styles", () => {
    const perWord = parseLegacyHash("#/text-to-speech?lang=fr&text=eau&lang=ja&text=%E6%B0%B4");
    const fixed = parseLegacyHash("#/text-to-speech/fr?text=eau&text=pain");

    const perWordConfig = widgetConfigSchemas["text-to-speech"].parse(
      perWord && perWord !== "home" ? perWord.rawConfig : null
    );
    const fixedConfig = widgetConfigSchemas["text-to-speech"].parse(
      fixed && fixed !== "home" ? fixed.rawConfig : null
    );

    expect(perWordConfig.entries.map(({ lang, text }) => [lang, text])).toEqual([
      ["fr", "eau"],
      ["ja", "水"],
    ]);
    expect(fixedConfig.fixedLang).toBe("fr");
    expect(fixedConfig.entries.map((entry) => entry.text)).toEqual(["eau", "pain"]);
  });

  it("parses dictionary links with fixed languages and hidden buttons", () => {
    const target = parseLegacyHash(
      "#/dictionary?fixedFrom=fr&fixedTo=en&hotb=true&text=eau&text=vin"
    );
    const config = widgetConfigSchemas.dictionary.parse(
      target && target !== "home" ? target.rawConfig : null
    );

    expect(config.fixedLang).toEqual({ from: "fr", to: "en" });
    expect(config.hideOriginTTS).toBe(true);
    expect(config.hideTranslatedTTS).toBe(false);
    expect(config.words.map(({ from, to, text }) => [from, to, text])).toEqual([
      ["fr", "en", "eau"],
      ["fr", "en", "vin"],
    ]);
  });
});

describe("configCodec", () => {
  it("round-trips unicode config through the URL", () => {
    const config = { words: [{ text: "水 & café #1" }] };
    const params = new URLSearchParams(encodeConfig(config).toString());
    expect(decodeConfig(params)).toEqual(config);
  });

  it("returns undefined for missing or corrupt params", () => {
    expect(decodeConfig(new URLSearchParams())).toBeUndefined();
    expect(decodeConfig(new URLSearchParams({ c: "%%%not-base64" }))).toBeUndefined();
  });
});
