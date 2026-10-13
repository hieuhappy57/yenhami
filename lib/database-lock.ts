import { AsyncLocalStorage } from "node:async_hooks";

const context = new AsyncLocalStorage<{ mutation: boolean }>();
let tail: Promise<void> = Promise.resolve();

export function isDatabaseMutation(): boolean { return context.getStore()?.mutation === true; }
export async function withDatabaseLock<T>(operation: () => Promise<T> | T, mutation = false): Promise<T> {
  if (context.getStore()) return await operation();
  const previous = tail;
  let release!: () => void;
  tail = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try { return await context.run({ mutation }, operation); }
  finally { release(); }
}
