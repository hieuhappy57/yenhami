import crypto from "node:crypto";
import {
  getNotificationSettings,
  getOrderRequestByReference,
  getSqliteDb,
  triggerOrderNotificationsAfterCommit,
  type OrderNotificationPayload,
} from "./index";

export type OrderNotificationOutboxStatus = "PENDING" | "PROCESSING" | "SENT" | "FAILED";

export function ensureOrderNotificationOutbox(): void {
  const db = getSqliteDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_notification_outbox (
      id TEXT PRIMARY KEY,
      order_request_id TEXT NOT NULL UNIQUE,
      reference_code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED')),
      retry_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT NOT NULL,
      claimed_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      sent_at TEXT,
      FOREIGN KEY(order_request_id) REFERENCES order_requests(id)
    );
    CREATE INDEX IF NOT EXISTS idx_order_notification_outbox_due
      ON order_notification_outbox(status, next_attempt_at, created_at);
    CREATE TRIGGER IF NOT EXISTS queue_order_notification_after_insert
    AFTER INSERT ON order_requests
    BEGIN
      INSERT OR IGNORE INTO order_notification_outbox (
        id, order_request_id, reference_code, status, retry_count,
        next_attempt_at, created_at, updated_at
      ) VALUES (
        'outbox-' || NEW.id, NEW.id, NEW.reference_code, 'PENDING', 0,
        NEW.created_at, NEW.created_at, NEW.created_at
      );
    END;
  `);
}

export function getOrderNotificationOutbox(referenceCode: string) {
  ensureOrderNotificationOutbox();
  return getSqliteDb().prepare("SELECT * FROM order_notification_outbox WHERE reference_code = ?")
    .get(referenceCode.trim().toUpperCase()) as Record<string, unknown> | undefined;
}

function canonicalPayload(referenceCode: string): OrderNotificationPayload | null {
  const order = getOrderRequestByReference({ referenceCode, isStaff: true });
  if (!order) return null;
  return {
    referenceCode: order.referenceCode,
    orderPurpose: order.orderPurpose,
    buyerName: order.buyerName,
    buyerPhone: order.buyerPhone,
    buyerNote: order.buyerNote || undefined,
    recipientName: order.recipientName,
    recipientPhone: order.recipientPhone,
    giftSenderName: order.giftSenderName || undefined,
    giftMessage: order.giftMessage || undefined,
    hidePriceOnReceipt: order.hidePriceOnReceipt,
    addressDetail: order.addressDetail,
    requestedDate: order.requestedDate,
    slotLabel: order.slotLabelSnapshot,
    totalBowls: order.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalVnd: order.subtotalVnd,
    shippingFeeVnd: order.shippingFeeVnd,
    totalVnd: order.totalVnd,
    shippingFeeNote: order.shippingFeeNote,
    items: order.items.map((item) => ({
      productName: item.productNameSnapshot,
      variantName: item.variantNameSnapshot,
      volumeMl: item.volumeMlSnapshot,
      selectedOption: item.selectedOptionSnapshot,
      ingredientsText: item.ingredientsSnapshot,
      quantity: item.quantity,
      unitPriceVnd: item.unitPriceSnapshot,
      lineTotalVnd: item.lineTotalSnapshot,
    })),
    itemsSummary: order.items.map((item) => `${item.productNameSnapshot} x${item.quantity}`).join(" | "),
  };
}

function claimNext(now: Date): Record<string, unknown> | null {
  const db = getSqliteDb();
  const nowIso = now.toISOString();
  const staleIso = new Date(now.getTime() - 5 * 60_000).toISOString();
  db.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    db.prepare(`UPDATE order_notification_outbox
      SET status = 'FAILED', last_error = 'Delivery claim expired', updated_at = ?, next_attempt_at = ?
      WHERE status = 'PROCESSING' AND claimed_at < ?`).run(nowIso, nowIso, staleIso);
    const row = db.prepare(`SELECT * FROM order_notification_outbox
      WHERE status IN ('PENDING', 'FAILED') AND retry_count < 5 AND next_attempt_at <= ?
      ORDER BY created_at ASC LIMIT 1`).get(nowIso) as Record<string, unknown> | undefined;
    if (!row) {
      db.exec("COMMIT;");
      return null;
    }
    const claimed = db.prepare(`UPDATE order_notification_outbox
      SET status = 'PROCESSING', claimed_at = ?, updated_at = ?
      WHERE id = ? AND status IN ('PENDING', 'FAILED')`).run(nowIso, nowIso, String(row.id));
    db.exec("COMMIT;");
    return claimed.changes === 1 ? row : null;
  } catch (error) {
    try { db.exec("ROLLBACK;"); } catch { /* already closed */ }
    throw error;
  }
}

export async function flushOrderNotificationOutbox(options: { now?: Date; limit?: number } = {}) {
  ensureOrderNotificationOutbox();
  const now = options.now || new Date();
  const limit = Math.max(1, Math.min(options.limit || 10, 50));
  let sent = 0;
  let failed = 0;
  for (let index = 0; index < limit; index += 1) {
    const row = claimNext(now);
    if (!row) break;
    const id = String(row.id);
    try {
      const payload = canonicalPayload(String(row.reference_code));
      if (!payload) throw new Error("Canonical order no longer exists");
      const config = getNotificationSettings();
      const expectedEmail = config.enableEmail && Boolean(config.notificationEmailTo) && Boolean(config.emailWebhookUrl || config.resendApiKey);
      const expectedZalo = config.enableZalo && Boolean(config.zaloRecipientPhone) && Boolean(config.zaloWebhookUrl);
      if (!expectedEmail && !expectedZalo) throw new Error("No notification provider is configured");
      const result = await triggerOrderNotificationsAfterCommit(payload);
      if ((expectedEmail && !result.emailSent) || (expectedZalo && !result.zaloSent)) {
        throw new Error(result.detail || "Notification provider did not acknowledge delivery");
      }
      const finishedAt = new Date().toISOString();
      getSqliteDb().prepare(`UPDATE order_notification_outbox
        SET status = 'SENT', sent_at = ?, updated_at = ?, claimed_at = NULL, last_error = NULL
        WHERE id = ? AND status = 'PROCESSING'`).run(finishedAt, finishedAt, id);
      sent += 1;
    } catch (error) {
      const failedAt = new Date().toISOString();
      const retryCount = Number(row.retry_count || 0) + 1;
      const nextAttempt = new Date(now.getTime() + Math.min(60 * 60_000, 2 ** retryCount * 30_000)).toISOString();
      getSqliteDb().prepare(`UPDATE order_notification_outbox
        SET status = 'FAILED', retry_count = ?, next_attempt_at = ?, updated_at = ?,
            claimed_at = NULL, last_error = ? WHERE id = ? AND status = 'PROCESSING'`)
        .run(retryCount, nextAttempt, failedAt, error instanceof Error ? error.message.slice(0, 500) : "Notification failed", id);
      failed += 1;
    }
  }
  return { ok: failed === 0, sent, failed };
}

export function enqueueExistingOrderNotification(referenceCode: string): boolean {
  ensureOrderNotificationOutbox();
  const order = getOrderRequestByReference({ referenceCode, isStaff: true });
  if (!order) return false;
  const nowIso = new Date().toISOString();
  getSqliteDb().prepare(`INSERT OR IGNORE INTO order_notification_outbox
    (id, order_request_id, reference_code, status, retry_count, next_attempt_at, created_at, updated_at)
    VALUES (?, ?, ?, 'PENDING', 0, ?, ?, ?)`)
    .run(`outbox-${crypto.randomUUID()}`, order.id, order.referenceCode, nowIso, nowIso, nowIso);
  return true;
}
