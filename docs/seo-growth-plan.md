# Ha Mi SEO Growth Plan

Date: 2026-10-08. Status: proposal, no worker dispatched and no production changes authorized by this document.

## Ownership and Approval

- Team Leader (current GPT 6.1 Sol session): brainstorm, research, spec, task planning, independent review, scoring, scoped commits, deployment and post-deployment analysis.
- Workers: user's Gemini 3.8 and GPT 5.6 through Antigravity. Verify exact installed model identifiers and account availability before invoking them; never silently substitute a model.
- Before EVERY dispatch: present task, recommended model, reason, input/output token estimate, allowed files, acceptance tests and stop conditions. Wait for human model approval.
- Workers cannot deploy, push, change credentials, expand scope or select another model. Return diff, tests, assumptions, actual usage if exposed and remaining risks.
- Leader accepts at >=85/100 with no critical correctness, privacy, truthfulness or regression issue. Score: correctness 35, spec compliance 25, verified tests 20, maintainability 10, user-facing quality 10.
- Record pre-existing changes. Commit only reviewed task-owned changes. Deploy only after checks and applicable authorization, then smoke-test production and retain rollback reference.

## Model Experiments

Recommendations are hypotheses, not established quality or price advantages.
Start with two equivalent small tasks using identical facts, output limits and rubric: one Gemini 3.8, one GPT 5.6, after approval. Repeat on another comparable pair before drawing conclusions. Keep drafts isolated from production.
Compare accepted output quality, input/output/cached tokens separately, latency, repair count and total tokens per accepted deliverable, including leader review and repairs. Include cash cost only when actual account rates are known. If provider usage is unavailable, label estimates; do not claim measured savings.
Avoid passing full chat history or the entire repo. Supply a short spec and relevant files. Default to one revision; ask before additional runs or scope expansion. The winner applies only to that task category, not all work.

## Goal and Measurement

## Owner Update and Daily Queue

Owner confirmed main business address: 180 Hoang Minh Giam, Hoa Xuan, Da Nang, Vietnam. Ba Ren is the production workshop, not the main store. Application code has not yet been updated with this clarification. Verify store coordinates separately; do not substitute city-center coordinates or infer an unverified map pin.

Daily thread heartbeat created: seo-h-mi-c-ng-vi-c-v-ti-n-h-ng-ng-y, active at 09:00 in the app's local scheduling timezone (owner timezone Asia/Ho_Chi_Minh). Notify meaningful results/new actionable plans/blockers, not unchanged status. Scheduling does not grant worker/model approval.

Execution days below start when the relevant task/model approval and dependencies are ready, not promises that externally controlled indexing or profile verification completes on those days.

| Execution day | Scoped assignment | Proposed model, requires approval | Acceptance |
| --- | --- | --- | --- |
| 1 | Fix draft-publication guards, unknown schema price, and main-store address versus workshop distinction | Gemini 3.8 Flash Medium | Synthetic regression tests, TypeScript pass, no invented geo/facts, leader review |
| 2 | Correct sitemap dates; inspect approved production domain/canonical and preview indexing | Gemini 3.8 Flash Medium | Stable honest dates, canonical/redirect evidence; unresolved domain facts explicitly blocked |
| 3 | Improve truthful home/hot-product metadata and internal linking without adding clutter | Gemini 3.8 Flash Medium | Query-to-page map, factual copy, mobile review |
| 4 | Configure/validate Search Console and analytics with owner access | Select available model after task scope known | Sitemap submission/access confirmation and privacy-safe conversion tests |
| 5 | Verify/complete Google Business Profile and real product/process media | Gemini 3.8 Flash Medium for drafting only | Owner-approved listing facts; verification status reported, not assumed |
| 6 | Draft two evidence-based product comparison/gift articles | Gemini 3.8 Flash Medium | Owner-approved product facts, useful unique content, no unsupported health claims |
| 7 | Review baseline, deployed changes, indexing and request funnel; plan week two | Leader review; worker model proposed only if needed | Evidence-backed report; next priorities depend on results |

Days 1 and 2 were separately approved for Gemini 3.8 Flash Medium and completed locally on 2026-10-08. Owner confirmed yenhami.com as the production domain. See seo-day1-delivery.md and seo-day2-delivery.md for review and verification. Deployment has not been performed. Future tasks still require per-task model approval; no automatic dispatch or deployment is implied by this queue.

## Goal Definition

Target: compete for organic position 1 for "yến sào đà nẵng" while generating qualified orders for hot freshly cooked bird's nest products. No guaranteed position or deadline.
Separate organic website positions from Google Maps/local pack positions. Local results vary by location; measure a fixed set of locations and devices, not one personalized search.
Baseline requires Search Console, GA4, Business Profile and a Da Nang-localized SERP sample. Current web searches are not a verified local Google top-10 ranking report. Production fetches through research tool failed; this is not evidence of an outage or deindexing.
Report weekly: target query impressions/clicks/CTR/average position (with GSC limitations), target-page indexing/canonical, organic qualified requests, confirmed orders, Maps calls/directions/website clicks and fixed-location ranking observations. A form submission is a request, not a paid order.

## Initial Source Findings

- Existing metadata, sitemap, robots and Organization/LocalBusiness/Product helpers; strengthen rather than rebuild blindly.
- config/seo.ts defaults to https://yenhami.com unless overridden. User preview previously used yenhami.vercel.app. Confirm actual production environment, domain ownership, redirects and canonical before calling this a defect.
- Metadata, homepage and schema repeat 295,000 VND, 35g, two-hour delivery, ISO/FDA claims. Confirm current product data, measurement basis, delivery conditions and supporting documents. A registration must not be presented as product approval. Do not publish unsupported health claims.
- LocalBusiness coordinates are central Da Nang while configured address is Thon Ba Ren, Xa Xuan Phu. Verify real location and current administrative names/service coverage; do not use city-center coordinates as the store location.
- Sitemap uses current time for product/static lastModified. Replace with meaningful change dates where available; include only intended indexable canonical URLs. priority/changefreq are not a ranking strategy.
- SEO audit currently rewards geo tags and certification strings. Replace such checks with evidence of rendered canonical, status codes, indexability, schema consistency and truthful data. AI crawler permissions/llms files are not substitutes for Google SEO.

## Query-to-Page Map

| Intent | Primary URL | Content |
| --- | --- | --- |
| yến sào Đà Nẵng; mua yến sào tại Đà Nẵng | / | Brand, product range, verified pricing, real local presence and purchase options |
| yến chưng nóng Đà Nẵng; yến tươi chưng nóng | /yen-tuoi-chung-nong | Compact menu, ingredients, serving size, preparation and actual delivery conditions |
| quà tặng yến sào Đà Nẵng | /gui-qua | Real packaging, recipient use cases, prices, personalization and delivery |
| Specific product purchase | /san-pham/[slug] | Unique product facts, price, availability and ordering |
| Local contact/trust | /lien-he and /ve-ha-mi | Verified business details, real people/process/photos and documents |
| Informational questions | /bai-viet/[slug] | Useful original answers linking naturally to matching products |

Do not initially add a competing /yen-sao-da-nang landing page. Revisit only if search intent/data justify a distinct page. No mass-produced district pages or duplicate product descriptions.

## Delivery Roadmap

### Days 1-3: Baseline and Truth

Confirm main domain, real address, phone, hours, prices, ingredients, certificates and delivery area. Obtain owner-approved Search Console/GA4/Business Profile access without sharing passwords in chat.
Capture localized organic top-10 and local-pack samples with date/device/location. Compare intent, product breadth, local proof, content, referring domains and UX. Do not assume search-result order from a general research engine equals Google position.
Deliver baseline report, verified fact sheet, keyword map and prioritized backlog.

### Days 4-10: Technical Foundation

Resolve main-domain canonical/301/HTTPS consistency and preview index policy. Check rendered HTML, all canonical routes, sitemap, robots and internal page noindex requirements. Crawl blocking alone does not remove an indexed URL.
Verify structured data against visible factual content; add no invented ratings or certifications. Validate eligible types using Google's Rich Results Test.
Fix mobile overflow and performance without lengthening homepage copy. Targets at field p75: LCP <=2.5s, INP <=200ms, CLS <=0.1; lab tests are diagnostic, not proof of field compliance when traffic is insufficient.
Instrument product selection, Zalo/Messenger/call clicks and successful request submission without logging phone/address/notes in analytics. Reconcile confirmed orders separately and avoid duplicate events.
Deliver tested diff, before/after evidence, preview and leader acceptance report.

### Weeks 2-4: Commercial Pages and Local Presence

Improve homepage and hot-product page first, preserving clean mobile UI and two-column menu. Use real photography for evidence; label generated illustrations where appropriate.
Complete/verify eligible Business Profile with real-world name, correct category, genuine location or service-area setup, hours, products and website. Do not create fake branches or keyword-stuffed names.
Request honest reviews from actual customers without incentives or selective review gating; respond helpfully. Publish real preparation/packaging/delivery media with consent.
Publish four fact-checked articles first: hot freshly cooked versus packaged jars; price/portion comparison using Ha Mi's verified catalog; storage and reheating based on validated product instructions; gift selection/delivery process in Da Nang. Health-sensitive content needs qualified sourcing/review, not AI medical advice.

### Weeks 5-8: Evidence and Authority

Publish one or two useful pieces per week only when original evidence is available. Add genuine FAQs gathered from orders and customer service.
Seek legitimate local supplier/partner/media coverage. No paid ranking-link packages, PBNs, fabricated reviews or invented "top stores" comparisons. Disclose sponsorship and qualify paid links appropriately.
Use existing customer consent for authentic testimonials/case studies. Improve internal links and product content based on query/page performance, not arbitrary word counts.

### Weeks 9-12: Iterate

Compare rolling 28-day windows and account for seasonality/low sample sizes. Diagnose no impressions (discovery/indexing/intent), impressions but low CTR (snippet/intent), and clicks without orders (offer/UX/delivery).
Reprioritize pages and snippets using evidence. Set realistic ranking targets after baseline; twelve weeks is a review horizon, not a Top-1 promise. Monitor 3-6 months or longer if competition and authority require it.

## Proposed Worker Queue (Approval Required)

| Task | Proposed model | Reason, pending benchmark | Draft input/output envelope |
| --- | --- | --- | --- |
| T01 Read-only technical SEO audit | GPT 5.6 | Trial for code tracing and reproducible findings | 12k/3k tokens |
| T02 SERP/content comparison on leader-supplied evidence | Gemini 3.8 | Trial for intent synthesis and Vietnamese content outlines | 8k/3k tokens |
| T03 Approved P0 technical fixes | GPT 5.6 | Continue only if T01 score supports choice | 15k/5k tokens |
| T04 First commercial-page content spec/draft | Gemini 3.8 | Compare against equivalent GPT draft before defaulting | 8k/3k tokens |

Envelopes are proposal estimates, not provider-enforced caps or price claims. For T01: read-only, no commits/deployment; findings require file/line evidence, distinguish source hypotheses from production failures, and provide checks to reproduce. Leader supplies only necessary context. Stop and report if access or model availability is missing.

## Sources

- https://developers.google.com/search/docs/fundamentals/do-i-need-seo
- https://support.google.com/business/answer/7091?hl=en
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/appearance/core-web-vitals
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
