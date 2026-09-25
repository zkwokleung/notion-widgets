import { currentDisplaySearch } from "../lib/display";

const storageKey = (id: string) => `notion-widgets:edit-key:${id}`;

export function editKeyFromHash(hash: string): string | undefined {
  return new URLSearchParams(hash.replace(/^#/, "")).get("key") ?? undefined;
}

// Notion embeds run in a partitioned third-party iframe, so storage here is only
// a convenience; the embed link carries the key in its #fragment.
export function loadEditKey(id: string): string | undefined {
  try {
    return localStorage.getItem(storageKey(id)) ?? undefined;
  } catch {
    return undefined;
  }
}

export function rememberEditKey(id: string, editKey: string): void {
  try {
    localStorage.setItem(storageKey(id), editKey);
  } catch {
    // Storage can be blocked in private windows or embeds; the URL still works.
  }
}

/** Root-relative path to a saved widget; `display` carries theme/bg params onto the link. */
export function savedWidgetPath(
  id: string,
  editKey?: string,
  display: URLSearchParams = currentDisplaySearch()
): string {
  const query = display.toString();
  const hash = editKey ? `#${new URLSearchParams({ key: editKey })}` : "";
  return `/w/${encodeURIComponent(id)}${query ? `?${query}` : ""}${hash}`;
}

export function savedWidgetUrl(
  id: string,
  editKey?: string,
  display: URLSearchParams = currentDisplaySearch()
): string {
  return new URL(savedWidgetPath(id, editKey, display), window.location.origin).toString();
}
