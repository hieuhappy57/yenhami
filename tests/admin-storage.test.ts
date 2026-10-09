import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { pathToFileURL } from "node:url";
import { AdminStorageSqlite } from "../db/admin-storage-sqlite";
import type { AdminSpikeCommand, AdminSpikeResult } from "../db/admin-storage-contract";

test("admin storage isolated spike test suite", async (t) => {
  const tmpDir = mkdtempSync(join(tmpdir(), "admin-spike-"));
  const dbPath = join(tmpDir, "isolated.db");

  const db1 = new DatabaseSync(dbPath);
  const db2 = new DatabaseSync(dbPath);
  t.after(() => {
    db1.close();
    db2.close();
    rmSync(tmpDir, { recursive: true, force: true });
  });
  const adapter1 = new AdminStorageSqlite(db1);
  const adapter2 = new AdminStorageSqlite(db2);

  await t.test("distinct entity writes: independent aggregate versioning", () => {
    adapter1.initAggregate("order_a", 100000, 1);
    adapter2.initAggregate("order_b", 50000, 1);

    const resA = adapter1.executeCommand({
      actor: "staff_1",
      entityId: "order_a",
      expectedVersion: 1,
      deltaVnd: 20000,
      idempotencyKey: "cmd_a_1",
      timestamp: 1700000001000,
    });
    assert.equal(resA.success, true);
    assert.equal(resA.version, 2);
    assert.equal(resA.balanceVnd, 120000);

    const resB = adapter2.executeCommand({
      actor: "staff_2",
      entityId: "order_b",
      expectedVersion: 1,
      deltaVnd: 10000,
      idempotencyKey: "cmd_b_1",
      timestamp: 1700000001001,
    });
    assert.equal(resB.success, true);
    assert.equal(resB.version, 2);
    assert.equal(resB.balanceVnd, 60000);
  });

  await t.test("stale writer: stale-snapshot interleaving across two connections (not real parallelism)", () => {
    adapter1.initAggregate("order_cas", 100000, 1);

    const snapConn1 = adapter1.getAggregate("order_cas");
    assert.ok(snapConn1);
    assert.equal(snapConn1.version, 1);

    const snapConn2 = adapter2.getAggregate("order_cas");
    assert.ok(snapConn2);
    assert.equal(snapConn2.version, 1);

    const winRes = adapter1.executeCommand({
      actor: "winner",
      entityId: "order_cas",
      expectedVersion: snapConn1.version,
      deltaVnd: 50000,
      idempotencyKey: "cmd_cas_win",
      timestamp: 1700000002000,
    });
    assert.equal(winRes.success, true);
    assert.equal(winRes.version, 2);
    assert.equal(winRes.balanceVnd, 150000);

    const auditCountBeforeStale = adapter2.getAuditCount("order_cas");
    const staleRes = adapter2.executeCommand({
      actor: "stale_loser",
      entityId: "order_cas",
      expectedVersion: snapConn2.version,
      deltaVnd: 30000,
      idempotencyKey: "cmd_cas_stale",
      timestamp: 1700000002500,
    });
    assert.equal(staleRes.success, false);
    assert.match(staleRes.error ?? "", /CAS conflict/);
    assert.equal(adapter2.getAuditCount("order_cas"), auditCountBeforeStale);
    assert.equal(adapter2.getCommandCount("cmd_cas_stale"), 0);
  });

  await t.test("exact replay: returns original result without version or balance bump", () => {
    const first = adapter1.executeCommand({
      actor: "staff_1",
      entityId: "order_cas",
      expectedVersion: 2,
      deltaVnd: 10000,
      idempotencyKey: "cmd_replay_1",
      timestamp: 1700000003000,
    });
    assert.equal(first.success, true);
    assert.equal(first.version, 3);
    assert.equal(first.isReplay, false);

    const auditCount = adapter2.getAuditCount("order_cas");
    const replay = adapter2.executeCommand({
      actor: "staff_1",
      entityId: "order_cas",
      expectedVersion: 2,
      deltaVnd: 10000,
      idempotencyKey: "cmd_replay_1",
      timestamp: 1700000003000,
    });
    assert.equal(replay.success, true);
    assert.equal(replay.isReplay, true);
    assert.equal(replay.version, 3);
    assert.equal(replay.balanceVnd, first.balanceVnd);
    assert.equal(adapter2.getAuditCount("order_cas"), auditCount);
  });

  await t.test("key identity includes every command field", () => {
    const original: AdminSpikeCommand = {
      actor: "staff_1", entityId: "order_cas", expectedVersion: 2,
      deltaVnd: 10000, idempotencyKey: "cmd_replay_1", timestamp: 1700000003000,
    };
    for (const change of [
      { actor: "other" }, { entityId: "order_b" }, { expectedVersion: 999 },
      { deltaVnd: 10001 }, { timestamp: 1700000003001 },
    ]) {
      const result = adapter1.executeCommand({ ...original, ...change });
      assert.equal(result.success, false);
      assert.match(result.error ?? "", /Key collision/);
    }
    assert.equal(adapter1.getAggregate("order_cas")?.version, 3);
    assert.equal(adapter1.getAuditCount("order_cas"), 2);
  });

  await t.test("key collision: rejects reuse of idempotency key with different payload", () => {
    const collisionRes = adapter1.executeCommand({
      actor: "imposter",
      entityId: "order_cas",
      expectedVersion: 3,
      deltaVnd: 99999,
      idempotencyKey: "cmd_replay_1",
      timestamp: 1700000004000,
    });
    assert.equal(collisionRes.success, false);
    assert.match(collisionRes.error ?? "", /Key collision/);
  });

  await t.test("valid inputs cannot overflow resulting balance or version", () => {
    const command = { actor: "staff", deltaVnd: 1, expectedVersion: 1, timestamp: 1 };
    adapter1.initAggregate("balance_limit", Number.MAX_SAFE_INTEGER);
    const balance = adapter1.executeCommand({ ...command, entityId: "balance_limit", idempotencyKey: "balance_limit" });
    assert.equal(balance.success, false);
    assert.match(balance.error ?? "", /overflow/);
    adapter1.initAggregate("version_limit", 0, Number.MAX_SAFE_INTEGER);
    const version = adapter1.executeCommand({ ...command, expectedVersion: Number.MAX_SAFE_INTEGER, entityId: "version_limit", idempotencyKey: "version_limit" });
    assert.equal(version.success, false);
    assert.match(version.error ?? "", /Version overflow/);
    for (const entity of ["balance_limit", "version_limit"]) {
      assert.equal(adapter1.getAuditCount(entity), 0);
      assert.equal(adapter1.getCommandCount(entity), 0);
    }
  });

  await t.test("invalid command types and fractional values fail before mutation", () => {
    const command = { actor: "staff", entityId: "order_a", expectedVersion: 2, deltaVnd: 1, idempotencyKey: "invalid", timestamp: 1 };
    for (const change of [
      { actor: " " }, { entityId: "" }, { idempotencyKey: "x".repeat(101) },
      { expectedVersion: -1 }, { deltaVnd: 0.5 }, { deltaVnd: NaN },
      { deltaVnd: Infinity }, { timestamp: 0 },
    ]) assert.throws(() => adapter1.executeCommand({ ...command, ...change }));
    assert.throws(() => adapter1.initAggregate("", 0));
    assert.equal(adapter1.getAggregate("order_a")?.balance_vnd, 120000);
    assert.equal(adapter1.getCommandCount("invalid"), 0);
  });

  await t.test("missing entity: returns failure without audit or command records", () => {
    const res = adapter1.executeCommand({
      actor: "staff_1",
      entityId: "nonexistent_entity",
      expectedVersion: 1,
      deltaVnd: 10000,
      idempotencyKey: "cmd_missing",
      timestamp: 1700000005000,
    });
    assert.equal(res.success, false);
    assert.match(res.error ?? "", /Entity not found/);
    assert.equal(adapter1.getCommandCount("cmd_missing"), 0);
    assert.equal(adapter1.getAuditCount("nonexistent_entity"), 0);
  });

  await t.test("safe integer and balance validation: rejects overflow and negative balance", () => {
    assert.throws(() => {
      adapter1.executeCommand({
        actor: "staff_1",
        entityId: "order_cas",
        expectedVersion: 3,
        deltaVnd: Number.MAX_SAFE_INTEGER + 10,
        idempotencyKey: "cmd_overflow",
        timestamp: 1700000006000,
      });
    }, /Invalid deltaVnd/);

    const negRes = adapter1.executeCommand({
      actor: "staff_1",
      entityId: "order_cas",
      expectedVersion: 3,
      deltaVnd: -999999999,
      idempotencyKey: "cmd_neg_bal",
      timestamp: 1700000006001,
    });
    assert.equal(negRes.success, false);
    assert.match(negRes.error ?? "", /negative or overflow/);
  });

  await t.test("audit failure rollback: trigger error rolls back aggregate mutation", () => {
    adapter1.initAggregate("order_trig", 200000, 1);
    db1.exec(`
      CREATE TRIGGER abort_audit_insert BEFORE INSERT ON admin_spike_audit_events
      WHEN NEW.entity_id = 'order_trig'
      BEGIN
        SELECT RAISE(ABORT, 'Simulated audit table disk failure');
      END;
    `);

    assert.throws(() => {
      adapter1.executeCommand({
        actor: "staff_1",
        entityId: "order_trig",
        expectedVersion: 1,
        deltaVnd: 50000,
        idempotencyKey: "cmd_trig_fail",
        timestamp: 1700000007000,
      });
    }, /Simulated audit table disk failure/);

    const agg = adapter1.getAggregate("order_trig");
    assert.ok(agg);
    assert.equal(agg.version, 1);
    assert.equal(agg.balance_vnd, 200000);
    assert.equal(adapter1.getCommandCount("cmd_trig_fail"), 0);
  });

  await t.test("durable reopen: persists across newly opened connection", () => {
    const dbReopened = new DatabaseSync(dbPath);
    const adapterReopened = new AdminStorageSqlite(dbReopened);

    const agg = adapterReopened.getAggregate("order_cas");
    assert.ok(agg);
    assert.equal(agg.version, 3);
    assert.equal(adapterReopened.getCommandCount("cmd_replay_1"), 1);
    dbReopened.close();
  });

  await t.test("simultaneous workers prevent lost updates and duplicate commands", { timeout: 15000 }, async (s) => {
    const runPair = async (commands: AdminSpikeCommand[]) => {
      const gate = new SharedArrayBuffer(4);
      let readyCount = 0;
      return Promise.all(commands.map((command) => new Promise<AdminSpikeResult>((resolve, reject) => {
        const worker = new Worker(`
          const { parentPort, workerData } = require("node:worker_threads");
          const { DatabaseSync } = require("node:sqlite");
          (async () => {
            await import(workerData.registerUrl);
            const { AdminStorageSqlite } = await import(workerData.moduleUrl);
            const db = new DatabaseSync(workerData.dbPath);
            db.exec("PRAGMA busy_timeout = 5000");
            try {
              const adapter = new AdminStorageSqlite(db);
              parentPort.postMessage({ ready: true });
              Atomics.wait(new Int32Array(workerData.gate), 0, 0);
              parentPort.postMessage({ result: adapter.executeCommand(workerData.command) });
            } finally { db.close(); }
          })().catch(error => { throw error; });
        `, { eval: true, workerData: {
          dbPath, command, gate,
          registerUrl: pathToFileURL(join(process.cwd(), "tests/register-ts.mjs")).href,
          moduleUrl: pathToFileURL(join(process.cwd(), "db/admin-storage-sqlite.ts")).href,
        } });
        s.after(() => worker.terminate());
        let result: AdminSpikeResult | undefined;
        worker.on("error", reject);
        worker.on("message", (message) => {
          if (message.ready && ++readyCount === 2) {
            Atomics.store(new Int32Array(gate), 0, 1);
            Atomics.notify(new Int32Array(gate), 0, 2);
          }
          if (message.result) result = message.result;
        });
        worker.on("exit", code => code === 0 && result ? resolve(result) : reject(new Error(`Worker exited ${code} without result`)));
      })));
    };
    adapter1.initAggregate("race", 100);
    const cmd = { actor: "staff", entityId: "race", expectedVersion: 1, deltaVnd: 10, timestamp: 1, idempotencyKey: "race_a" };
    const distinct = await runPair([cmd, { ...cmd, idempotencyKey: "race_b" }]);
    assert.equal(distinct.filter(r => r.success).length, 1);
    assert.equal(adapter1.getAggregate("race")?.balance_vnd, 110);
    assert.equal(adapter1.getAuditCount("race"), 1);
    adapter1.initAggregate("duplicate", 100);
    const duplicate = { ...cmd, entityId: "duplicate", idempotencyKey: "duplicate" };
    const identical = await runPair([duplicate, duplicate]);
    assert.ok(identical.every(r => r.success));
    assert.equal(identical.filter(r => r.isReplay).length, 1);
    assert.equal(adapter1.getAggregate("duplicate")?.balance_vnd, 110);
    assert.equal(adapter1.getAuditCount("duplicate"), 1);
  });
});
