import { afterEach, describe, expect, it, vi } from "vitest";
import type { CreateWidgetResponse, WidgetDocument } from "../shared/api";
import { app } from "./index";
import { createTestEnv } from "./test/fakes";

function mockUpstream(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/translate", () => {
  it("encodes the query, joins every sentence and caches the result", async () => {
    const { env, ctx, settle } = createTestEnv();
    const fetchMock = mockUpstream(
      Response.json([[["Bonjour. ", "Hi. "], ["Chanson n°1.", "Song #1."]]])
    );
    const path = `/api/translate?${new URLSearchParams({ q: "Hi. Song #1.", sl: "en", tl: "fr" })}`;

    const first = await app.request(path, {}, env, ctx);
    await settle();
    const second = await app.request(path, {}, env, ctx);

    expect(await first.json()).toEqual({ text: "Bonjour. Chanson n°1." });
    expect(await second.json()).toEqual({ text: "Bonjour. Chanson n°1." });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const upstreamUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(upstreamUrl.searchParams.get("q")).toBe("Hi. Song #1.");
  });

  it("rejects invalid language codes", async () => {
    const { env, ctx } = createTestEnv();
    const res = await app.request("/api/translate?q=hi&sl=en&tl=<x>", {}, env, ctx);
    expect(res.status).toBe(400);
  });

  it("reports upstream failures as 502 without caching them", async () => {
    const { env, ctx } = createTestEnv();
    mockUpstream(new Response("rate limited", { status: 429 }));
    const res = await app.request("/api/translate?q=hi&sl=en&tl=fr", {}, env, ctx);
    expect(res.status).toBe(502);
  });
});

describe("GET /api/tts", () => {
  it("streams audio from upstream", async () => {
    const { env, ctx } = createTestEnv();
    mockUpstream(new Response(new Uint8Array([1, 2, 3])));
    const res = await app.request("/api/tts?q=bonjour&tl=fr", {}, env, ctx);

    expect(res.headers.get("Content-Type")).toBe("audio/mpeg");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("rejects text longer than the upstream limit", async () => {
    const { env, ctx } = createTestEnv();
    const res = await app.request(`/api/tts?q=${"a".repeat(201)}&tl=fr`, {}, env, ctx);
    expect(res.status).toBe(400);
  });
});

describe("/api/widgets", () => {
  const json = (body: unknown, headers: Record<string, string> = {}) => ({
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });

  async function createWidget(env: Env, ctx: ExecutionContext) {
    const res = await app.request(
      "/api/widgets",
      { method: "POST", ...json({ type: "dictionary", config: { words: ["eau"] } }) },
      env,
      ctx
    );
    expect(res.status).toBe(201);
    return (await res.json()) as CreateWidgetResponse;
  }

  it("creates, reads, updates and deletes a widget", async () => {
    const { env, ctx, kv } = createTestEnv();
    const { id, editKey } = await createWidget(env, ctx);

    const read = await app.request(`/api/widgets/${id}`, {}, env, ctx);
    const doc = (await read.json()) as WidgetDocument;
    expect(doc).toMatchObject({ id, type: "dictionary", config: { words: ["eau"] } });
    expect(JSON.stringify(doc)).not.toContain(editKey);
    expect(kv.store.get(`widget:${id}`)).not.toContain(editKey);

    const updated = await app.request(
      `/api/widgets/${id}`,
      { method: "PUT", ...json({ config: { words: ["vin"] } }, { "X-Edit-Key": editKey }) },
      env,
      ctx
    );
    expect(((await updated.json()) as WidgetDocument).config).toEqual({ words: ["vin"] });

    const deleted = await app.request(
      `/api/widgets/${id}`,
      { method: "DELETE", headers: { "X-Edit-Key": editKey } },
      env,
      ctx
    );
    expect(deleted.status).toBe(204);
    expect((await app.request(`/api/widgets/${id}`, {}, env, ctx)).status).toBe(404);
  });

  it("refuses updates without the right edit key", async () => {
    const { env, ctx } = createTestEnv();
    const { id } = await createWidget(env, ctx);

    const attempts: Record<string, string>[] = [{}, { "X-Edit-Key": "wrong" }];
    for (const headers of attempts) {
      const res = await app.request(
        `/api/widgets/${id}`,
        { method: "PUT", ...json({ config: {} }, headers) },
        env,
        ctx
      );
      expect(res.status).toBe(403);
    }
  });

  it("validates the body", async () => {
    const { env, ctx } = createTestEnv();
    const badType = await app.request(
      "/api/widgets",
      { method: "POST", ...json({ type: "nope", config: {} }) },
      env,
      ctx
    );
    const tooLarge = await app.request(
      "/api/widgets",
      { method: "POST", ...json({ type: "timer", config: { x: "a".repeat(70_000) } }) },
      env,
      ctx
    );
    expect(badType.status).toBe(400);
    expect(tooLarge.status).toBe(413);
  });

  it("returns JSON 404 for unknown API routes", async () => {
    const { env, ctx } = createTestEnv();
    const res = await app.request("/api/nope", {}, env, ctx);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found" });
  });
});
