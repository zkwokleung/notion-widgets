export class MemoryKV {
  store = new Map<string, string>();

  async get(key: string, type?: "json"): Promise<unknown> {
    const value = this.store.get(key);
    if (value === undefined) return null;
    return type === "json" ? JSON.parse(value) : value;
  }

  async put(key: string, value: string) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

export function createTestEnv() {
  const kv = new MemoryKV();
  const pending: Promise<unknown>[] = [];
  const ctx = {
    waitUntil: (promise: Promise<unknown>) => pending.push(promise),
    passThroughOnException: () => {},
    props: {},
  };

  return {
    kv,
    env: { WIDGETS: kv } as unknown as Env,
    ctx: ctx as unknown as ExecutionContext,
    settle: () => Promise.all(pending),
  };
}
