import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  getNotificationSettings,
  resetDbConnectionForTest,
  triggerOrderNotificationsAfterCommit,
  updateNotificationSettings,
} from "../db/index";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-resend-"));
const previousDbPath = process.env.HAMI_DB_PATH;

test("production admin exposes sender input and saved-key status without serializing the key", () => {
  const html = fs.readFileSync(path.join(process.cwd(), "public/admin.html"), "utf8");
  assert.match(html, /id="cfgResendFromEmail"/);
  assert.match(html, /id="cfgResendKeyStatus"/);
  assert.match(html, /resendApiKeyConfigured/);
  assert.doesNotMatch(html, /notificationSettings:\s*appState\.notificationSettings/);
});

before(() => {
  process.env.HAMI_DB_PATH = path.join(dir, "resend.sqlite");
  resetDbConnectionForTest();
});

after(() => {
  resetDbConnectionForTest();
  if (previousDbPath === undefined) delete process.env.HAMI_DB_PATH;
  else process.env.HAMI_DB_PATH = previousDbPath;
  fs.rmSync(dir, { recursive: true, force: true });
});

test("blank key on later saves does not erase configured Resend key", () => {
  updateNotificationSettings({
    enableEmail: true,
    notificationEmailTo: "ops@example.test",
    resendApiKey: "re_test_secret_key",
    resendFromEmail: "Yến Sào Hà Mi <donhang@yenhami.com>",
    emailWebhookUrl: "",
    enableZalo: false,
  });
  updateNotificationSettings({ resendApiKey: "", notificationEmailTo: "new@example.test" });
  assert.equal(getNotificationSettings().resendApiKey, "re_test_secret_key");
  assert.equal(getNotificationSettings().notificationEmailTo, "new@example.test");
});

test("Resend uses configured sender and recipients without exposing key in payload", async () => {
  const originalFetch = globalThis.fetch;
  let requestBody: Record<string, unknown> = {};
  let requestAuthorization = "";
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(String(input), "https://api.resend.com/emails");
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    requestAuthorization = new Headers(init?.headers).get("authorization") || "";
    return new Response(JSON.stringify({ id: "email_test" }), { status: 200 });
  }) as typeof fetch;
  try {
    const result = await triggerOrderNotificationsAfterCommit({
      referenceCode: "TEST-RESEND",
      orderPurpose: "SELF",
      buyerName: "Khách thử nghiệm",
      buyerPhone: "0905000000",
      recipientName: "Khách thử nghiệm",
      recipientPhone: "0905000000",
      addressDetail: "Đà Nẵng",
      requestedDate: "2026-10-13",
      slotLabel: "Buổi sáng",
      totalVnd: 185000,
      shippingFeeNote: "",
      itemsSummary: "Yến chưng x1",
    });
    assert.equal(result.emailSent, true);
    assert.equal(requestAuthorization, "Bearer re_test_secret_key");
    assert.equal(requestBody.from, "Yến Sào Hà Mi <donhang@yenhami.com>");
    assert.deepEqual(requestBody.to, ["new@example.test"]);
    assert.doesNotMatch(JSON.stringify(requestBody), /re_test_secret_key/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
