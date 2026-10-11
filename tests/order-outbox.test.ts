import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resetDbConnectionForTest, submitOrderRequest, updateNotificationSettings } from "../db/index";
import { ensureOrderNotificationOutbox, flushOrderNotificationOutbox, getOrderNotificationOutbox } from "../db/order-outbox";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-outbox-"));
const dbPath = path.join(dir, "outbox.sqlite");
const now = new Date("2026-10-11T03:00:00.000Z");
let referenceCode = "";

describe("durable order notification outbox", () => {
  before(() => {
    process.env.HAMI_DB_PATH = dbPath;
    resetDbConnectionForTest();
    ensureOrderNotificationOutbox();
    const created = submitOrderRequest({
      idempotencyKey: "outbox-order-idempotency-001", source: "PHONE", orderPurpose: "SELF",
      buyerName: "<script>alert(1)</script>", buyerPhone: "0905111222",
      zoneId: "zone-hai-chau", addressDetail: "12 <b>Bach Dang</b>, Hai Chau",
      requestedDate: "2026-10-20", slotId: "slot-afternoon",
      items: [{ productId: "prod-thanh-nguyen", quantity: 1 }], now,
    });
    assert.equal(created.ok, true);
    referenceCode = created.order!.referenceCode;
  });

  after(() => {
    resetDbConnectionForTest();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("queues exactly once in the order insert transaction and survives reopen", () => {
    const first = getOrderNotificationOutbox(referenceCode)!;
    assert.equal(first.status, "PENDING");
    const replay = submitOrderRequest({
      idempotencyKey: "outbox-order-idempotency-001", source: "PHONE", orderPurpose: "SELF",
      buyerName: "ignored", buyerPhone: "0905111222", zoneId: "zone-hai-chau",
      addressDetail: "12 Bach Dang, Hai Chau", requestedDate: "2026-10-20",
      slotId: "slot-afternoon", items: [{ productId: "prod-thanh-nguyen", quantity: 1 }], now,
    });
    assert.equal(replay.deduplicated, true);
    resetDbConnectionForTest();
    const reopened = getOrderNotificationOutbox(referenceCode)!;
    assert.equal(reopened.reference_code, referenceCode);
    assert.equal(reopened.retry_count, 0);
  });

  it("records no-provider failure durably instead of pretending delivery", async () => {
    updateNotificationSettings({ enableEmail: true, notificationEmailTo: "ops@example.test", emailWebhookUrl: "", resendApiKey: "", enableZalo: false, zaloWebhookUrl: "" });
    const result = await flushOrderNotificationOutbox({ now, limit: 1 });
    assert.deepEqual(result, { ok: false, sent: 0, failed: 1 });
    const failed = getOrderNotificationOutbox(referenceCode)!;
    assert.equal(failed.status, "FAILED");
    assert.equal(failed.retry_count, 1);
    assert.match(String(failed.last_error), /No notification provider/);
  });

  it("retries a failed row, escapes HTML, and marks sent only after acknowledgement", async () => {
    updateNotificationSettings({ enableEmail: true, notificationEmailTo: "ops@example.test", emailWebhookUrl: "https://example.test/notify", resendApiKey: "", enableZalo: false, zaloWebhookUrl: "" });
    const originalFetch = globalThis.fetch;
    let body = "";
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      body = String(init?.body || "");
      return new Response("ok", { status: 200 });
    }) as typeof fetch;
    try {
      const retryAt = new Date(now.getTime() + 5 * 60_000);
      const result = await flushOrderNotificationOutbox({ now: retryAt, limit: 1 });
      assert.deepEqual(result, { ok: true, sent: 1, failed: 0 });
      assert.equal(getOrderNotificationOutbox(referenceCode)!.status, "SENT");
      const sent = JSON.parse(body) as { html: string };
      assert.match(sent.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
      assert.doesNotMatch(sent.html, /<script>alert\(1\)<\/script>/);
      assert.match(sent.html, /12 &lt;b&gt;Bach Dang&lt;\/b&gt;/);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
