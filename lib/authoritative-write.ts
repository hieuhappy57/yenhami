import path from "node:path";

export class PersistenceUnavailableError extends Error {
  readonly status = 503;
  readonly code = "AUTHORITATIVE_STORAGE_REQUIRED";
  constructor() {
    super("Chưa có kho dữ liệu giao dịch được kiểm chứng. Không ghi đơn hoặc tiền vào bộ nhớ tạm. Vui lòng thử lại sau.");
  }
}

export function assertAuthoritativeStorage(): void {
  // A serverless /tmp DB or cloud JSON snapshot cannot be a financial authority.
  if (process.env.VERCEL) throw new PersistenceUnavailableError();
  if (process.env.HAMI_DB_PATH) {
    if (!path.isAbsolute(process.env.HAMI_DB_PATH)) throw new PersistenceUnavailableError();
    return;
  }
  if (process.env.CLOUDFLARE_API_TOKEN || process.env.HAMI_GIST_ID || process.env.HAMI_GITHUB_TOKEN) {
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
