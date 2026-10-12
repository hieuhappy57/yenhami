import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import { purgePrelaunchTestOrders } from "../db/index";

test("prelaunch cleanup removes only exact test references and their dependent records", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE order_requests (id TEXT PRIMARY KEY, reference_code TEXT, requested_date TEXT, slot_id TEXT, order_status TEXT);
    CREATE TABLE order_items (order_request_id TEXT, quantity INTEGER);
    CREATE TABLE order_status_history (order_request_id TEXT);
    CREATE TABLE payment_entries (order_request_id TEXT);
    CREATE TABLE order_notification_outbox (order_request_id TEXT);
    CREATE TABLE order_confirmations (reference_code TEXT);
    CREATE TABLE notification_logs (order_reference_code TEXT);
    CREATE TABLE slot_date_reservations (requested_date TEXT, slot_id TEXT, reserved_bowls INTEGER);
    INSERT INTO order_requests VALUES ('test', 'HM-261012-F8F692DA', '2026-10-12', 'morning', 'COMPLETED');
    INSERT INTO order_requests VALUES ('latest-test', 'HM-261013-92596235', '2026-10-12', 'morning', 'COMPLETED');
    INSERT INTO order_requests VALUES ('real', 'HM-261013-REAL0001', '2026-10-12', 'morning', 'CONFIRMED');
    INSERT INTO order_items VALUES ('test', 2), ('latest-test', 1), ('real', 1);
    INSERT INTO order_status_history VALUES ('test'), ('latest-test'), ('real');
    INSERT INTO payment_entries VALUES ('test'), ('latest-test'), ('real');
    INSERT INTO order_notification_outbox VALUES ('test'), ('latest-test'), ('real');
    INSERT INTO order_confirmations VALUES ('HM-261012-F8F692DA'), ('HM-261013-92596235'), ('HM-261013-REAL0001');
    INSERT INTO notification_logs VALUES ('HM-261012-F8F692DA'), ('HM-261013-92596235'), ('HM-261013-REAL0001');
    INSERT INTO slot_date_reservations VALUES ('2026-10-12', 'morning', 4);
  `);

  assert.equal(purgePrelaunchTestOrders(db), 2);
  for (const table of ["order_requests", "order_items", "order_status_history", "payment_entries", "order_notification_outbox", "order_confirmations", "notification_logs"]) {
    assert.equal((db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number }).count, 1, table);
  }
  assert.equal((db.prepare("SELECT reserved_bowls AS bowls FROM slot_date_reservations").get() as { bowls: number }).bowls, 1);
  assert.equal(purgePrelaunchTestOrders(db), 0);
  db.close();
});
