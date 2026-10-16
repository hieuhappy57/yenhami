# Shared admin performance - 2026-10-16

## Release

- Code commit: `eedf739`
- Deployment: `dpl_Hm9QMkkQZaoS11kxqyo3K2K2ShDE`
- Production: https://yenhami.com/admin.html

## Scope

- Extend the existing atomic D1 backup-job mechanism to CMS (products, articles, jobs, site and notification settings), catalog/slot changes, staff administration, login/logout and manual order creation. These operations still await D1 acknowledgement, but no longer wait for R2 backup completion.
- Manual order notification delivery runs after the response, backed by the existing durable notification outbox.
- Remove duplicate D1 reloads from CMS and storage GET after authentication has already loaded current data.
- Cache only the database initialization-ready flag. Staff authorization and business snapshots are still freshly read; no role/session cache was introduced.
- Product edits use one acknowledged save response in the normal case instead of a catalog GET, POST and another catalog GET. The server merges untouched fields from its current authoritative product inside the mutation, not a stale browser copy. Legacy response fallback remains supported.
- Preserve deliberately empty product caution text instead of repopulating a removed note during edits.
- On order polling/mutations, repaint only the active orders/dashboard/kitchen/customer view; skip localStorage writes when order data has not changed. Hidden views render current state when opened.
- Product/article thumbnails use lazy loading and asynchronous decoding in production and both demo copies.

## Verification

- 108 tests passed, TypeScript and remote build passed.
- Added actual CMS-handler tests with isolated SQLite for partial product updates, canonical response data and retention of untouched commercial fields/options.
- Frontend VM tests assert no redundant catalog GET after successful acknowledged product save and no success/close on failed save.
- Active-view repaint test, all-admin-route deferred-backup coverage, fresh-auth checks and readiness-query regression coverage passed.
- Existing transaction, backup retry/lease, RBAC, last-owner, session revocation, notification and order tests remain passing.
- Preview CMS API returns 401 without staff authentication.
- Live authenticated CMS manual refresh: 2,593 ms before, 2,117 ms after (approximately 18% lower in individual UI samples). These include network, browser automation and rendering, not isolated SQL duration or p95 latency. Warm/cold instance and concurrent polling can affect results.
- Live navigation opened all ten sections successfully: overview, orders, kitchen, customers, products, articles, recruitment, site settings, staff, notifications. Article thumbnails on the new release expose lazy loading.
- No production business record, price, article, staff permission, credential or payment was changed for verification. Live writes for every form were not exercised; write behavior is covered by isolated tests and route review.

## Limits

- Admin latency is reduced, not eliminated. Full D1 snapshot reads, network latency, cold starts and explicit external notification/storage connection tests remain potential delays.
- R2 upload itself still waits for verified storage, intentionally. Notification test commands still wait for the external result they are testing.
- Durable backup retry semantics remain as described in `docs/admin-performance-2026-10-16.md`: subsequent authenticated order-list activity can drain interrupted jobs; no independent scheduler was added.
- This release does not certify every pre-existing admin form's persistence wiring. The production navigation check is not an end-to-end live-write test of every section.
