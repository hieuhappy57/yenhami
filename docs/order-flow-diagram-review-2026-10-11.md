# Order flow diagram review — 2026-10-11

Reference: user-supplied `/Users/hieunguyen/Downloads/mermaid-diagram.svg`. Checked against production deployment `dpl_Fzmp9NYFmE8cDCziJ8p57Wda7iM4` at `yenhami.com` (application commit `39f3715`) and the matching source. This review uses the diagram as the expected workflow.

| Diagram stage | Result | Evidence / limitation |
| --- | --- | --- |
| Customer chooses dishes/options, enters recipient and requested time | Verified for one dish | One production request was placed through `/dat-hang`, with a date/slot, address, note and one Thanh Nguyên bowl. The cart has no slot-capacity block, but quantity is capped at 50 per item in `components/CartProvider.tsx:140` and `db/index.ts:845`; the diagram's “unlimited” wording is not literally true. |
| Request starts `PENDING_CONFIRMATION`, `UNPAID`; customer receives a lookup code | Verified live | Test request `HM-261012-F8F692DA` showed pending confirmation, unpaid and a receipt. It remained visible after reload. No lookup token is recorded in this report. |
| New-order alert and sales receives request | Partially verified live | Same reference appeared as Website / Chờ tiếp nhận in production admin and its in-app bell showed one new-order alert. Email/Zalo delivery was not verified; notification history rendered old simulated rows. `app/api/orders/route.ts:98-99` has two dispatch paths, reproduced separately as duplicate webhook sends. |
| Sales calls/checks address and delivery time | Manual process | Address, schedule and buyer note are visible in order detail. There is no recorded “contact verified” checkpoint; confirmation relies on staff procedure. |
| Customer cancels before confirmation | Missing admin action | Backend accepts `CANCELLED` for owner/manager via `app/api/admin/orders/route.ts:73` and `db/index.ts:1936`, but the current order-detail UI has no cancel control. The marked production test request therefore remains pending. |
| Sales finalizes shipping fee, collects full remaining amount and confirms | Implemented, not clicked live | One confirmation form on pending order contains fee, computed amount and payment method. `confirmOrderWithPaymentByStaff` commits collection, `PAID`, `CONFIRMED` and `confirmedAt` together (`db/index.ts:1744-1795`); tests cover the local transaction. This was not executed on the production test request because no real payment occurred. |
| Kitchen queue is FIFO, hides prices, shows dish details | Partially verified live | Production KDS showed 2 waiting / 1 preparing orders, FIFO order numbers and no prices. It rendered generic `Món yến` instead of dish names: the mapper writes `items[].name` (`public/admin.html:4351`), whereas KDS reads `productName`/`productNameSnapshot` (`public/admin.html:5140`). Use the mapped `name` and test a multi-dish order. |
| Kitchen presses Start and Done; Done moves to `DELIVERING` | Implemented, not clicked live | Production KDS displays both buttons. `kitchenStartPreparing` sends `PREPARING` and `kitchenFinishPreparing` sends `DELIVERING` (`public/admin-order-mutations.js:134-144`). Server records `preparingStartedAt` and `preparedDoneAt` (`db/index.ts:1988-1989`). No live kitchen status mutation was made. |
| Delivery succeeds; Sales marks `COMPLETED`, records `completedAt`, customer sees status | Implemented, not clicked live | `DELIVERING -> COMPLETED` is an allowed transition (`db/index.ts:1939`), `completedAt` is recorded (`db/index.ts:1990`), and customer lookup renders current status (`app/yeu-cau-da-nhan/page.tsx:67-89`). The dashboard calculates average lead time from `confirmedAt` to `completedAt` (`public/admin.html:4253-4271`). Full production progression was not performed. |
| Delivery incident -> manager complaint/refund | Missing admin action | Refund API and ledger validation exist (`app/api/admin/orders/route.ts:85-94`, `db/index.ts:1830-1895`), but completed order detail has no refund action. No incident workflow/status is represented in the normal UI. |

Additional metric discrepancy: the dashboard's `Giao nóng <2H` value is hard-coded as `100%` in `public/admin.html:4279`, rather than calculated from completed orders. Replace it with an actual measured share using agreed start/end timestamps, and show no-data state when the sample is empty.

The interactive local acceptance test below exercises the full five-step path. In production, use a genuinely paid order before recording collection; verify the customer lookup, kitchen timing, delivery completion and actual notification provider acknowledgement. Do not fulfill the marked test request.

## Interactive flow test — 2026-10-11

Ran the actual storefront and admin controls at `http://127.0.0.1:3020` against the local synthetic QA database `/private/tmp/hami-admin-qa-fresh-20261011-3709.sqlite`. The production request `HM-261012-F8F692DA` was not changed. No real payment or delivery occurred.

| Action | Observed result |
| --- | --- |
| Selected one Thanh Nguyên and submitted customer delivery details | New reference `HM-261012-03905363`; customer receipt showed `PENDING_CONFIRMATION` and unpaid; admin bell and pending list picked it up. |
| Admin entered 15,000 VND shipping fee and clicked “Xác nhận đơn & ghi nhận thu” | Order changed to `CONFIRMED` / `PAID`, total 310,000 VND. `payment_entries` contains exactly one `COLLECTION` of 310,000 VND by `qa-owner`. |
| Admin clicked “Chuyển bếp” | Order changed directly to `PREPARING` and appeared in the kitchen's active queue. This bypasses the diagram's separate waiting-in-kitchen / “Bắt đầu chưng” action. |
| Kitchen clicked “Xác nhận làm xong” on that order | Order changed to `DELIVERING` and left the kitchen queue. |
| Admin clicked “Xác nhận thành công” | Order changed to `COMPLETED` / `PAID`; order table showed “Đã thu đủ” and “Thành công”. The database has `confirmed_at`, `preparing_started_at`, `prepared_done_at`, `completed_at` and `row_version = 5`. |
| Checked dashboard after completion | Completed count rose 7 → 8, completed product revenue 3,835,000 → 4,130,000 VND (+295,000), and net collected 2,525,000 → 2,835,000 VND (+310,000). |

A second local request, `HM-261012-798C9A58` (Dừa Mật Thanh Dịu), tested the kitchen-owned route: Sales confirmed and recorded a 295,000 VND collection with 0 VND shipping; the order remained `CONFIRMED` in the kitchen waiting queue; Kitchen clicked “Bắt đầu chưng” (`PREPARING`) and “Xác nhận làm xong” (`DELIVERING`); Admin clicked “Xác nhận thành công” (`COMPLETED`). Both orders have all four timestamps and one collection entry each. A blank shipping-fee field prevented submitting the confirmation form without an explanation; entering `0` explicitly worked.

**Confirmed defects / gaps**

1. Customer receipt status badge advances to “Đang giao nóng” / “Đã giao hoàn tất”, but the H1 and explanatory paragraph still claim the request is awaiting confirmation (`app/yeu-cau-da-nhan/page.tsx:91-118`). Render status-dependent copy.
2. Kitchen shows generic “Món yến” instead of “Thanh Nguyên” (`public/admin.html:4353-4361` maps item `name`, while `public/admin.html:5136-5139` reads other name fields). Read `it.name` in the kitchen view.
3. Admin “Chuyển bếp” transitions directly to `PREPARING`; if the diagram's FIFO waiting stage matters, separate queue handoff from cooking start. Otherwise update the diagram and button label to match implemented semantics.
4. Cancellation and refund exception paths were not exercisable through the current order-detail UI. Their API routes exist, but no current controls expose them. Notification delivery beyond the in-app bell was not verified.
5. Dashboard “Giao nóng <2H” remains hard-coded at `100%` (`public/admin.html:4282`); it is not a measured result.
6. The confirmation form should prefill a zero shipping fee or show an inline validation message; leaving the field blank made the submit button appear to do nothing in the second test.

## Local fixes and re-test — 2026-10-11

The six normal-flow defects above were addressed in the working tree. The customer receipt now changes its heading and explanation with the order status. Admin confirmation shows a specific error for a blank shipping fee; entering `0` remains valid. Sales no longer has the shortcut that starts cooking: a confirmed order waits in the kitchen queue, and only the Kitchen Start/Done controls advance it to `PREPARING`/`DELIVERING`. The API enforces the same kitchen capability for those transitions. Kitchen and dashboard views prefer the saved item name. The under-two-hour metric uses completed orders with both confirmation and completion timestamps, and displays `--` without a sample.

Verified through the local storefront and admin UI with synthetic order `HM-261012-DD09687F`: submitted one Kim Thảo, saw the blank-fee error, confirmed with zero shipping, observed it waiting in the kitchen queue with the correct dish name, clicked Kitchen Start and Done, and marked delivery successful in admin. The customer receipt then displayed “Đơn đã giao thành công”. The local database recorded all four transition timestamps and the full 325,000 VND collection. This was not a real payment or delivery.

The manual-order button had also been a browser-only mock. It now creates through `/api/admin/orders` with an explicit source and delivery schedule. A synthetic Zalo request `HM-261012-15FEED6D` appeared in the admin list after a full page reload, confirming server persistence. No production data was changed. Cancellation/refund UI and external email/Zalo provider acknowledgement remain outside this normal-flow acceptance test; they should not be represented as verified.
