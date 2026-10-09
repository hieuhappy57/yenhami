import { createHash } from "node:crypto";

export interface AdminSpikeCommand {
  actor: string;
  entityId: string;
  expectedVersion: number;
  deltaVnd: number;
  idempotencyKey: string;
  timestamp: number;
}

export interface AdminSpikeResult {
  success: boolean;
  entityId: string;
  version: number;
  balanceVnd: number;
  isReplay: boolean;
  error?: string;
}

export interface AdminSpikeStore {
  executeCommand(cmd: AdminSpikeCommand): AdminSpikeResult;
  getAggregate(id: string): { balance_vnd: number; version: number } | undefined;
}

export function validateCommand(cmd: AdminSpikeCommand): void {
  if (!cmd || typeof cmd !== "object") {
    throw new Error("Command must be a non-null object");
  }
  if (typeof cmd.actor !== "string" || !cmd.actor.trim() || cmd.actor.length > 100) {
    throw new Error("Invalid actor: must be non-empty string <= 100 chars");
  }
  if (typeof cmd.entityId !== "string" || !cmd.entityId.trim() || cmd.entityId.length > 100) {
    throw new Error("Invalid entityId: must be non-empty string <= 100 chars");
  }
  if (typeof cmd.idempotencyKey !== "string" || !cmd.idempotencyKey.trim() || cmd.idempotencyKey.length > 100) {
    throw new Error("Invalid idempotencyKey: must be non-empty string <= 100 chars");
  }
  if (!Number.isSafeInteger(cmd.expectedVersion) || cmd.expectedVersion < 0) {
    throw new Error("Invalid expectedVersion: must be safe non-negative integer");
  }
  if (!Number.isSafeInteger(cmd.deltaVnd)) {
    throw new Error("Invalid deltaVnd: must be safe integer");
  }
  if (!Number.isSafeInteger(cmd.timestamp) || cmd.timestamp <= 0) {
    throw new Error("Invalid timestamp: must be positive safe integer ms");
  }
}

export function computeCommandHash(cmd: AdminSpikeCommand): string {
  const canonical = JSON.stringify({
    actor: cmd.actor,
    deltaVnd: cmd.deltaVnd,
    entityId: cmd.entityId,
    expectedVersion: cmd.expectedVersion,
    timestamp: cmd.timestamp,
  });
  return createHash("sha256").update(canonical).digest("hex");
}
