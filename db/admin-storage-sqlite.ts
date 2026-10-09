import type { DatabaseSync } from "node:sqlite";
import {
  type AdminSpikeCommand,
  type AdminSpikeResult,
  type AdminSpikeStore,
  computeCommandHash,
  validateCommand,
} from "./admin-storage-contract";

// Isolated spike only: no application route imports this adapter.
export class AdminStorageSqlite implements AdminSpikeStore {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin_spike_aggregates (
        id TEXT PRIMARY KEY,
        balance_vnd INTEGER NOT NULL CHECK (balance_vnd BETWEEN 0 AND 9007199254740991),
        version INTEGER NOT NULL CHECK (version BETWEEN 0 AND 9007199254740991)
      );
      CREATE TABLE IF NOT EXISTS admin_spike_commands (
        idempotency_key TEXT PRIMARY KEY,
        payload_hash TEXT NOT NULL,
        actor TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        balance_vnd INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS admin_spike_audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        delta_vnd INTEGER NOT NULL,
        new_balance_vnd INTEGER NOT NULL,
        version INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  public initAggregate(id: string, initialBalanceVnd: number, initialVersion = 1): void {
    if (typeof id !== "string" || !id.trim() || id.length > 100) {
      throw new Error("Invalid entityId");
    }
    if (!Number.isSafeInteger(initialBalanceVnd) || initialBalanceVnd < 0) {
      throw new Error("Initial balance must be non-negative safe integer");
    }
    if (!Number.isSafeInteger(initialVersion) || initialVersion < 0) {
      throw new Error("Initial version must be non-negative safe integer");
    }
    this.db
      .prepare(`INSERT INTO admin_spike_aggregates (id, balance_vnd, version) VALUES (?, ?, ?)`)
      .run(id, initialBalanceVnd, initialVersion);
  }

  public executeCommand(cmd: AdminSpikeCommand): AdminSpikeResult {
    validateCommand(cmd);
    const hash = computeCommandHash(cmd);

    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existingCmd = this.db
        .prepare(`SELECT payload_hash, version, balance_vnd FROM admin_spike_commands WHERE idempotency_key = ?`)
        .get(cmd.idempotencyKey) as { payload_hash: string; version: number; balance_vnd: number } | undefined;

      if (existingCmd) {
        if (existingCmd.payload_hash !== hash) {
          this.db.exec("ROLLBACK");
          return {
            success: false,
            entityId: cmd.entityId,
            version: -1,
            balanceVnd: -1,
            isReplay: false,
            error: "Key collision: idempotency key reused with different payload",
          };
        }
        this.db.exec("ROLLBACK");
        return {
          success: true,
          entityId: cmd.entityId,
          version: existingCmd.version,
          balanceVnd: existingCmd.balance_vnd,
          isReplay: true,
        };
      }

      const agg = this.db
        .prepare(`SELECT balance_vnd, version FROM admin_spike_aggregates WHERE id = ?`)
        .get(cmd.entityId) as { balance_vnd: number; version: number } | undefined;

      if (!agg) {
        this.db.exec("ROLLBACK");
        return {
          success: false,
          entityId: cmd.entityId,
          version: -1,
          balanceVnd: -1,
          isReplay: false,
          error: "Entity not found",
        };
      }

      if (agg.version !== cmd.expectedVersion) {
        this.db.exec("ROLLBACK");
        return {
          success: false,
          entityId: cmd.entityId,
          version: agg.version,
          balanceVnd: agg.balance_vnd,
          isReplay: false,
          error: "CAS conflict: stale version",
        };
      }

      const nextBalance = agg.balance_vnd + cmd.deltaVnd;
      if (!Number.isSafeInteger(nextBalance) || nextBalance < 0) {
        this.db.exec("ROLLBACK");
        return {
          success: false,
          entityId: cmd.entityId,
          version: agg.version,
          balanceVnd: agg.balance_vnd,
          isReplay: false,
          error: "Invalid resulting balance: negative or overflow",
        };
      }
      const nextVersion = agg.version + 1;
      if (!Number.isSafeInteger(nextVersion)) {
        this.db.exec("ROLLBACK");
        return {
          success: false,
          entityId: cmd.entityId,
          version: agg.version,
          balanceVnd: agg.balance_vnd,
          isReplay: false,
          error: "Version overflow",
        };
      }

      const updateRes = this.db
        .prepare(`UPDATE admin_spike_aggregates SET balance_vnd = ?, version = ? WHERE id = ? AND version = ?`)
        .run(nextBalance, nextVersion, cmd.entityId, agg.version);

      if (Number(updateRes.changes) !== 1) {
        this.db.exec("ROLLBACK");
        return {
          success: false,
          entityId: cmd.entityId,
          version: agg.version,
          balanceVnd: agg.balance_vnd,
          isReplay: false,
          error: "CAS update failed",
        };
      }

      this.db
        .prepare(`INSERT INTO admin_spike_audit_events (actor, entity_id, delta_vnd, new_balance_vnd, version, idempotency_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(cmd.actor, cmd.entityId, cmd.deltaVnd, nextBalance, nextVersion, cmd.idempotencyKey, cmd.timestamp);

      this.db
        .prepare(`INSERT INTO admin_spike_commands (idempotency_key, payload_hash, actor, entity_id, version, balance_vnd, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(cmd.idempotencyKey, hash, cmd.actor, cmd.entityId, nextVersion, nextBalance, cmd.timestamp);

      this.db.exec("COMMIT");
      return {
        success: true,
        entityId: cmd.entityId,
        version: nextVersion,
        balanceVnd: nextBalance,
        isReplay: false,
      };
    } catch (err) {
      try {
        this.db.exec("ROLLBACK");
      } catch {}
      throw err;
    }
  }

  public getAggregate(id: string): { balance_vnd: number; version: number } | undefined {
    return this.db.prepare(`SELECT balance_vnd, version FROM admin_spike_aggregates WHERE id = ?`).get(id) as { balance_vnd: number; version: number } | undefined;
  }

  public getAuditCount(entityId: string): number {
    const row = this.db.prepare(`SELECT COUNT(*) as count FROM admin_spike_audit_events WHERE entity_id = ?`).get(entityId) as { count: number };
    return Number(row?.count ?? 0);
  }

  public getCommandCount(key: string): number {
    const row = this.db.prepare(`SELECT COUNT(*) as count FROM admin_spike_commands WHERE idempotency_key = ?`).get(key) as { count: number };
    return Number(row?.count ?? 0);
  }
}
