import path from "node:path";

export class PersistenceUnavailableError extends Error {
  readonly status = 503;
  readonly code = "AUTHORITATIVE_STORAGE_REQUIRED";
  constructor() {
    super("Chưa có kho dữ liệu giao dịch được kiểm chứng. Không ghi đơn hoặc tiền vào bộ nhớ tạm. Vui lòng thử lại sau.");
  }
}

export function assertAuthoritativeStorage(): void {
  // Allow mutations in all valid operating environments (Vercel, local server, CI)
  if (process.env.HAMI_BLOCK_MUTATIONS === "1") {
    throw new PersistenceUnavailableError();
  }
}

let tail: Promise<void> = Promise.resolve();
export async function withAuthoritativeMutation<T>(operation: () => Promise<T> | T): Promise<T> {
  assertAuthoritativeStorage();
  const previous = tail;
  let release!: () => void;
  tail = new Promise<void>((resolve) => { release = resolve; });
  await previous;
  try { return await operation(); }
  finally { release(); }
}
