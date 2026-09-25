import type { ApiError, TranslateResponse } from "../../shared/api";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
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

export function ttsUrl(text: string, lang: string): string {
  return `/api/tts?${new URLSearchParams({ q: text, tl: lang })}`;
}
