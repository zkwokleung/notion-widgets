import { Hono } from "hono";
import type { ApiError } from "../shared/api";
import type { AppEnv } from "./cache";
import { handwriting } from "./routes/handwriting";
import { translate } from "./routes/translate";
import { tts } from "./routes/tts";
import { widgets } from "./routes/widgets";

export const app = new Hono<AppEnv>()
  .basePath("/api")
  .route("/translate", translate)
  .route("/tts", tts)
  .route("/handwriting", handwriting)
  .route("/widgets", widgets);

app.notFound((c) => c.json<ApiError>({ error: "Not found" }, 404));

app.onError((error, c) => {
  console.error(
    JSON.stringify({
      message: error.message,
      stack: error.stack,
      method: c.req.method,
      path: c.req.path,
    })
  );
  return c.json<ApiError>({ error: "Internal error" }, 500);
});

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
