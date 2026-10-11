# Admin confirmation and cash collection repair

Verified against current source 295f725 on 2026-10-11. Earlier repair bd05954 is not an ancestor of the current checkout; this targeted repair preserves the newer analytics and admin changes rather than reverting the checkout.

## Findings and fixes

- The browser retained an admin page while localhost:3020 had no listening process. Confirmation returned Failed to fetch. Restarted the isolated QA server; no production writes performed.
- Current legacy collection/refund handlers referenced an undefined response `data` and optimistically appended cash entries. The new shared mutation handlers parse the response, wait for server acknowledgement, update the canonical row version and preserve retry idempotency keys after failure.
- The server returns `ledger`, with `occurredAt`; the old mapper read `paymentLedger` and fabricated entries from payment flags. The shared mapper now uses only actual server ledger rows, actual completedAt, and the recorded source.
- Orders with pending shipping fees correctly reject collection on the server, but lacked a fee finalization control. Added permission-checked `delivery_fee` action and a required fee field before collection. Nonnegative integer fee, expected-version conflict checks and one-time finalization are enforced.
- Polling ignores in-flight mutations, preventing a stale fetch from overwriting acknowledged state.

## Evidence

- 73/73 automated tests pass, including failed collection retry, canonical acknowledgement, mapper occurrence dates and pending fee finalization.
- TypeScript and optimized production build pass.
- Browser QA order HM-261012-BCD9F257: confirmed, delivery fee finalized to 20,000 VND, collected 315,000 VND, progressed through preparation/delivery/completion.
- Reloaded the browser: order remained completed, actual ledger entry remained 315,000 VND, outstanding remained zero.
- Dashboard after test: completed merchandise sales 2,655,000 VND; net collected 735,000 VND. Delta from prior QA totals: +295,000 merchandise and +315,000 cash (includes shipping).
- Screenshots: `/private/tmp/hami-order-paid-proof.jpg`, `/private/tmp/hami-revenue-proof.jpg`.

Demo: http://127.0.0.1:3020/admin.html, isolated synthetic QA SQLite database. Source fixes are local; not deployed to production. Full cloud durability and real-provider notification verification remain outside this targeted confirmation/payment repair.
