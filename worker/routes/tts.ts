import { Hono } from "hono";
import { z } from "zod";
import { MAX_TTS_CHARS, langCodeSchema, type ApiError } from "../../shared/api";
import { type AppEnv, withEdgeCache } from "../cache";

const querySchema = z.object({
  q: z.string().min(1).max(MAX_TTS_CHARS),
  tl: langCodeSchema,
});

const ONE_MONTH = 30 * 24 * 60 * 60;

export const tts = new Hono<AppEnv>().get("/", async (c) => {
  const parsed = querySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json<ApiError>(
      { error: `Expected q (max ${MAX_TTS_CHARS} chars) and tl query params` },
      400
    );
  }
  const { q, tl } = parsed.data;
  const params = new URLSearchParams({ ie: "UTF-8", client: "tw-ob", tl, q });

  return withEdgeCache(c, `/api/tts?${params}`, ONE_MONTH, async () => {
    const upstream = await fetch(
      `https://translate.google.com/translate_tts?${params}`
    );
    if (!upstream.ok || !upstream.body) {
      return c.json<ApiError>({ error: `Upstream returned ${upstream.status}` }, 502);
    }

    return new Response(upstream.body, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  });
});
