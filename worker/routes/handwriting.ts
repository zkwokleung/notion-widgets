import { Hono } from "hono";
import { z } from "zod";
import {
  MAX_HANDWRITING_STROKES,
  MAX_STROKE_POINTS,
  langCodeSchema,
  type ApiError,
  type HandwritingResponse,
} from "../../shared/api";
import type { AppEnv } from "../cache";

const coordinates = z.array(z.number().finite()).max(MAX_STROKE_POINTS);

const bodySchema = z.object({
  lang: langCodeSchema,
  width: z.number().positive().max(10_000),
  height: z.number().positive().max(10_000),
  // Each stroke is [xs, ys, timestamps], the shape Google Input Tools expects.
  strokes: z
    .array(z.tuple([coordinates, coordinates, coordinates]))
    .min(1)
    .max(MAX_HANDWRITING_STROKES),
});

const googleResponseSchema = z.tuple([
  z.literal("SUCCESS"),
  z.array(z.tuple([z.string(), z.array(z.string())], z.unknown())),
]);

export const handwriting = new Hono<AppEnv>().post("/", async (c) => {
  const parsed = bodySchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json<ApiError>({ error: "Expected lang, width, height and strokes" }, 400);
  }
  const { lang, width, height, strokes } = parsed.data;

  const upstream = await fetch(
    "https://inputtools.google.com/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        options: "enable_pre_space",
        requests: [
          {
            writing_guide: { writing_area_width: width, writing_area_height: height },
            ink: strokes,
            // Input Tools uses underscores: zh_TW rather than zh-TW.
            language: lang.replace("-", "_"),
          },
        ],
      }),
    }
  );
  if (!upstream.ok) {
    return c.json<ApiError>({ error: `Upstream returned ${upstream.status}` }, 502);
  }

  const body = googleResponseSchema.safeParse(await upstream.json());
  if (!body.success) {
    return c.json<ApiError>({ error: "Unexpected upstream response" }, 502);
  }
  const candidates = body.data[1][0]?.[1] ?? [];
  return c.json<HandwritingResponse>({ candidates: candidates.slice(0, 8) });
});
