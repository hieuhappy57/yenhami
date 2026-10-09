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
