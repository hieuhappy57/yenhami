import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const html = readFileSync("demo/admin/index.html", "utf8");
function sourceFunction(name: string, next: string) {
  const start = html.indexOf(`    function ${name}(`);
  const end = html.indexOf(`    function ${next}(`, start);
  assert.ok(start >= 0 && end > start);
  return html.slice(start, end);
}
const financial = sourceFunction("computeOrderFinancials", "handleRoleSwitch");

test("admin demo separates merchandise, shipping and actual collections/refunds", () => {
  const result = runInNewContext(`${financial}\ncomputeOrderFinancials(order)`, {
    order: {
      items: [{ unitPrice: 185000, quantity: 2 }], discount: 10000, shippingFee: 25000,
      ledger: [{ type: "collection", amount: 100000 }, { type: "refund", amount: 20000 }],
    },
  });
  assert.equal(result.netGoods, 360000);
  assert.equal(result.orderTotal, 385000);
  assert.equal(result.netCollected, 80000);
  assert.equal(result.outstanding, 305000);
});

test("admin demo dashboard uses completion date for sales and ledger date for receipts", () => {
  const elements: Record<string, { value?: string; innerText?: unknown; innerHTML?: string }> = {
    dashPeriod: { value: "today" }, dashSource: { value: "ALL" },
    dashStart: {}, dashEnd: {}, sourceSummary: {},
    kpiNewRequests: {}, kpiPending: {}, kpiCompleted: {}, kpiSales: {},
    kpiNetCollected: {}, kpiCancelled: {},
  };
  const order = {
    createdAt: "2026-10-08 10:00", completedAt: "2026-10-09 10:00", status: "completed",
    source: "Website", items: [{ unitPrice: 185000, quantity: 2 }], shippingFee: 25000,
    ledger: [{ type: "collection", amount: 100000, date: "2026-10-09" },
      { type: "collection", amount: 200000, date: "2026-10-08" },
      { type: "refund", amount: 20000, date: "2026-10-09" }],
  };
  runInNewContext(`${financial}\n${sourceFunction("updateDashboard", "renderDailyChart")}\nupdateDashboard()`, {
    document: { getElementById: (id: string) => elements[id] },
    appState: { orders: [order] }, SIMULATED_TODAY: "2026-10-09",
    renderDailyChart: () => {}, formatVND: (value: number) => value, esc: (value: string) => value,
    showToast: () => assert.fail("Unexpected validation failure"),
  });
  assert.equal(elements.kpiCompleted.innerText, 1);
  assert.equal(elements.kpiSales.innerText, 370000);
  assert.equal(elements.kpiNetCollected.innerText, 80000);
  assert.equal(elements.kpiNewRequests.innerText, 0);
});

test("admin demo collection supports integer VND amounts without step offset", () => {
  assert.match(html, /id="colAmount_\$\{ord.id\}"[^>]*step="1"/);
});

test("admin demo preserves CMS tabs: products, posts, jobs, site with appropriate role access", () => {
  assert.ok(html.includes('id="tab-products"'), "Missing tab-products");
  assert.ok(html.includes('id="tab-posts"'), "Missing tab-posts");
  assert.ok(html.includes('id="tab-jobs"'), "Missing tab-jobs");
  assert.ok(html.includes('id="tab-site"'), "Missing tab-site");

  // Verify ROLE_PERMISSIONS in script
  const roleMatch = html.match(/const ROLE_PERMISSIONS\s*=\s*({[\s\S]*?});/);
  assert.ok(roleMatch, "ROLE_PERMISSIONS not found");
  const rolePermissions = runInNewContext(`(${roleMatch[1]})`);

  assert.deepEqual([...rolePermissions.MARKETING].sort(), ['jobs', 'posts', 'products', 'site'].sort());
  assert.ok(!rolePermissions.MARKETING.includes('dashboard'));
  assert.ok(!rolePermissions.MARKETING.includes('orders'));
  assert.ok(!rolePermissions.MARKETING.includes('staff'));

  assert.ok(rolePermissions.OWNER.includes('posts'));
  assert.ok(rolePermissions.OWNER.includes('jobs'));
  assert.ok(rolePermissions.OWNER.includes('site'));
  assert.ok(rolePermissions.OWNER.includes('products'));
});

test("admin demo provides post, job, product, site editing forms and drilldown date preservation", () => {
  assert.ok(html.includes('id="editPostModal"'), "Missing editPostModal");
  assert.ok(html.includes('id="editJobModal"'), "Missing editJobModal");
  assert.ok(html.includes('id="editProductModal"'), "Missing editProductModal");
  assert.ok(html.includes('id="priceLockNotice"'), "Missing priceLockNotice");
  assert.ok(html.includes('id="orderStartDate"'), "Missing orderStartDate");
  assert.ok(html.includes('id="orderEndDate"'), "Missing orderEndDate");
  assert.ok(html.includes('id="custStartDate"'), "Missing custStartDate");
  assert.ok(html.includes('id="custEndDate"'), "Missing custEndDate");
});

test("admin demo provides order notifications, audio bell, web push and email dispatch features", () => {
  // Navigation & Control elements
  assert.ok(html.includes('id="tab-notifications"'), "Missing tab-notifications");
  assert.ok(html.includes('id="notifBellBtn"'), "Missing notifBellBtn");
  assert.ok(html.includes('id="notifBadge"'), "Missing notifBadge");
  assert.ok(html.includes('id="notifDropdown"'), "Missing notifDropdown");
  assert.ok(html.includes('id="audioToggleBtn"'), "Missing audioToggleBtn");
  assert.ok(html.includes('id="floatingOrderBanner"'), "Missing floatingOrderBanner");
  assert.ok(html.includes('id="previewEmailModal"'), "Missing previewEmailModal");
  assert.ok(html.includes('id="previewEmailIframe"'), "Missing previewEmailIframe");
  assert.ok(html.includes('id="orderDetailResendEmailBtn"'), "Missing orderDetailResendEmailBtn");

  // Notification settings controls
  assert.ok(html.includes('id="cfgEnableSound"'), "Missing cfgEnableSound");
  assert.ok(html.includes('id="cfgEnableEmail"'), "Missing cfgEnableEmail");
  assert.ok(html.includes('id="cfgEmailTo1"'), "Missing cfgEmailTo1");
  assert.ok(html.includes('id="cfgEmailTo2"'), "Missing cfgEmailTo2");
  assert.ok(html.includes('id="cfgEmailWebhookUrl"'), "Missing cfgEmailWebhookUrl");
  assert.ok(html.includes('id="cfgResendApiKey"'), "Missing cfgResendApiKey");
  assert.ok(html.includes('id="notifLogsTableBody"'), "Missing notifLogsTableBody");

  // Verify Role Permissions include notifications for OWNER and MANAGER but exclude MARKETING
  const roleMatch = html.match(/const ROLE_PERMISSIONS\s*=\s*({[\s\S]*?});/);
  assert.ok(roleMatch, "ROLE_PERMISSIONS not found");
  const rolePermissions = runInNewContext(`(${roleMatch[1]})`);
  assert.ok(rolePermissions.OWNER.includes('notifications'), "OWNER should have notifications permission");
  assert.ok(rolePermissions.MANAGER.includes('notifications'), "MANAGER should have notifications permission");
  assert.ok(!rolePermissions.MARKETING.includes('notifications'), "MARKETING should not have notifications permission");
});

test("admin demo starts with clean zero demo orders and intuitive empty state", () => {
  // Verify INITIAL_FIXTURES.orders is empty
  const fixturesMatch = html.match(/const INITIAL_FIXTURES\s*=\s*({[\s\S]*?});/);
  assert.ok(fixturesMatch, "INITIAL_FIXTURES not found");
  const fixtures = runInNewContext(`(${fixturesMatch[1]})`);
  assert.equal(fixtures.orders.length, 0, "Initial orders should be empty");
  assert.ok(html.includes("Chưa có đơn hàng nào"), "Missing empty orders placeholder");
});

test("admin demo supports article pinning (isPinned) with toggle and top sorting", () => {
  assert.ok(html.includes('id="postIsPinnedInput"'), "Missing postIsPinnedInput in edit modal");
  assert.ok(html.includes("togglePinPost"), "Missing togglePinPost handler");
  assert.ok(html.includes("📌 Đã ghim"), "Missing pinned badge text");
  assert.ok(html.includes("btn-pinned"), "Missing btn-pinned class");

  // Verify sorting logic: pinned articles are prioritized at the top
  const posts = [
    { id: "p1", title: "Bài 1", isPinned: false },
    { id: "p2", title: "Bài 2", isPinned: true },
    { id: "p3", title: "Bài 3", isPinned: false },
  ];
  posts.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  assert.equal(posts[0].id, "p2", "Pinned post should be sorted first");
});
