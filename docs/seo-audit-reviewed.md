# SEO Audit T01: Leader Review and Implementation Spec

Date: 2026-10-08. Worker: Gemini 3.8 Flash Medium via Antigravity CLI.
Conversation: 32bb32df-b0b2-4ced-abd9-b940315b253f.
Method: 11 line-numbered source files supplied directly; no worker tools or filesystem access requested. Worker returned a report in 46.90 seconds. No live-site, Search Console, Lighthouse or Rich Results tests were performed. No application code changed.

## Leader Acceptance

Score: 68/100 (correctness 20/35, compliance 18/25, verifiable evidence 14/20, actionable recommendations 9/10, clarity 7/10). This scores the report, not the website or model in general. Original report is NOT accepted unchanged; the curated findings below are independently checked against source.

Corrections:
- Worker incorrectly asserted that Xuan Phu does not exist in Da Nang and that Ba Ren must still be outside Da Nang. Current official commune material contradicts this. Do not change the configured address based on that claim. Actual business occupancy and coordinates still require owner confirmation.
- Worker said 8 supplied files but listed 11, matching the actual supplied count of 11.
- Worker generated file:///private/tmp links that do not point to the project's actual source. Use repository-relative references below, not those links.
- Root canonical inheritance is a risk for routes without overrides, not proof that existing content pages have the wrong canonical. Do not remove the root canonical without explicitly preserving homepage metadata.
- Canonical is a signal, not an instruction guaranteeing deindexing. The report overstates guaranteed indexing consequences and penalties.
- Robots disallow and noindex interaction needs review, but do not expose private admin pages by blindly removing robots restrictions or treating noindex as authentication.
- Certificate schema suggestions require authoritative type validation and verified business facts. Do not automatically replace one unsupported claim with another.
- The report's estimated cooking times, administrative/legal consequences and rating effects were unsupported; exclude them from accepted conclusions.

## Accepted Findings and Priority

### P1: Draft posts may be publicly accessible by slug

Leader-added finding: db/index.ts:2171-2188 queries posts by slug without is_published filtering. app/bai-viet/[slug]/page.tsx:20-28 and :50-54 check existence only, so a stored unpublished post can render as a public page and receive indexable metadata. No database content was read; the defect is established from the source path, not a claim that any particular draft is live.

Fix: guard both metadata and page rendering against !post.isPublished, using notFound. Preserve the published-only related-post query. Do not expose draft text in metadata. Prefer a public-route-specific guard rather than modifying unrelated admin semantics.
Tests: synthetic published fixture renders; synthetic draft fixture and nonexistent slug return notFound/404; draft metadata does not expose title/excerpt. Do not use customer records.

### P1: Product schema invents an unknown price

components/SeoJsonLd.tsx:226 uses product.priceVnd ?? 295000. app/san-pham/[slug]/page.tsx:30-32 uses a contact-price label when price is unavailable. ProductDetailClient's actual visible price should also be checked before finalizing the shared validity rule.

Fix: emit a priced Offer only when the actual price is finite and valid under the catalog's rules. Unknown prices must not receive 295000 or another placeholder. Preserve Product name, images, URL and breadcrumbs. Do not invent reviews to make an unpriced Product eligible for rich results.
Tests: known positive price remains exact VND; null/undefined/invalid value does not create priced Offer; availability mapping remains unchanged. Check any zero-price policy explicitly rather than assuming it.

### P2: Sitemap dates do not represent content changes

app/sitemap.ts:10, :15-59, :66 and :81 assign generation time as lastModified. :74 similarly falls back to now for posts.

Fix: omit unknown static/product/policy modification dates rather than inventing dates. Keep valid article updatedAt/createdAt dates, guarding invalid timestamps. Do not add schema fields or database migrations solely to fabricate timestamps. Inspect cloud-sync behavior before claiming sitemap freshness matches live records.
Tests: unchanged synthetic data yields unchanged sitemap date output across clocks; known article timestamp is preserved; missing/invalid dates do not generate now or Invalid Date; canonical URL coverage remains intact.

### P2: Internal SEO score does not prove SEO health

scripts/seo-audit.ts:145-183 checks helper output, not rendered route output. :201-207 checks component strings. :215-222 rewards credential string presence without factual verification.

Fix in a separate scoped task: add route-rendered canonical/noindex and parsed JSON-LD checks, use synthetic fixtures where possible, and label static/config checks honestly. Never present this score as ranking evidence. Do not execute the existing script during a strictly source-only audit because it reads database records.

### Verification Dependencies (Not Confirmed Production Defects)

- config/seo.ts:4-6 domain default: owner must confirm production domain, redirects and environment overrides.
- LocalBusiness location: verify actual business address, coordinates, hours and legitimate service coverage. City-center coordinates are not evidence of actual premises.
- ISO/FDA, price, quantity and delivery promises: validate supporting records and exact wording before publication. No automatic deletion or certification assertion without review.
- Preview indexing: inspect actual response headers/environment; source alone is insufficient.
- Noindex/robots: assess public cart/success pages separately from authenticated admin/API routes. Authentication remains the security boundary.

## T03 Proposed Implementation Task (Awaiting Model Approval)

Recommended worker: Gemini 3.8 Flash Medium, retained for continuity, not because cost/quality superiority has been demonstrated. Leader supplies a precise spec and validates all output. Worker cannot commit, push or deploy.

Scope: first three accepted defects only: draft visibility, unknown Product price and sitemap dates. No UI redesign, no business-fact changes, no domain migration, no credential edits, no analytics changes.

Expected files: app/bai-viet/[slug]/page.tsx, components/SeoJsonLd.tsx, app/sitemap.ts, focused tests; a small pure helper only if required for safe fixture-based tests. Avoid broad db/index.ts changes. Inspect ProductDetailClient price logic and existing test registration before implementation.

Delivery: minimal diff or patch, synthetic test cases, actual test output and limitations. Run TypeScript check and relevant tests. Leader reviews ownership of changes, confirms actual output, and only then commits task-owned files. Production deployment requires a verified target domain/config and applicable authorization; post-deploy smoke tests must not expose drafts or order data.

Token estimates are deferred per owner instruction. Raw retry usage retained for later analysis: input 35938, output 16165, thinking 10529, cache read 0, total 52103. Counters are provider-reported, not verified billing.

## Primary Sources Used by Leader

- Commune introduction, confirming Xuan Phu/Ba Ren: https://xuanphu.danang.gov.vn/gioi-thieu/gioi-thieu-chung
- Canonical signals: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Accurate lastmod: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
