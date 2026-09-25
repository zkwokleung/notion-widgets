import { describe, expect, it } from "vitest";
import { langCodeToFlag, langCodeToLanguageName } from "./lang";

describe("lang", () => {
  it("maps language codes to country flags", () => {
    expect(langCodeToFlag("en")).toBe("🇬🇧");
    expect(langCodeToFlag("ja")).toBe("🇯🇵");
    expect(langCodeToFlag("zh-TW")).toBe("🇹🇼");
  });

  it("names languages by their base code", () => {
    expect(langCodeToLanguageName("zh-TW")).toBe("Chinese");
    expect(langCodeToLanguageName("fr")).toBe("French");
  });
});
