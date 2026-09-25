export type ThemeOption = "auto" | "light" | "dark";

export interface DisplayOptions {
  theme: ThemeOption;
  transparent: boolean;
}

const THEME_PARAM = "theme";
const BG_PARAM = "bg";

export function readDisplayOptions(search: URLSearchParams): DisplayOptions {
  const theme = search.get(THEME_PARAM);
  return {
    theme: theme === "light" || theme === "dark" ? theme : "auto",
    transparent: search.get(BG_PARAM) === "transparent",
  };
}

/** Writes display options into `search`, dropping defaults to keep links short. */
export function writeDisplayOptions(search: URLSearchParams, options: DisplayOptions) {
  if (options.theme === "auto") search.delete(THEME_PARAM);
  else search.set(THEME_PARAM, options.theme);

  if (options.transparent) search.set(BG_PARAM, "transparent");
  else search.delete(BG_PARAM);
}

/** The display params of the current page, to carry over onto generated links. */
export function currentDisplaySearch(): URLSearchParams {
  const search = new URLSearchParams();
  writeDisplayOptions(search, readDisplayOptions(new URLSearchParams(window.location.search)));
  return search;
}

/** Applies options to <html>; returns a cleanup that stops following the OS theme. */
export function applyDisplayOptions(options: DisplayOptions): () => void {
  const root = document.documentElement;
  root.dataset.bg = options.transparent ? "transparent" : "";

  if (options.theme !== "auto") {
    root.classList.toggle("dark", options.theme === "dark");
    return () => {};
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => root.classList.toggle("dark", media.matches);
  sync();
  media.addEventListener("change", sync);
  return () => media.removeEventListener("change", sync);
}
