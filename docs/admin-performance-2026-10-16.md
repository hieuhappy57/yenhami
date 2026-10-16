# Admin performance repair - 2026-10-16

## Production

- Code commit: `aa6d77a`
- Deployment: `dpl_2D8dCTHGLozrveZ9ANt29swL3gy8`
- Project: `yenhami` / `prj_HSd6Ux5vv5L6M5AQn2fSXsGuBy2b`
- URL: https://yenhami.com/admin.html

## Findings

- Authenticated order GET loaded the complete D1 snapshot twice: once during authentication and again in the route.
- A successful mutation awaited R2 PUT, R2 GET checksum verification, backup health persistence, and lease release before responding. The global writer lease remained held through that work.
- Cold instances checked each table's columns with a separate API request.
- Order GET could wait for notification retries while serving the list.

## Changes

- Reuse the authoritative snapshot already loaded during authentication for order GET. Authentication still reloads current staff/session data, preserving role revocation behavior.
- Batch schema-column checks. Acquire returns readiness; avoid a redundant readiness query after receiving the writer lease.
- For admin PATCH, commit the compressed backup job and business changes in the same guarded D1 batch. Release the writer lease in that batch. Respond only after D1 acknowledges the transaction.
- Process R2 jobs through Next.js `after`, outside the response path and writer lease. Verify uploaded backups by readback/hash before deleting jobs.
- Failed jobs remain in D1, with leased ownership and exponential retry delay capped at six hours. Authenticated order-list requests process bounded batches after the response, so a later admin visit/poll can recover interrupted work. No always-on independent worker or new cron is installed.
- Oversized compressed payloads retain synchronous backup behavior rather than exceed the D1 value limit.
- Move existing notification retry maintenance after the order-list response. Existing notification outbox remains durable.
- Add `Server-Timing` to successful order GET/PATCH responses for follow-up diagnosis.

## Verification

- 105 tests passed; TypeScript and remote production build passed.
- Isolated integration test uses mocked Cloudflare HTTP with real SQLite transactions: create order, confirm payment, transfer to kitchen, assert D1 acknowledgement and lease release without R2 writes, simulate R2 failure, retry and verify pending jobs drain.
- Store tests cover exclusive job claims, stale-owner protection, rollback of backup jobs with failed business writes, recovery after lost acknowledgement, and batched schema reads.
- Unauthenticated API smoke test returned 401.
- On the user's authenticated production admin, measured the same manual refresh button until its disabled state cleared: before 2,307 ms; after 1,455 ms (approximately 37% lower in these samples). Busy state observed in both measurements; final table retained five orders.
- Measurements are individual end-to-end UI samples, not a p95 benchmark or a measured confirmation/transfer-to-kitchen latency. No production order/payment/status was created or changed for this test.
- Existing unrelated local changes and original media were left untouched.

## Remaining considerations

- Auth and mutations still read full D1 snapshots; growing data volumes will require narrower queries or a direct D1-backed repository.
- Network latency and cold starts remain; this change does not promise sub-second responses for every action.
- Pending R2 work is durable but requires a subsequent admin order-list request if the initial `after` task is interrupted. Independent scheduled draining can be added as a separate operational decision.
