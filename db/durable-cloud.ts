import crypto from "node:crypto";

export type CloudRow = Record<string, string | number | null>;
export interface CloudSnapshot {
  version: number;
  updatedAt: string;
  tables: Record<string, CloudRow[]>;
}
export interface CloudStatement { sql: string; params?: (string | number | null)[] }
interface QueryResult { success?: boolean; results?: CloudRow[]; error?: string }
export class CloudPersistenceError extends Error {
  readonly status = 503;
  readonly code = "CLOUD_PERSISTENCE_UNAVAILABLE";
  constructor(message = "Chưa xác nhận được việc lưu dữ liệu. Vui lòng thử lại với cùng yêu cầu.") { super(message); }
}

const identifier = (value: string) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(value)) throw new Error("Invalid database identifier");
  return `"${value}"`;
};

export function changedRowStatements(before: CloudSnapshot, after: CloudSnapshot, keys: Record<string, string[]>): CloudStatement[] {
  const statements: CloudStatement[] = [];
  for (const [table, pk] of Object.entries(keys)) {
    const rowKey = (row: CloudRow) => JSON.stringify(pk.map((key) => row[key]));
    const prior = new Map((before.tables[table] || []).map((row) => [rowKey(row), row]));
    const next = new Map((after.tables[table] || []).map((row) => [rowKey(row), row]));
    for (const [key, row] of next) {
      if (JSON.stringify(prior.get(key)) === JSON.stringify(row)) continue;
      const columns = Object.keys(row);
      const mutable = columns.filter((column) => !pk.includes(column));
      statements.push({
        sql: `INSERT INTO ${identifier(table)} (${columns.map(identifier).join(",")}) VALUES (${columns.map(() => "?").join(",")}) ON CONFLICT (${pk.map(identifier).join(",")}) ${mutable.length ? `DO UPDATE SET ${mutable.map((column) => `${identifier(column)}=excluded.${identifier(column)}`).join(",")}` : "DO NOTHING"};`,
        params: columns.map((column) => row[column] ?? null),
      });
    }
    // Retain transactional history. Explicit CMS deletions and role revocations are mirrored.
    if (["posts", "job_postings", "products", "product_variants", "staff_roles", "staff_sessions"].includes(table)) {
      for (const [key, row] of prior) if (!next.has(key)) statements.push({
        sql: `DELETE FROM ${identifier(table)} WHERE ${pk.map((column) => `${identifier(column)}=?`).join(" AND ")};`,
        params: pk.map((column) => row[column]),
      });
    }
  }
  return statements;
}

export class DurableCloudStore {
  private schemaReady = false;
  private owner: string | null = null;
  private revision = 0;
  private readonly config: {
    accountId: string; databaseId: string; apiToken: string;
    tableKeys: Record<string, string[]>;
    schema: () => CloudStatement[];
  };
  constructor(config: DurableCloudStore["config"]) { this.config = config; }

  async query(statements: CloudStatement[]): Promise<QueryResult[]> {
    let response: Response;
    try {
      response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/d1/database/${this.config.databaseId}/query`, {
        method: "POST", headers: { Authorization: `Bearer ${this.config.apiToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(statements.length === 1 ? statements[0] : { batch: statements }),
        cache: "no-store", signal: AbortSignal.timeout(20_000),
      });
      const body = await response.json() as { success?: boolean; result?: QueryResult[]; errors?: { message: string }[] };
      if (!response.ok || body.success !== true || !body.result?.length || body.result.some((result) => result.success !== true)) {
        throw new Error(body.errors?.map((error) => error.message).join("; ") || body.result?.find((result) => result.success !== true)?.error || `HTTP ${response.status}`);
      }
      return body.result;
    } catch (error) {
      console.error("D1 persistence request failed", error instanceof Error ? error.message : "Unknown error");
      throw new CloudPersistenceError();
    }
  }

  private async ensureSchema() {
    if (this.schemaReady) return;
    await this.query([{ sql: `CREATE TABLE IF NOT EXISTS hami_persistence_meta (
      id TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0, ready INTEGER NOT NULL DEFAULT 0,
      lock_owner TEXT, lock_until INTEGER NOT NULL DEFAULT 0, updated_at TEXT
    ); CREATE TABLE IF NOT EXISTS hami_commit_guard (id TEXT PRIMARY KEY, allowed INTEGER NOT NULL CHECK(allowed=1));
    CREATE TABLE IF NOT EXISTS hami_backup_health(id TEXT PRIMARY KEY,last_success_at TEXT,last_error TEXT,object_key TEXT);
    CREATE TABLE IF NOT EXISTS hami_backup_jobs(id TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at INTEGER NOT NULL DEFAULT 0,claim_owner TEXT,claim_until INTEGER NOT NULL DEFAULT 0,last_error TEXT);
    INSERT OR IGNORE INTO hami_persistence_meta(id) VALUES('main');` }]);
    const schema = this.config.schema();
    const creates = schema.filter((statement) => !statement.sql.startsWith("--column:"));
    for (let offset = 0; offset < creates.length; offset += 30) await this.query(creates.slice(offset, offset + 30));
    // Existing D1 databases may predate columns added locally. Migrate additively.
    const columnTables = Object.keys(this.config.tableKeys).filter(table => schema.some(statement => statement.sql.startsWith(`--column:${table}:`)));
    const remoteColumns = columnTables.length ? await this.query(columnTables.map(table => ({sql:`PRAGMA table_info(${identifier(table)});`}))) : [];
    if (remoteColumns.length!==columnTables.length) throw new CloudPersistenceError();
    const additions: CloudStatement[] = [];
    for (const [index, table] of columnTables.entries()) {
      const localColumns = schema.filter((statement) => statement.sql.startsWith(`--column:${table}:`));
      if (!localColumns.length) continue;
      const remote = remoteColumns[index];
      const names = new Set((remote.results || []).map((column) => column.name));
      for (const column of localColumns) {
        const name = column.sql.split(":")[2].split("\n")[0];
        if (!names.has(name)) additions.push({ sql: column.sql.split("\n").slice(1).join("\n") });
      }
    }
    for (let offset=0;offset<additions.length;offset+=30) await this.query(additions.slice(offset,offset+30));
    if (this.config.tableKeys.order_requests) await this.query([
      {sql:"CREATE UNIQUE INDEX IF NOT EXISTS durable_order_reference ON order_requests(reference_code);"},
      {sql:"CREATE UNIQUE INDEX IF NOT EXISTS durable_order_idempotency ON order_requests(idempotency_key);"},
      {sql:"CREATE UNIQUE INDEX IF NOT EXISTS durable_payment_idempotency ON payment_entries(idempotency_key);"},
      {sql:"CREATE INDEX IF NOT EXISTS durable_order_created ON order_requests(created_at);"},
      {sql:"CREATE INDEX IF NOT EXISTS durable_order_customer ON order_requests(buyer_phone,created_at);"},
      {sql:"CREATE INDEX IF NOT EXISTS durable_order_status ON order_requests(order_status,requested_date);"},
      {sql:"CREATE INDEX IF NOT EXISTS durable_order_items ON order_items(order_request_id);"},
      {sql:"CREATE INDEX IF NOT EXISTS durable_status_history ON order_status_history(order_request_id,created_at);"},
    ]);
    this.schemaReady = true;
  }

  async acquire(): Promise<boolean> {
    await this.ensureSchema();
    const owner = crypto.randomUUID();
    const deadline = Date.now() + 12_000;
    do {
      const [result] = await this.query([{ sql: `UPDATE hami_persistence_meta SET lock_owner=?, lock_until=?
        WHERE id='main' AND (lock_owner IS NULL OR lock_until < ?) RETURNING revision,ready;`, params: [owner, Date.now() + 120_000, Date.now()] }]);
      if (result.results?.length) { this.owner = owner; this.revision = Number(result.results[0].revision); return Number(result.results[0].ready)===1; }
      await new Promise((resolve) => setTimeout(resolve, 150));
    } while (Date.now() < deadline);
    throw new CloudPersistenceError("Hệ thống đang xử lý yêu cầu khác. Vui lòng thử lại với cùng yêu cầu.");
  }

  async release(): Promise<void> {
    const owner = this.owner;
    this.owner = null;
    if (owner) await this.query([{ sql: "UPDATE hami_persistence_meta SET lock_owner=NULL, lock_until=0 WHERE id='main' AND lock_owner=?;", params: [owner] }]);
  }

  async recordBackup(objectKey: string | null, error: string | null): Promise<void> {
    await this.query([{sql:`INSERT INTO hami_backup_health(id,last_success_at,last_error,object_key) VALUES('main',?,?,?)
      ON CONFLICT(id) DO UPDATE SET last_success_at=COALESCE(excluded.last_success_at,hami_backup_health.last_success_at),
      last_error=excluded.last_error,object_key=COALESCE(excluded.object_key,hami_backup_health.object_key);`,
      params:[error ? null : new Date().toISOString(),error,objectKey]}]);
  }

  async health() {
    const [result] = await this.query([{sql:"SELECT last_success_at,last_error,object_key FROM hami_backup_health WHERE id='main';"}]);
    return result.results?.[0] || null;
  }

  async isReady(): Promise<boolean> {
    await this.ensureSchema();
    const [result] = await this.query([{ sql: "SELECT ready, revision FROM hami_persistence_meta WHERE id='main';" }]);
    return Number(result.results?.[0]?.ready) === 1;
  }

  async read(): Promise<CloudSnapshot> {
    await this.ensureSchema();
    const tables: CloudSnapshot["tables"] = {};
    const tableNames = Object.keys(this.config.tableKeys);
    const results = await this.query(tableNames.map((table) => ({ sql: `SELECT * FROM ${identifier(table)};` })));
    if (results.length !== tableNames.length) throw new CloudPersistenceError();
    tableNames.forEach((table, index) => { tables[table] = results[index].results || []; });
    return { version: 2, updatedAt: new Date().toISOString(), tables };
  }

  private guard(commitId: string): CloudStatement {
    if (!this.owner) throw new CloudPersistenceError("Thiếu khóa ghi dữ liệu dùng chung.");
    return { sql: `INSERT INTO hami_commit_guard(id,allowed) VALUES(?, CASE WHEN EXISTS(
      SELECT 1 FROM hami_persistence_meta WHERE id='main' AND lock_owner=? AND lock_until>=? AND revision=?
    ) THEN 1 ELSE 0 END);`, params: [commitId, this.owner, Date.now(), this.revision] };
  }

  async commit(before: CloudSnapshot, after: CloudSnapshot, initializing = false, backupPayload?: string, releaseLease=false): Promise<void> {
    const changes = changedRowStatements(before, after, this.config.tableKeys);
    // Initialization can be large. Keep it unpublished until every migration batch succeeds.
    const batches = initializing ? Array.from({ length: Math.max(1, Math.ceil(changes.length / 40)) }, (_, index) => changes.slice(index * 40, (index + 1) * 40)) : [changes];
    for (let index = 0; index < batches.length; index++) {
      const commitId = crypto.randomUUID();
      const finish = initializing && index === batches.length - 1;
      const releasing=releaseLease && index===batches.length-1;
      const statements: CloudStatement[] = [this.guard(commitId), ...batches[index],
        ...(backupPayload ? [{sql:"INSERT INTO hami_backup_jobs(id,payload,created_at) VALUES(?,?,?);",params:[commitId,backupPayload,after.updatedAt]}] : []), {
        sql: `UPDATE hami_persistence_meta SET revision=revision+1, ready=CASE WHEN ?=1 THEN 1 ELSE ready END,
          updated_at=?, lock_until=?,lock_owner=CASE WHEN ?=1 THEN NULL ELSE lock_owner END
          WHERE id='main' AND lock_owner=? AND revision=? RETURNING revision;`,
        params: [finish ? 1 : 0, after.updatedAt, releasing ? 0 : Date.now() + 120_000,releasing ? 1 : 0, this.owner, this.revision],
      }, { sql: "DELETE FROM hami_commit_guard WHERE id=?;", params: [commitId] }];
      const results = await this.query(statements);
      const acknowledged = results[results.length - 2]?.results?.[0]?.revision;
      if (results.length !== statements.length || Number(acknowledged) !== this.revision + 1) throw new CloudPersistenceError();
      this.revision += 1;
      if (releasing) this.owner=null;
    }
  }

  async claimBackupJob() {
    await this.ensureSchema();
    const owner=crypto.randomUUID(),now=Date.now();
    const [result]=await this.query([{sql:`UPDATE hami_backup_jobs SET claim_owner=?,claim_until=?
      WHERE id=(SELECT id FROM hami_backup_jobs WHERE next_attempt_at<=? AND claim_until<=? ORDER BY created_at,id LIMIT 1)
      RETURNING id,payload,attempts;`,params:[owner,now+300_000,now,now]}]);
    const row=result.results?.[0];
    return row ? {id:String(row.id),payload:String(row.payload),attempts:Number(row.attempts),owner} : null;
  }

  async finishBackupJob(job:{id:string;owner:string}) {
    await this.query([{sql:"DELETE FROM hami_backup_jobs WHERE id=? AND claim_owner=?;",params:[job.id,job.owner]}]);
  }

  async retryBackupJob(job:{id:string;owner:string;attempts:number},error:string) {
    const delay=Math.min(6*60*60_000,30_000*2**Math.min(job.attempts,10));
    await this.query([{sql:`UPDATE hami_backup_jobs SET attempts=attempts+1,next_attempt_at=?,last_error=?,claim_owner=NULL,claim_until=0
      WHERE id=? AND claim_owner=?;`,params:[Date.now()+delay,error.slice(0,500),job.id,job.owner]}]);
  }
}
