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

## Verification

- Regression test requires request rendering and checks successive home renders
  receive changed names/prices and removed products after a forced sync.
- CMS integration test saves a new name and price and verifies canonical data;
  the order-history snapshot assertion follows that saved name.
- 109 tests passed. No production products or prices changed during testing.
