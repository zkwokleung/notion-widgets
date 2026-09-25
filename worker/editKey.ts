const encoder = new TextEncoder();

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  return Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));
}

export function createWidgetId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

export function createEditKey(): string {
  return crypto.randomUUID();
}

export async function hashEditKey(editKey: string): Promise<string> {
  return toHex(await sha256(editKey));
}

export async function verifyEditKey(
  provided: string | undefined,
  storedHash: string
): Promise<boolean> {
  const providedHash = await sha256(provided ?? "");
  const expectedHash = fromHex(storedHash);
  if (expectedHash.byteLength !== providedHash.byteLength) return false;
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}
