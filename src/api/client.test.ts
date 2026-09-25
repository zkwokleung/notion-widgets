import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, translate, ttsUrl } from "./client";

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Worker translate endpoint with encoded params", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(Response.json({ text: "Bonjour" }))
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(translate("rock & roll #1", "en", "fr")).resolves.toBe("Bonjour");

    const url = new URL(String(fetchMock.mock.calls[0][0]), "http://localhost");
    expect(url.pathname).toBe("/api/translate");
    expect(url.searchParams.get("q")).toBe("rock & roll #1");
  });

  it("surfaces API errors with their status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(Response.json({ error: "nope" }, { status: 502 })))
    );

    await expect(translate("hi", "en", "fr")).rejects.toEqual(
      new ApiRequestError(502, "nope")
    );
  });

  it("builds same-origin TTS URLs", () => {
    expect(ttsUrl("a & b", "fr")).toBe("/api/tts?q=a+%26+b&tl=fr");
  });
});
