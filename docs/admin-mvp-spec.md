# Ha Mi Admin MVP

Date: 2026-10-09. Owner-approved requirements; leader specification.
Status: source inspection and specification complete. No application changes, worker dispatch or deployment in this task.

## Approved scope

- Consolidate website, Zalo, Messenger, phone, storefront and other orders with an explicit source.
- Track sales and actual receipts by time and customer; no costs, inventory accounting or profit.
- Start customer records from new orders; no fabricated historical records.
- Roles: OWNER, MANAGER, SALES, KITCHEN, MARKETING. A staff account can have several roles.
- Marketing can publish posts and edit product content, not prices, variant price deltas, discounts or sale availability.
- Main store: 180 Hoang Minh Giam, Hoa Xuan, Da Nang, Vietnam. Ba Ren is the production workshop.
- Prefer a compact operational UI. Do not modify the storefront for this project.

## Source findings (not production verification)

| Existing module | Reuse | Required correction |
| --- | --- | --- |
| app/quan-tri/page.tsx | Order/CMS UI, status labels, formatting | Large single component; dashboard mixes catalog/CMS counts with order totals; no period receipts ledger |
| app/api/admin/orders/route.ts | Authenticated order API | No role/field permissions; returns every order without pagination; payment status manually editable |
| app/api/admin/catalog/route.ts and cms/route.ts | Existing catalog/CMS actions | Login alone permits mutations; content writes can include protected commercial fields |
| lib/staff-auth.ts | HttpOnly cookie mechanism | Known fallback signing secret; token identity/role not rechecked against active account; revocation needed |
| db/index.ts verifyStaffCredentials | Existing staff table | Shared fallback passwords can authenticate different active users; eliminate fallback credentials, use per-user password verification |
| db/schema.ts | Snapshot order items, delivery reservations, status history | No sources/customer link/payment ledger/multi-role accounts or completion timestamps |
| db/index.ts cloud sync | Existing provider integration | Whole SQLite snapshots are authoritative cloud state; concurrent writers can overwrite each other; sync failure can be silently ignored |

Current env/provider access and real customer records were not read. Do not claim a confirmed production breach or data loss. Fix these source risks before enabling staff access or real payment writes.

## Business rules

- Currency: integer VND; reject nonfinite/negative prices and noninteger amounts. Never use floating money arithmetic.
- UTC timestamps in storage; filters and daily buckets in Asia/Ho_Chi_Minh. Convert local start-inclusive/end-exclusive boundaries server-side.
- Order source enum: WEBSITE, ZALO, MESSENGER, PHONE, STORE, OTHER. Legacy source UNKNOWN stays honest; do not backfill as WEBSITE without evidence.
- Website source is server-assigned, not trusted from public request JSON. Manual order requires source; OTHER requires a brief source detail.
- Sales = finalized merchandise subtotal minus discount on COMPLETED orders, dated by completedAt. Shipping separate. Requests/confirmed/cancelled/demo orders excluded.
- Receipts = collection entries minus refund entries dated by occurredAt, regardless of completion status; include shipping money collected. Show gross collected/refunded/net separately.
- Existing PAID/REFUNDED status is not proof of amount or receipt time. Legacy orders with unverified payments show a reconciliation warning, not invented ledger entries.
- Cancellation alone does not refund money. Recorded refunds do not silently change historical completed sales; report refunded amounts separately. No completed-order reopen in MVP; corrections append explicit audited adjustment/reversal records.
- Payment methods CASH, BANK_TRANSFER, OTHER; entries are manual staff confirmation, not a payment-gateway integration.
- Sales may collect; manager/owner refunds with reason. No overcollection beyond finalized total or refund beyond remaining collected balance in MVP.
- No hard deletion of orders, receipts or audit trail. Payment mistakes are reversed by linked compensating entries, never editing amounts in place.
- Order snapshots remain independent of later catalog changes. No direct total edits after confirmation; corrections require explicit audited action and version checks.

## Navigation and UI

- Dashboard: default for OWNER/MANAGER. Period/source filters, six compact KPIs (new requests, pending, completed, sales, net collected, cancellations), sales/receipts trend, source breakdown and best-selling products.
- KPI drilldown preserves period/source and relevant date basis; sales uses completion dates, receipt view uses ledger dates, operational counts use creation dates. Label date basis in filter controls.
- Orders: default for SALES. Search reference/name/phone; filters source/status/delivery date; server pagination. Desktop table, mobile concise rows; detail drawer with buyer, recipient, items, delivery, assigned staff and history.
- Create manual order: source, buyer contact, items, delivery; gift recipient fields conditional. Same quote/variant/capacity validation as website, no bypass of existing order rules.
- Kitchen: default for KITCHEN-only. Group by delivery slot/date, quantities/options and preparation status. No phone, address, buyer notes, gift message, prices, totals, payment history or lookup tokens in responses.
- Customers: search normalized phone/name; profile, delivery addresses, order history, completed sales and recorded collections in selected period. No mass export in MVP.
- Content: default for MARKETING-only. Existing articles/media and restricted product content forms. No cloud credentials, notification settings or customer data.
- Staff: OWNER only. Create invitation/setup flow, activate/deactivate, roles, revoke sessions. Do not display stored password hashes or ship universal credentials.
- Audit: OWNER/MANAGER operational audit; OWNER access for staff/security changes. Redact secrets and unnecessary personal details.
- Loading/empty/error states required. Failed API fetch must not show zero KPIs as genuine values. Filters share URL state; no long feature-explanation text.

## Permission contract

| Capability | OWNER | MANAGER | SALES | KITCHEN | MARKETING |
| --- | --- | --- | --- | --- | --- |
| Aggregate sales/receipts reports | Yes | Yes | No | No | No |
| Operational orders and necessary delivery/customer fields | Yes | Yes | Yes | Restricted projection | No |
| Create/confirm/assign/cancel eligible orders | Yes | Yes | Yes, reason required for cancel | No | No |
| Advance preparation status | Yes | Yes | Yes | CONFIRMED to PREPARING only | No |
| Record collection / inspect payment state for an order | Yes | Yes | Yes | No | No |
| Record refund or money reversal | Yes | Yes | No | No | No |
| Customer profile/history | Yes | Yes | Yes, no aggregate finance report | No | No |
| Product content / articles / media | Yes | Yes | No | No | Yes |
| Price / variant price / discount / availability | Yes | Yes | No | No | No |
| Staff / role changes / sensitive settings | Yes | No | No | No | No |

Multi-role permissions are additive, except owner-only capabilities cannot be assigned as ordinary capabilities. Every API verifies current active account and permissions before data access. Separate content and commercial-field payloads; reject unauthorized fields rather than ignoring them. UI hiding is not a security boundary. Prevent removing/deactivating the last active owner.

## Data additions (migration design)

- customers: id, displayName, normalizedPhone, timestamps; customer_addresses: customerId, label, address, delivery zone, timestamps. Buyer and recipient remain separate. No merge by name; ambiguous/shared phone conflicts require an explicit merge with history.
- staff_roles: staffId + role unique pair; staff_sessions: hashed opaque token, staffId, expiry/revocation, session version. Random per-password salt with versioned scrypt encoding and bounded work factor; no trimming passwords.
- order_requests additions: source/sourceDetail, customerId, assignedStaffId, confirmedAt, completedAt, cancelledAt, cancellationReason, discountVnd, rowVersion. Nullable legacy timestamps never substituted with createdAt.
- payment_entries: id, orderId, type (COLLECTION/REFUND/REVERSAL), positive amountVnd, method, occurredAt, recordedAt, staffId, reversalOfId, reason, idempotencyKey. Linked reversal uniqueness and balance validation inside the same atomic write.
- audit_events: actor, action, entity/id, minimal before/after changes, reason, timestamp, request ID; no credentials or unrestricted notes in logs.
- Indexed filters: order source/status/date/customer/assignee, ledger date/order, normalized phone. Foreign keys/constraints in authoritative storage.
- PaymentStatus expands with PARTIALLY_PAID and PARTIALLY_REFUNDED and is derived from ledger balances. Legacy unresolved state retained explicitly until reconciled.

## Persistence and migration gate

Production needs one authoritative transactional store for orders, customers, staff and payments, not last-writer-wins JSON snapshots. Proposed target is relational D1 because integration already exists; verify deployment access and a transaction-capable transport in an isolated environment first. Do not assume Workers Binding APIs are available inside Vercel Next.js.

Define a repository interface with parameterized queries, atomic mutation + audit writes, idempotency and optimistic row versions. Local isolated SQLite adapter for tests; production adapter must pass the same invariants. D1 batching/session behavior must be verified for the actual chosen transport. No automatic fallback to ephemeral SQLite on a production write failure; return retryable failure, not success.

Cutover covers ALL writers to shared staff/order/catalog data, including website orders and old CMS/snapshot sync. Old writers must not overwrite migrated data. R2 may retain images/backups but not an alternate writable financial database. This is a gated infrastructure task, not an incidental dashboard refactor.

Dry-run migration on a copy, schema versioning, verified backups/restore, maintenance write freeze at cutover, row-count and money-total reconciliation, then smoke tests. Preserve existing snapshots and published content. No bulk fake customer import; existing orders may be linked only using actual buyer facts and explicit reconciliation. No live migration or credential rotation without proper deployment authorization.

## API and security gates

- Server authorization for all existing admin/CMS actions, including notification/cloud settings. New staff sessions rejected if account inactive/revoked or roles changed.
- POST/PATCH/DELETE origin/CSRF protection, bounded body sizes, validation and durable rate limiting; in-memory login map is not a distributed lockout solution.
- No production fallback session secret or seeded shared password; bootstrap owner through protected one-time setup, not a public bypass.
- 401 unauthenticated; 403 insufficient permission; 409 stale row/conflict; 422 invalid state/amount. Responses private/no-store, no customer data in public HTML/cache/analytics.
- Duplicate request/retry cannot duplicate orders or receipts; concurrent capacity checks retained. Public order lookup continues to require existing secure lookup mechanism.

## Acceptance examples

- Marketing sends price/status fields via either catalog or CMS endpoint: 403 and no mutation; no order/customer endpoint payload returned.
- Kitchen response excludes PII/money fields entirely; forbidden transition rejected even with forged UI request.
- Disabled staff cookie immediately unusable. One staff password cannot authenticate another account. Malformed/expired/revoked tokens denied.
- Completed merchandise 300000 and shipping 20000 => sales 300000. Collections 100000 yesterday + 220000 today => receipts correctly split by day. Refund 50000 today => today's net receipts 170000, historical completed sales unchanged and refund visible.
- Two concurrent collections exceeding outstanding balance: only one can succeed. Retry of same collection yields same result without duplicate money.
- Order completion/status/capacity/audit write failures roll back together. Cloud write failure shows failed save, not success.
- Empty periods show zeros with no invented trends; UTC+7 midnight/month boundaries, gifts, cancelled/demo orders, partial/refunded payments covered.
- Browser checks desktop 1440 and mobile CSS 390/430: nonoverlapping controls, accessible labels, keyboard focus, readable table alternative, actual drilldowns and source filters.
- All role endpoint tests, isolated migration/restore tests, npm test, npm run lint and production build pass. Score >=85/100 and no unresolved critical privacy, security, persistence or money issue before release.

## Explicit exclusions

Profit/costs, raw-material inventory, loyalty, automated Zalo/Messenger inbox import, ads integrations, payment-gateway settlement, mass customer export, medical profiling and recurring marketing outreach. New work does not authorize broader service/account access.

## Reference

- https://developers.cloudflare.com/d1/worker-api/d1-database/
- https://developers.cloudflare.com/d1/best-practices/read-replication/

These document Workers Binding capabilities, not proof the current Vercel REST/snapshot integration provides them.
