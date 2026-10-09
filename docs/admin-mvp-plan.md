# Ha Mi Admin: execution plan

Date: 2026-10-09. Depends on admin-mvp-spec.md.
Leader completed source review/specification. Owner's subsequent "trien khai" approved dispatch of A1 to the proposed Gemini 3.8 Flash Medium; no blanket approval for later worker tasks is inferred.
Owner requested no further business-content questions; defaults are documented in the spec.
Per-task model approval from the established team agreement still applies; do not infer worker model approval from requirements approval.

## Priority

Admin MVP is the latest owner priority. Do not combine this with pending storefront-density changes or SEO article production.
Sequential milestones, not guaranteed calendar completion dates. Each milestone requires previous acceptance; no parallel writes to db/index.ts or admin routes.

| Milestone | Deliverable | Proposed worker | Gate |
| --- | --- | --- | --- |
| A0 - done | Source audit, permission matrix, money semantics, acceptance spec | Leader | Docs checked against source, no production changes |
| A1 - local proof done, cloud gate pending | Storage transport spike + migration design in isolated test adapter; document authoritative D1 cutover and all legacy writers | Gemini 3.8 Flash Medium (approved for this dispatch) | Local two-writer/retry and rollback proof passed; cloud transport/migration acceptance still pending; no live migration |
| A2 | Per-user authentication, session revocation, multi-role authorization and restricted projections across ALL admin APIs | Gemini 3.8 Flash Medium | Role/field permission matrix tests, no fallback credentials, no PII leaks |
| A3 | Order source/manual entry, safe transitions, assignment, append-only collections/refunds and atomic audit | Gemini 3.8 Flash Medium | Payment/capacity concurrency tests, legacy reconciliation explicit |
| A4 | Customer profiles, normalized-phone lookup, addresses and time-filtered history | Gemini 3.8 Flash Medium | Buyer vs recipient separation, no silent ambiguous merges |
| A5 | Compact dashboard and report drilldowns; modularize only touched admin UI sections | Gemini 3.8 Flash Medium | Correct time/source/customer filters, receipt/sales reconciliation, desktop/mobile screenshots |
| A6 | Staff administration, restricted marketing forms, kitchen queue and end-to-end role flows | Gemini 3.8 Flash Medium | Last-owner protection, account revocation, production build and complete role tests |
| A7 | Isolated staging rehearsal, backup/restore, approved cutover and smoke test | Leader; worker only if separately approved | No deployment until target/access approved; no unverified real-money tests |

## Model rationale

Gemini 3.8 Flash Medium is proposed for continuity with the installed Antigravity workflow, not as a proven superior/security-specialist model. Leader supplies narrowly scoped source and acceptance cases and independently reviews code. GPT 5.6 is not assumed available in the CLI. Priority is completion quality; token benchmarking deferred by owner.

Do not dispatch further tasks without task-specific model approval. No repeated approval reminders from heartbeat when unchanged. No business-content questions are needed for this spec. Do not silently replace models or bypass permissions.

## A1 status on 2026-10-09

See admin-a1-storage-feasibility.md. Worker conversation 22f76154-befb-4bc5-b39d-a670759d73c9. Leader repaired proposal defects and verified an isolated adapter with actual simultaneous worker-thread commands. Full tests 38/38 and TypeScript pass; not a deployed payment repository. Cloud staging and versioned migration gate unresolved, so A2 is not dispatched.

## Isolated interface preview on 2026-10-09

Owner requested a visible demo before production and asked to continue. A5 demo-only preview delivered using Antigravity Gemini 3.8 Flash Medium, reviewed and repaired by leader. See admin-demo-delivery.md for evidence, scope and scores. Local preview: http://127.0.0.1:3018/. Tests now 41/41; TypeScript passed. This does not complete A5/A6, resolve the A1 cloud gate, or authorize deployment. Fixtures and UI role switching are not real customer storage or authentication.

## A1 worker brief

Input: admin-mvp-spec.md, relevant cloud-sync/schema/order transaction code and synthetic tests only. Do not pass .env, cloud tokens, customer DB or full unrelated source.
Output: transport feasibility report, scoped adapter/migration patch for isolated execution, fixture tests, unresolved integration risks. No cloud resource creation, live DB reads/writes, credential edits, live migration, commit/push/deploy.
Scope: authoritative-storage contract, atomic/idempotent/versioned writes and cutover compatibility, not UI or full feature implementation. Stop if actual production credentials or new service access are required.
Review rubric: correctness 35, spec/security compliance 25, test evidence 20, maintainability 10, operational clarity 10. Passing requires >=85 and no critical issue. If atomic writes cannot be demonstrated with selected transport, mark architecture unresolved; do not proceed to real payment writes.

## Leader delivery protocol

Before every worker: record git status/HEAD, approved task/model, allowed files and stop conditions.
After worker: inspect patch and tests, independently verify money/permission assertions, score actual output, commit only accepted task files. Preserve concurrent changes. Do not label source-only review as browser or production verification.
Milestone reports distinguish implemented, tested locally, staged, deployed and production-verified. No fabricated usage, dates or customer records.

## Pending deployment configuration (not business questions)

Verify effective persistence provider/transport, staging target, owner bootstrap mechanism, secret provisioning, backup destination and cutover authority at the appropriate gated task. Do not expose values in docs or chat; authorized secure setup is separate from this planning deliverable.
