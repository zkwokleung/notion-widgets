type TranslateResponse = [[string | null, ...unknown[]][], ...unknown[]];

export function translateTo(
  q: string,
  source: string,
  target: string,
  signal?: AbortSignal
): Promise<string> {
  const params = new URLSearchParams({
    client: "gtx",
    sl: source,
    tl: target,
    dt: "t",
    q,
  });

  const url = `https://translate.googleapis.com/translate_a/single?${params}`;

  return fetch(url, { signal })
    .then((res) => res.json() as Promise<TranslateResponse>)
    // The response splits the text into one segment per sentence.
    .then((res) => res[0].map((segment) => segment[0] ?? "").join(""));
}
