# Durable storage release review

## Scope

Orders, item and price snapshots, buyer and gift recipient details, delivery addresses, order sources, customer profiles, payment entries, confirmation idempotency, status history, service timestamps, notification outbox, staff roles and sessions are persisted in relational Cloudflare D1 tables. SQLite is a local working copy.

## Write guarantees

- A D1 lease serializes writers across server instances. Every transaction includes a checked fencing guard and revision acknowledgement.
- Only changed rows are upserted with bound parameters. Order references, order idempotency keys and payment idempotency keys have unique indexes.
- API success follows D1 acknowledgement. A failed/uncertain write returns an error; retry reads the canonical database and uses the same idempotency key.
- Local reads and mutations share a process lock. Importing canonical rows suppresses the notification trigger to avoid queueing duplicate notifications.
- Customer profiles represent buyers. Gift recipients and delivery addresses remain distinct from the buyer.
- Notification queue state and delivery logs are durable. Due entries retry while an authorized sales/owner admin polls orders. Resend receives an order-specific idempotency key.

## Backups and access

- Migration saves and reads back a private gzip R2 snapshot, comparing SHA-256 before publishing the new D1 tables.
- Mutations save versioned gzip snapshots with read-back checksum verification. Backup health is persisted independently in D1.
- Backup failure after a confirmed D1 transaction is reported in backup health without returning a misleading order failure.
- The public media proxy allows raster images under `uploads/` only and rejects traversal, encoded paths, internal database objects and executable HTML/SVG uploads. Responses enforce nosniff and sandbox policies.
- `GET /api/admin/storage` exposes counts, integrity checks and backup health only to the owner. Credentials and customer details are absent from that response.

## Verification evidence

- 93 automated tests passed, including transaction rollback, stale writer fencing, per-statement failures, lost acknowledgement recovery, customer/recipient separation, full confirmation-to-completion timeline, price snapshot preservation, media traversal and executable-upload rejection.
- TypeScript check passed. Production-target staging build passed on Vercel.
- Staging catalog API returned HTTP 200, 24 products. Missing-reference order API returned HTTP 400.
- Direct Cloudflare D1 console verified: 1 order, 2 items, 1 customer, 1 delivery address, 4 status history rows, 1 payment entry, 1 outbox entry.
- D1 metadata: ready=1, revision=2 at migration verification. Missing items/customers/history=0; orphan payments=0.
- R2 read-back checksum verified; backup health success recorded at 2026-10-13T05:13:22.477Z, with no backup error.
- Screenshot: `output/d1-storage-verified-2026-10-13.png`.

## Operational notes

- Production release: `dpl_5M1LKMfr19ZuCheQibSPJjX6voKM`, promoted to `https://yenhami.com` after staging verification.
- Production smoke checks: `/api/catalog` returned 200 with 24 products; `/api/admin/storage` returned 401 without credentials; `/api/media/db/ha-mi-db-state.json` returned 404.
- Chrome reload on `https://yenhami.com/admin.html` displayed the authentication gate correctly. No admin credentials were entered during this release.

- Existing pre-migration sessions may require one fresh admin login. New sessions and role changes are stored in D1.
- Notification retries currently require order/admin traffic; there is no unattended scheduler yet. Provider errors remain visible in the durable outbox and logs.
- Full backups favor recoverability at current volume. Review retention and daily checkpoint/delta backups as order volume increases.
- Direct production admin login smoke testing was not performed: automatic review blocked deriving a default password from source. No credentials were guessed or changed. Storage was instead verified through the application runtime and the already-authenticated Cloudflare console.
- Do not roll back to the old R2 snapshot writer after accepting new D1 transactions. Restore D1 through Cloudflare Time Travel or a verified backup first, and reconcile counts before switching the application.
