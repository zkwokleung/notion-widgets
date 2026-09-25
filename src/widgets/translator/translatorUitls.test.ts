import { afterEach, describe, expect, it, vi } from "vitest";
import { translateTo } from "./translatorUitls";

describe("translateTo", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("encodes the query and joins every sentence segment", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve([
          [
            ["J'aime le rock'n'roll. ", "I like rock & roll. "],
            ["Chanson n°1.", "Song #1."],
          ],
        ]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await translateTo("I like rock & roll. Song #1.", "en", "fr");

    expect(result).toBe("J'aime le rock'n'roll. Chanson n°1.");
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("q")).toBe("I like rock & roll. Song #1.");
    expect(url.searchParams.get("sl")).toBe("en");
    expect(url.searchParams.get("tl")).toBe("fr");
  });
});
