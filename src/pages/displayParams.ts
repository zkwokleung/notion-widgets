import { readDisplayOptions, writeDisplayOptions, type DisplayOptions } from "../lib/display";

export function displaySearch(options: DisplayOptions): URLSearchParams {
  const search = new URLSearchParams();
  writeDisplayOptions(search, options);
  return search;
}

/** Only the display params (theme/bg) of `search`, normalized. */
export function displaySearchOf(search: URLSearchParams): URLSearchParams {
  return displaySearch(readDisplayOptions(search));
}
