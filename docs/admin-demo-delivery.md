# Admin interface demo delivery - 2026-10-09

Status: isolated UI demo, NOT a production admin MVP. No production routes, DB, authentication or deployment were changed.

## Run and isolation

From the project root: `node demo/admin/serve.mjs`.
Preview: http://127.0.0.1:3018/ (loopback only).
The server serves only the demo HTML and three whitelisted public brand/product assets. Unknown paths return 404, mutation methods return 405, all responses carry no-store and noindex headers. Lucide icons load from pinned unpkg CDN; no customer data is sent there.
Orders, staff, customers, prices and transactions are synthetic fixtures held in browser memory. Reload resets all edits. Role switching is a UI simulation, not authentication or a security boundary. Do not enter real customer information.

## Worker and review

Task: A5 demo-only preview under the owner's latest proceed instruction. Worker: Antigravity CLI `gemini-3.8-flash-medium`; conversation `27928878-b388-46e6-a5c0-152cbb8bc748`, SUCCESS, 228.96 seconds, one turn. CLI-reported total tokens: 45177 (input 17595, output 27582 including reported thinking 3477); no independent billing assertion.
Worker returned a single HTML proposal. Leader applied it, created the isolated server, repaired it and performed independent tests. Worker did not run browser tests or deploy.

Initial proposal score: 56/100, not accepted. Main defects: incorrect brand spelling, sales filtered by creation instead of completion date, clipped mobile filters, misleading collection input step, missing custom dates/Other source, pending orders appearing in kitchen, weak mutation guards and oversized output (~76 KB vs requested 25 KB).
Revised demo-only score: 87/100 (correctness 31/35, scope/isolation 24/25, verification 16/20, maintainability 6/10, operational clarity 10/10). This score accepts the isolated preview, NOT full A5 or production RBAC. Single-file maintainability and incomplete workflows remain deductions.

## Verified evidence

- Full local `npm test`: 41/41 passed; `npm run lint`: passed. Three new regression tests execute demo financial/dashboard functions and assert the VND input step. Existing production tests remain passing.
- Baseline seven-day fixture sales: 2,330,000 VND; net receipts: 2,830,000 VND. Today's baseline sales: 360,000 VND.
- Browser partial collection HM-1008: 100,000 VND recorded; outstanding 295,000 VND; seven-day receipts increased to 2,930,000 VND; today's receipts 460,000 VND, sales unchanged.
- Browser refund HM-1006: another 50,000 VND recorded with reason; net collected 600,000 VND, outstanding 100,000 VND. Fixture contract treats refund as reducing receipts, not changing merchandise price.
- Kitchen and marketing UI role navigation inspected; kitchen projection omits buyer/phone/price and only includes confirmed/preparing orders in reviewed source. Marketing view has product description and article status controls, no prices.
- Browser last-owner removal blocked with visible validation message.
- Mobile CSS viewport width 390: document clientWidth/scrollWidth both 371 (scrollbar consumes the remainder); no page horizontal overflow. Order dialog horizontal bounds 0.37 to 370.86 fit the document.
- Desktop CSS width/clientWidth/scrollWidth all 1375; official logo loaded. Screenshots: `admin-demo-mobile.png`, `admin-demo-desktop.png`.
- HTTP smoke: GET / 200, GET /api/admin/orders 404, GET /db/index.ts 404, POST / 405.

## Limits and next gates

The preview supports time/source KPI filters (custom range at most 31 days), status/source/order search, manual sample orders, partial collection/refund, buyer history and simulated role edits.
Order drilldown transfers source/status, not the dashboard period. Customer history has no independent date range control. Kitchen is a read-only preview. Article controls only toggle publication, not a full editor. Staff screen edits synthetic role memberships only, with no login, account creation or revocation. Gift/manual delivery forms are illustrative, not finalized fulfillment fields. UI role edits are not wired to the independent top-level role selector.
All guards are client-side demo behavior. Real authentication, durable customer storage, transactional payments, API field authorization, customer/date reporting, audit trails and cloud migration remain A1-A7 gated work. No new worker task is dispatched by this delivery.
Node runtime for local tests is 26.3.1; project production target Node 22 remains a separate compatibility check. No new production build is claimed for this demo-only change. No push, staging or production deployment performed.
