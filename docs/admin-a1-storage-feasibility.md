# A1: isolated storage proof and deployment gate

Date: 2026-10-09. Baseline HEAD: 09e6176; initial worktree clean.
Approved worker: Gemini 3.8 Flash Medium through Antigravity CLI.
Conversation: 22f76154-befb-4bc5-b39d-a670759d73c9. Worker returned proposed file contents only; no tools, customer data, cloud access or direct edits.

## Delivered and independently reviewed

- db/admin-storage-contract.ts: explicit versioned command identity and minimal store interface.
- db/admin-storage-sqlite.ts: injected SQLite connection, parameterized commands, optimistic version check, idempotency collision rejection and mutation/audit/command commit in one transaction.
- tests/admin-storage.test.ts: isolated temporary database; two connections, rollback injection, reopen, safe integer validation and simultaneous worker-thread writes.
- This is a generic synthetic aggregate balance, NOT the real payments ledger, customer database, full migration or production adapter. No application route imports it. No existing DB/provider/auth/UI behavior changed.

## Worker review

Raw proposal: 65/100 (correctness 20/35, compliance 19/25, evidence 10/20, maintainability 8/10, clarity 8/10). Not accepted unchanged.

Leader corrections:
- Replay test changed expectedVersion, violating its own hashed identity contract; corrected to exact replay and added each-field collision tests.
- Missing safe-integer check on nextVersion; added overflow guard and resulting-balance/version boundary tests.
- Audit rollback test referred to nonexistent balanceVnd instead of balance_vnd.
- Constructor parameter property unsupported by this repo's strip-only test runtime; replaced with explicit field assignment.
- Added aggregate ID validation, schema numeric checks and concrete row types instead of any.
- Original tests only interleaved sequential connections; added genuinely simultaneous worker threads behind a shared start gate, with separate connections and bounded lock wait.
- Worker report called unexecuted local design PROVEN and suggested interactive CAS verification inside a binding batch. These claims were not accepted. Worker binding batches do not expose a mid-batch application callback.

Reviewed local artifact: 89/100 (32/35, 24/25, 17/20, 8/10, 8/10). Score applies only to isolated proof; not acceptance of complete A1 cloud migration gate or entire admin MVP.

## Verification

- Baseline npm test: 25/25 passed.
- Focused tests: 13/13 including enclosing test, covering independent entities, stale writers, exact replay, changed-payload collisions, missing entities, invalid values, overflow, audit rollback, durable reopen and simultaneous writes/retries.
- Full npm test after changes: 38/38 passed; npm run lint passed.
- Execution runtime is local Node v26.3.1. Project declares Node 22.x; target-version CI/staging verification remains required. No claim of execution on Node 22.
- npm run build passed. Existing workspace-root/middleware/module warnings remain outside this task. No browser verification needed for this isolated non-UI change.
- Provider-reported worker usage: input 23791, output 15547, thinking 8800, total 39338; duration 114.05 seconds. Not verified billing or an efficiency benchmark.

## Cloud transport assessment

Current db/index.ts uses a REST query helper and overwrites hami_cloud_state with a serialized SQLite snapshot; R2/Gist paths similarly persist entire snapshots. Application responses can succeed despite an unsuccessful cloud sync. This source architecture cannot be accepted as a concurrent staff/payments store based on local tests alone. No real production data loss was observed or tested.

Cloudflare documents rollback on statement failure for Workers Binding batch. A stale UPDATE affecting zero rows is not itself a SQL error. A cloud implementation must enforce the mutation guard and corresponding audit/idempotency writes atomically, not blindly append audit after a zero-row mutation. Binding capabilities must not be attributed to Vercel's existing REST helper without proof.

Proposed next infrastructure path: retain D1, evaluate a narrowly scoped authenticated Worker-side command endpoint using binding batches and database-enforced guards. No Worker deployment/resource/access grant performed. Transport and authentication implementation need a separately approved task and isolated staging proof; alternate databases are not silently provisioned.

Primary documentation consulted:
- https://developers.cloudflare.com/d1/worker-api/d1-database/ (binding batching, transactions on statement failure)
- https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/ (existing transport shape)

## Writer/read cutover inventory

- app/api/orders/route.ts: public creation, server quote/idempotency/reservations and cloud sync; must move with admin orders, not remain a snapshot writer.
- app/api/admin/orders/route.ts: status/payment/shipping mutations; replace with authoritative commands.
- app/api/admin/catalog/route.ts: product price/status and delivery-slot capacity.
- app/api/admin/cms/route.ts: products/variants, posts, jobs, site/notification settings and cloud initialization actions; protect nonfinancial shared tables too.
- app/api/admin/auth/route.ts: credentials currently read local staff data; must use authoritative active accounts after cutover.
- db/index.ts: seed/default staff, local mutations, schema initialization, build/apply snapshot, D1 relational copies, R2 and Gist sync. Do not let seeding or an old deployment revive obsolete staff/data.
- Catalog/quote/storefront/product/blog/sitemap/order-lookup readers must use the matching authoritative data after cutover. Existing lookup-token checks remain intact; notification delivery must occur after durable commit without duplicate sends on retries.

## Remaining A1 gate (not completed)

1. Verify selected cloud transport in staging: two concurrent writes, exact retries after ambiguous network failure, zero-row CAS rejection, statement failure rollback and subsequent read consistency.
2. Implement versioned migration, dry-run export/restore and snapshot reconciliation on a COPY; do not initialize production tables from this admin_spike_ schema.
3. Define authenticated command access and secret provisioning securely; never expose D1 credentials in the browser or use a public write endpoint.
4. Freeze every legacy writer at approved cutover, invalidate stale deployments, migrate shared data and switch readers together. R2 remains image/backup storage, not competing writable financial state.
5. Reconcile row counts, order snapshots, capacity, staff access and money totals; legacy PAID statuses do not create invented receipt entries or timestamps.
6. Production mutations fail closed on storage failure; no silent ephemeral fallback. Verified backup/restore and rollback plan precede cutover; rollback must preserve post-cutover payments, not simply restore an old snapshot.

No cloud migration, role rollout, dashboard, customer access, commit push or deployment performed in A1 local proof. A2 remains queued until the authoritative-storage gate is accepted.
