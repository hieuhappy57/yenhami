# Admin feature audit — 2026-10-11

Production deployment verified on Vercel: `dpl_Fzmp9NYFmE8cDCziJ8p57Wda7iM4` (`yenhami.com`, READY), Git commit `68c22c3`. That commit adds documentation only; application code is the preceding `39f3715`. Scope: current admin UI, order pipeline, staff/auth, dashboard/customers, CMS and notifications. This is a release review, not a production acceptance test.

## Evidence and coverage

- `npm test`: 75/75 passed. `npm run lint` (`tsc --noEmit`): passed.
- Browser smoke on the isolated `localhost:3020` demo: all 10 visible admin views opened (overview, orders, kitchen, customers, products, posts, jobs, site, staff, notification settings); no browser console errors were captured during navigation.
- Browser smoke on the authenticated production admin tab at `https://yenhami.com/admin`: all 10 views opened and no browser console errors were captured during navigation. A fresh unauthenticated session at `/admin.html` displayed the login gate. The initial audit performed no production writes; the follow-up order test below created one clearly marked test request.
- Order specialist ran 13 isolated tests and reproduced two notification HTTP sends for one order using temporary SQLite and a fake webhook.
- Auth/dashboard specialist ran 22 focused tests. The defects below are integration gaps not exercised by those passing tests.
- Actual provider delivery, production write workflows, cross-instance behavior, and every form mutation were not exercised. Passing unit/static tests and view navigation do not establish that every admin operation works.

## Production order follow-up

One production request was submitted through `yenhami.com/dat-hang`: reference `HM-261012-F8F692DA`, one Thanh Nguyên bowl, listed merchandise value 295,000 VND, store phone and store address, note `ĐƠN KIỂM THỬ PRODUCTION - KHÔNG CHƯNG, KHÔNG GIAO, KHÔNG THU TIỀN`. The public receipt returned `Chờ Hà Mi xác nhận` and `Chưa thu tiền`. The same reference appeared in the authenticated production admin order list as `Website` / `Chờ tiếp nhận`; its detail retained the note, item and amount. The in-app notification bell showed one new-order alert. After reloading both receipt and admin pages, the request remained visible.

This verifies website submission, immediate admin visibility and in-app alert for this one request. It does not establish cross-instance durability, actual email/Zalo delivery or successful payment/status mutation. The notification history UI showed only old simulated rows, not a server acknowledgement for this order. No admin confirmation, money collection, kitchen or delivery progression was performed because the request is explicitly test-only and no payment occurred. Do not fulfill this request.

## Release blockers

| Priority | Finding and root cause | Evidence | Recommended repair and acceptance |
| --- | --- | --- | --- |
| P0 | A successful order or admin mutation may exist only in instance-local SQLite. On Vercel the DB path is `/tmp`; the public order route catches cloud sync failure and still returns success. Cloud sync may also return without reporting failure. | `db/index.ts:102`, `db/index.ts:3733`, `app/api/orders/route.ts:73-110`, `app/api/admin/orders/route.ts:59` | Make a shared durable store authoritative for order, payment and status transactions. Acknowledge success only after its commit; surface storage failure. Test create/confirm/collect across two instances and after restart, including provider outage and retry. Avoid competing full-database snapshot uploads. |
| P0 | Staff users, roles and sessions are not in `CLOUD_TABLES`; staff API changes therefore remain instance-local. A fresh DB seeds default staff accounts, with a built-in fallback password when the bootstrap env is absent. Whether this fallback is active in production is unverified. | `db/index.ts:2933-2946`, `db/staff-repository.ts:78-99`, `app/api/admin/staff/route.ts:27-69` | Store identities and roles in the same durable shared authority. Disable default seeding in production; bootstrap one owner once with a deployment secret. Test sign-in, role revocation and password changes across two instances/restart. |
| P1 | Product, job and homepage saves edit client `appState` and announce success without a server write. Same-browser local storage can mask the failure; other staff and storefront do not receive the changes. Staff create/edit similarly changes client state without calling its API. | `public/admin.html:5418`, `public/admin.html:5871-5935`, `public/admin.html:5965-5987`, `public/admin.html:6070-6143` | Bind each form to its server endpoint, wait for acknowledged writes, refresh from server and display real failures. Test save/reload/new browser/storefront; test new staff account by actual login and permission. |
| P1 | A public order triggers direct notification and then outbox notification. The isolated fake webhook received two sends for one order. | `app/api/orders/route.ts:98-99`, `db/index.ts:2923`, `db/order-outbox.ts:114` | Send only through a durable outbox with one delivery key per event/channel. Test exactly one provider call, failure retry and duplicate request replay. |
| P1 | Outbox retries run only when another order is posted. Pending/failed outbox rows are not among cloud-synced tables and can disappear with a process restart. | `db/order-outbox.ts:114-158`, `db/index.ts:2933-2946`, `app/api/orders/route.ts:99`, `app/api/admin/orders/route.ts:119` | Put outbox in the authoritative store and drain it with a scheduled worker/queue. Test provider outage, recovery without new orders, and restart. |
| P1 | Saving notification settings can clear existing Resend/webhook secrets: GET exposes only configured flags, while the form sends blank secret fields. | `app/api/admin/cms/route.ts:34`, `public/admin.html:6895-6896`, `public/admin.html:6953-6962` | Omit blank secret fields on update, provide a separate explicit clear action, and show configured state. Test save of unrelated setting while delivery credentials stay valid. |
| P1 | Staff can select OWNER in a client-side role selector, changing the visible UI. Server APIs still enforce roles, but order/customer data cached in local storage may be visible on a shared browser. | `public/admin.html:1983-1990`, `public/admin.html:3684-3740`, `public/admin.html:6246-6265`, `public/admin.html:7167-7179` | Derive available roles and views from the verified server session; keep sensitive business data out of persistent browser storage; clear session data on logout/account switch. Test SALES, MARKETING and KITCHEN in one shared browser. |
| P1 | Customer records are grouped by buyer name, so unrelated people with the same name are merged into one profile and their orders/amounts combine. | `public/admin.html:5241-5264`, `public/admin.html:5310-5321` | Group by stable customer ID or normalized phone, with explicit handling for missing phone. Test two same-name/different-phone customers. |

## Other defects

| Priority | Finding and root cause | Repair and acceptance |
| --- | --- | --- |
| P1 | Frontend allows MANAGER into CMS/notification actions while API denies `content.write` and `settings.sensitive`; server-backed saves fail with 403 and client-only saves can show false success. `public/admin.html:3624`, `lib/staff-access.ts:7`, `app/api/admin/cms/route.ts:55`. | Define one permission matrix, render controls from server capabilities and report denied writes as errors. Test every role against each visible action. |
| P2 | Dashboard groups UTC timestamps by slicing the first ten characters, misplacing transactions near midnight in Vietnam. `public/admin.html:3300-3335`, `public/admin.html:3890-3927`, `public/admin-order-mutations.js:8-11`. | Convert timestamps to `Asia/Ho_Chi_Minh` before daily aggregation and filters. Test UTC 17:00-23:59 boundary cases. |
| P2 | Notification history is rendered from local fixture/storage rather than API logs; field names do not match the server response. `public/admin.html:7046`, `public/admin.html:6882`. | Hydrate and map real server logs, then test sent/failed/retry states after reload. |

## Repair sequence

1. Establish durable authoritative storage for orders, payments, staff and outbox; block success when a durable commit cannot be confirmed. Prove two-instance/restart behavior first.
2. Remove duplicate notification dispatch, schedule durable retries, and preserve secrets on settings updates.
3. Connect all admin save actions to API; load server state and show save failure honestly.
4. Align role UI with server authorization, remove sensitive browser cache, correct customer identity and Vietnam date grouping.
5. Re-run unit tests, typecheck, isolated end-to-end workflows for all roles/forms, then smoke test a preview deployment before any production release.

Release assessment: **current production release has unresolved code-level blockers**. Production UI navigation and one order request passed, but those blockers have not been repaired or cleared by complete production end-to-end tests. No production deployment or payment/status mutation was performed; the one marked test order above is the only production record created in this follow-up.
