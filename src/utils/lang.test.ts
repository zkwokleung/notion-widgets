import { describe, expect, it } from "vitest";
import { languageFlag, languageName } from "./lang";

describe("lang", () => {
  it("maps language codes to the flag readers expect", () => {
    expect(languageFlag("en")).toBe("🇬🇧");
    expect(languageFlag("ja")).toBe("🇯🇵");
    expect(languageFlag("fr")).toBe("🇫🇷");
    expect(languageFlag("zh-TW")).toBe("🇹🇼");
  });

  it("names any language code", () => {
    expect(languageName("fr")).toBe("French");
    expect(languageName("zh-TW")).toMatch(/Chinese/);
    expect(languageName("not a code")).toBe("not a code");
  });
});
