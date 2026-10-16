# Home catalog freshness fix

## Observed failure

The production catalog API returned the owner's current data, including
`Thượng Yến Nguyên Vị` at 320000 VND and the renamed 70ml jars. The homepage
HTML did not contain those names. Its response was prerendered
(`x-nextjs-prerender: 1`, `age: 2824`, `x-vercel-cache: REVALIDATED`).
The database save had succeeded; the public home representation was stale.

## Fix

Render the homepage per request, like the existing product detail, gifting
and fresh-bowl pages. Always await the forced D1 refresh before reading the
catalog. Do not rely on an ISR build-time seed or cache invalidation alone
for commercial product names, prices and deletion visibility.

The jar volume filter also used hardcoded 75ml/100ml tabs, a default 75ml
selection, fixed price ranges and an 11-product count. Generate tabs from
actual product volumes and show all jars by default, with a dynamic count.
This prevents newly edited 70ml jars from being hidden by an obsolete filter.

## Verification

- Regression test requires request rendering and checks successive home renders
  receive changed names/prices and removed products after a forced sync.
- CMS integration test saves a new name and price and verifies canonical data;
  the order-history snapshot assertion follows that saved name.
- Jar regression test checks 70/100/120ml filters, current count and visibility.
- No production products or prices changed during testing.

## Release verification

- 110 tests passed; TypeScript and production build passed.
- Commits: `3d87cc0`, `cee4bfa`.
- Tested staged production deployment and promoted the same build:
  `dpl_9CmiZNWZf6gPvarUMXevDgB2JJiB`.
- Official homepage returned HTTP 200, `age: 0`, and
  `cache-control: private, no-cache, no-store, max-age=0, must-revalidate`.
  All 21 current catalog names were found in its HTML.
- Chrome shows 6 fresh bowls, including Thượng Yến Nguyên Vị 320000 VND,
  and all 10 jars with generated 70ml/100ml tabs. No browser console errors.
- The existing Chrome admin session expired on reload; no production CMS
  write was performed. The owner's already-saved D1 changes were used for
  live verification, while mutation tests ran against isolated SQLite.
