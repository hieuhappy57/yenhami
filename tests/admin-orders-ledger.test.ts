import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getOrderRequestByReference, recordPaymentEntryByStaff, resetDbConnectionForTest, submitOrderRequest, updateOrderStatusByStaff } from "../db/index";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-order-ledger-"));
const dbPath = path.join(dir, "orders.sqlite");
const createdAt = new Date("2026-10-11T02:00:00.000Z");

describe("admin order ledger and concurrency invariants", () => {
  let referenceCode = "";
  before(() => {
    process.env.HAMI_DB_PATH = dbPath;
    resetDbConnectionForTest();
    const created = submitOrderRequest({
      idempotencyKey: "manual-order-ledger-001", source: "PHONE",
      orderPurpose: "SELF", buyerName: "Nguyen Ha", buyerPhone: "0905111222",
      zoneId: "zone-hai-chau", addressDetail: "12 Bach Dang, Hai Chau",
      requestedDate: "2026-10-20", slotId: "slot-afternoon",
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }], now: createdAt,
    });
    assert.equal(created.ok, true);
    referenceCode = created.order!.referenceCode;
  });
  after(() => {
    resetDbConnectionForTest();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("persists source and starts without invented legacy ledger entries", () => {
    const order = getOrderRequestByReference({ referenceCode, isStaff: true })!;
    assert.equal(order.source, "PHONE");
    assert.deepEqual(order.ledger, []);
    assert.equal(order.paymentReconciliationRequired, false);
    assert.equal(order.rowVersion, 1);
  });

  it("records append-only collection with exact UTC time and exact replay", () => {
    const occurred = new Date("2026-10-11T04:05:06.789Z");
    const first = recordPaymentEntryByStaff({
      referenceCode, type: "COLLECTION", amountVnd: 100000, method: "BANK_TRANSFER",
      idempotencyKey: "payment-ledger-collect-001", expectedVersion: 1,
      staffUsername: "sales-a", now: occurred,
    });
    assert.equal(first.ok, true);
    assert.equal(first.order?.paymentStatus, "PARTIALLY_PAID");
    assert.equal(first.order?.rowVersion, 2);
    assert.equal(first.order?.ledger[0].occurredAt, occurred.toISOString());
    const replay = recordPaymentEntryByStaff({
      referenceCode, type: "COLLECTION", amountVnd: 100000, method: "BANK_TRANSFER",
      idempotencyKey: "payment-ledger-collect-001", expectedVersion: 1,
      staffUsername: "sales-a", now: new Date("2026-10-12T00:00:00.000Z"),
    });
    assert.equal(replay.ok, true);
    assert.equal(replay.deduplicated, true);
    assert.equal(replay.order?.ledger.length, 1);
  });

  it("rejects fractional money, conflicting replay, overcollection and overrefund", () => {
    assert.equal(recordPaymentEntryByStaff({ referenceCode, type: "COLLECTION", amountVnd: 1.5, method: "CASH", idempotencyKey: "payment-fractional-001", expectedVersion: 2, staffUsername: "sales-a" }).errorCode, "INVALID_AMOUNT");
    assert.equal(recordPaymentEntryByStaff({ referenceCode, type: "COLLECTION", amountVnd: 120000, method: "BANK_TRANSFER", idempotencyKey: "payment-ledger-collect-001", expectedVersion: 2, staffUsername: "sales-a" }).errorCode, "IDEMPOTENCY_CONFLICT");
    assert.equal(recordPaymentEntryByStaff({ referenceCode, type: "COLLECTION", amountVnd: 999999, method: "CASH", idempotencyKey: "payment-overcollect-001", expectedVersion: 2, staffUsername: "sales-a" }).errorCode, "OVER_COLLECTION");
    assert.equal(recordPaymentEntryByStaff({ referenceCode, type: "REFUND", amountVnd: 100001, method: "BANK_TRANSFER", reason: "Khach huy", idempotencyKey: "payment-overrefund-001", expectedVersion: 2, staffUsername: "manager-a" }).errorCode, "OVER_REFUND");
    assert.equal(recordPaymentEntryByStaff({ referenceCode, type: "REFUND", amountVnd: 1, method: "CASH", idempotencyKey: "payment-no-reason-001", expectedVersion: 2, staffUsername: "manager-a" }).errorCode, "REFUND_REASON_REQUIRED");
  });

  it("requires current version and preserves dedicated completion timestamp", () => {
    const stale = updateOrderStatusByStaff({ referenceCode, newOrderStatus: "CONFIRMED", expectedVersion: 1, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Confirmed" });
    assert.equal(stale.errorCode, "VERSION_CONFLICT");
    const confirmed = updateOrderStatusByStaff({ referenceCode, newOrderStatus: "CONFIRMED", expectedVersion: 2, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Confirmed" });
    assert.equal(confirmed.ok, true);
    assert.equal(confirmed.order?.rowVersion, 3);
    const invalid = updateOrderStatusByStaff({ referenceCode, newOrderStatus: "COMPLETED", expectedVersion: 3, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Skip" });
    assert.equal(invalid.errorCode, "INVALID_TRANSITION");
    assert.equal(updateOrderStatusByStaff({ referenceCode, newOrderStatus: "PREPARING", expectedVersion: 3, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Prep" }).ok, true);
    assert.equal(updateOrderStatusByStaff({ referenceCode, newOrderStatus: "DELIVERING", expectedVersion: 4, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Ship" }).ok, true);
    const completedAt = new Date("2026-10-11T09:10:11.123Z");
    const completed = updateOrderStatusByStaff({ referenceCode, newOrderStatus: "COMPLETED", expectedVersion: 5, staffUsername: "sales-a", staffDisplayName: "Sales A", note: "Done", now: completedAt });
    assert.equal(completed.ok, true);
    assert.equal(completed.order?.completedAt, completedAt.toISOString());
    assert.equal(completed.order?.rowVersion, 6);
  });
});
