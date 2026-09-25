import { Hono, type Context } from "hono";
import type { z } from "zod";
import {
  EDIT_KEY_HEADER,
  MAX_CONFIG_BYTES,
  type ApiError,
  type CreateWidgetResponse,
  type WidgetDocument,
  type WidgetType,
} from "../../shared/api";
import {
  createWidgetBodySchema,
  updateWidgetBodySchema,
  widgetConfigSchemas,
} from "../../shared/widgetConfigs";
import type { AppEnv } from "../cache";
import {
  createEditKey,
  createWidgetId,
  hashEditKey,
  verifyEditKey,
} from "../editKey";

interface StoredWidget {
  type: WidgetType;
  config: unknown;
  editKeyHash: string;
  createdAt: string;
  updatedAt: string;
}

const kvKey = (id: string) => `widget:${id}`;

function toDocument(id: string, stored: StoredWidget): WidgetDocument {
  return {
    id,
    type: stored.type,
    config: stored.config,
    updatedAt: stored.updatedAt,
  };
}

type BodyResult<T> = { data: T } | { response: Response };

async function readBody<T>(
  c: Context<AppEnv>,
  schema: z.ZodType<T>
): Promise<BodyResult<T>> {
  const raw = await c.req.text();
  if (raw.length > MAX_CONFIG_BYTES) {
    return {
      response: c.json<ApiError>({ error: "Widget config is too large" }, 413),
    };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { response: c.json<ApiError>({ error: "Body must be JSON" }, 400) };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return { response: c.json<ApiError>({ error: "Invalid widget body" }, 400) };
  }
  return { data: parsed.data };
}

async function loadAuthorized(
  c: Context<AppEnv>,
  id: string
): Promise<{ stored: StoredWidget } | { response: Response }> {
  const stored = await c.env.WIDGETS.get<StoredWidget>(kvKey(id), "json");
  if (!stored) {
    return { response: c.json<ApiError>({ error: "Widget not found" }, 404) };
  }
  if (!(await verifyEditKey(c.req.header(EDIT_KEY_HEADER), stored.editKeyHash))) {
    return { response: c.json<ApiError>({ error: "Invalid edit key" }, 403) };
  }
  return { stored };
}

export const widgets = new Hono<AppEnv>()
  .post("/", async (c) => {
    const body = await readBody(c, createWidgetBodySchema);
    if ("response" in body) return body.response;

    const id = createWidgetId();
    const editKey = createEditKey();
    const now = new Date().toISOString();
    const stored: StoredWidget = {
      type: body.data.type,
      config: body.data.config,
      editKeyHash: await hashEditKey(editKey),
      createdAt: now,
      updatedAt: now,
    };

    await c.env.WIDGETS.put(kvKey(id), JSON.stringify(stored));
    return c.json<CreateWidgetResponse>({ id, editKey }, 201);
  })

  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const stored = await c.env.WIDGETS.get<StoredWidget>(kvKey(id), "json");
    if (!stored) return c.json<ApiError>({ error: "Widget not found" }, 404);
    return c.json<WidgetDocument>(toDocument(id, stored));
  })

  .put("/:id", async (c) => {
    const id = c.req.param("id");
    const auth = await loadAuthorized(c, id);
    if ("response" in auth) return auth.response;

    const body = await readBody(c, updateWidgetBodySchema);
    if ("response" in body) return body.response;

    const config = widgetConfigSchemas[auth.stored.type].safeParse(body.data.config);
    if (!config.success) {
      return c.json<ApiError>({ error: "Invalid widget config" }, 400);
    }

    const updated: StoredWidget = {
      ...auth.stored,
      config: config.data,
      updatedAt: new Date().toISOString(),
    };
    await c.env.WIDGETS.put(kvKey(id), JSON.stringify(updated));
    return c.json<WidgetDocument>(toDocument(id, updated));
  })

  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const auth = await loadAuthorized(c, id);
    if ("response" in auth) return auth.response;

    await c.env.WIDGETS.delete(kvKey(id));
    return c.body(null, 204);
  });
