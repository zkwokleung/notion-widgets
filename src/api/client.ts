import {
  EDIT_KEY_HEADER,
  type ApiError,
  type CreateWidgetResponse,
  type HandwritingResponse,
  type TranslateResponse,
  type WidgetDocument,
  type WidgetType,
} from "../../shared/api";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Retry network and 5xx failures only; a 4xx will fail the same way again. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const clientError =
    error instanceof ApiRequestError && error.status >= 400 && error.status < 500;
  return !clientError && failureCount < 2;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(res.status, body?.error ?? res.statusText);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export async function translate(
  text: string,
  from: string,
  to: string,
  signal?: AbortSignal
): Promise<string> {
  const params = new URLSearchParams({ q: text, sl: from, tl: to });
  const { text: translated } = await request<TranslateResponse>(
    `/api/translate?${params}`,
    { signal }
  );
  return translated;
}

export type Stroke = [xs: number[], ys: number[], times: number[]];

export async function recognizeHandwriting(
  lang: string,
  size: { width: number; height: number },
  strokes: Stroke[],
  signal?: AbortSignal
): Promise<string[]> {
  const { candidates } = await request<HandwritingResponse>("/api/handwriting", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, ...size, strokes }),
    signal,
  });
  return candidates;
}

export function ttsUrl(text: string, lang: string): string {
  return `/api/tts?${new URLSearchParams({ q: text, tl: lang })}`;
}

export function getWidget<C>(id: string, signal?: AbortSignal) {
  return request<WidgetDocument<C>>(`/api/widgets/${encodeURIComponent(id)}`, {
    signal,
  });
}

export function createWidget(type: WidgetType, config: unknown) {
  return request<CreateWidgetResponse>("/api/widgets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, config }),
  });
}

export function updateWidget<C>(
  id: string,
  editKey: string,
  config: C,
  options: { keepalive?: boolean } = {}
) {
  return request<WidgetDocument<C>>(`/api/widgets/${encodeURIComponent(id)}`, {
    method: "PUT",
    keepalive: options.keepalive,
    headers: { "Content-Type": "application/json", [EDIT_KEY_HEADER]: editKey },
    body: JSON.stringify({ config }),
  });
}
