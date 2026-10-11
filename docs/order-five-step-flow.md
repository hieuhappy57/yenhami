# Five-step order workflow

Confirmed business flow: customer places order -> admin confirms shipping fee and collects payment -> kitchen -> delivery -> success.

## Implementation

Pending orders show one confirmation form (shipping fee, computed remaining collection amount, payment method) and one submit button. Shipping and payment are not additional lifecycle statuses. Order details do not expose cash history, standalone collection/refund, cancellation, email resend, or separate fee-finalization controls. Internal payment records remain intact for dashboard totals.

`PATCH /api/admin/orders` action `confirm` requires order-write and payment-collection permissions. Local database confirmation updates shipping/total, inserts the collection and status history, and transitions to CONFIRMED in one transaction. Invalid amounts or stale versions leave all three unchanged. The idempotency receipt prevents duplicate collection, including after a lost response; receipts are included in cloud table synchronization definitions.

The status endpoint rejects direct CONFIRMED requests and blocks PREPARING unless fees are final and actual ledger net receipts cover total. Customer-facing ordering continues to submit only a request, not an online payment.

Normal internal statuses: PENDING_CONFIRMATION -> CONFIRMED -> PREPARING -> DELIVERING -> COMPLETED. UI labels: Khách đặt -> Xác nhận & thu tiền -> Chuyển bếp -> Giao hàng -> Thành công. Pending orders use the combined confirmation form. Historical unpaid confirmed orders remain blocked from kitchen progression by the existing payment guard; no recovery controls are exposed in this simplified screen.

## Verification (2026-10-11)

- 74 automated tests pass. Tests cover atomic validation failure, no partial fee/status/cash write, successful collection + confirmation, identical replay and changed-payload rejection.
- TypeScript and optimized build pass.
- Browser QA: HM-261013-956D796A confirmed with 0 shipping and 590,000 VND collected in a single action; reloaded and verified the actual ledger, then progressed through kitchen, delivery and success.
- Screenshot: /private/tmp/hami-five-step-order.jpg.
- Simplified-detail follow-up: 74 tests and TypeScript pass; browser verification of pending HM-261012-A29DA6C9 confirms only the combined confirmation form and normal workflow are exposed. Screenshot: /private/tmp/hami-order-minimal.jpg. This follow-up did not rerun the optimized build.
- Demo uses synthetic SQLite data at localhost:3020. No production deployment performed; existing cloud durability release gates remain.
