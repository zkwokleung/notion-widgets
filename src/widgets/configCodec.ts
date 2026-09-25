const CONFIG_PARAM = "c";

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

export function encodeConfig(config: unknown): URLSearchParams {
  const json = JSON.stringify(config);
  return new URLSearchParams({
    [CONFIG_PARAM]: toBase64Url(new TextEncoder().encode(json)),
  });
}

/** Returns undefined when the param is missing or unreadable. */
export function decodeConfig(search: URLSearchParams): unknown {
  const encoded = search.get(CONFIG_PARAM);
  if (!encoded) return undefined;
  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(encoded)));
  } catch {
    return undefined;
  }
}
