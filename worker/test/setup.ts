import { timingSafeEqual } from "node:crypto";
import { beforeEach } from "vitest";

const toBytes = (value: ArrayBuffer | ArrayBufferView) =>
  ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    : new Uint8Array(value);

// Workers-only APIs that Node lacks; backed by real implementations where possible.
crypto.subtle.timingSafeEqual ??= (a, b) => timingSafeEqual(toBytes(a), toBytes(b));

class MemoryCache {
  entries = new Map<string, Response>();

  async match(request: Request) {
    return this.entries.get(request.url)?.clone();
  }

  async put(request: Request, response: Response) {
    this.entries.set(request.url, response);
  }
}

beforeEach(() => {
  Object.assign(globalThis, { caches: { default: new MemoryCache() } });
});
