import { Hono } from "hono";
import { z } from "zod";
import {
  MAX_TRANSLATE_CHARS,
  langCodeSchema,
  type ApiError,
  type TranslateResponse,
} from "../../shared/api";
import { type AppEnv, withEdgeCache } from "../cache";

const querySchema = z.object({
  q: z.string().min(1).max(MAX_TRANSLATE_CHARS),
  sl: langCodeSchema,
  tl: langCodeSchema,
});

// Only the first element is used: one [translated, original, ...] entry per sentence.
const googleResponseSchema = z
  .tuple([z.array(z.tuple([z.string().nullable()], z.unknown()))], z.unknown());

const ONE_WEEK = 7 * 24 * 60 * 60;

export const translate = new Hono<AppEnv>().get("/", async (c) => {
  const parsed = querySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json<ApiError>({ error: "Expected q, sl and tl query params" }, 400);
  }
  const { q, sl, tl } = parsed.data;
  const params = new URLSearchParams({ client: "gtx", sl, tl, dt: "t", q });

  return withEdgeCache(c, `/api/translate?${params}`, ONE_WEEK, async () => {
    const upstream = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params}`
    );
    if (!upstream.ok) {
      return c.json<ApiError>({ error: `Upstream returned ${upstream.status}` }, 502);
    }

    const body = googleResponseSchema.safeParse(await upstream.json());
    if (!body.success) {
      return c.json<ApiError>({ error: "Unexpected upstream response" }, 502);
    }

    const text = body.data[0].map(([segment]) => segment ?? "").join("");
    return c.json<TranslateResponse>({ text });
  });
});
