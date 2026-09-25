import type { Context } from "hono";

export type AppEnv = { Bindings: Env };

// Cache API writes are no-ops on *.workers.dev; they take effect on a custom domain.
export async function withEdgeCache(
  c: Context<AppEnv>,
  cacheKey: string,
  ttlSeconds: number,
  produce: () => Promise<Response>
): Promise<Response> {
  const cache = caches.default;
  const key = new Request(new URL(cacheKey, c.req.url));

  const hit = await cache.match(key);
  if (hit) return hit;

  const produced = await produce();
  if (!produced.ok) return produced;

  const response = new Response(produced.body, produced);
  response.headers.set("Cache-Control", `public, max-age=${ttlSeconds}`);
  c.executionCtx.waitUntil(cache.put(key, response.clone()));
  return response;
}
