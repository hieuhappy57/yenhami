# Site content / appearance synchronization

## Cause

The inline admin site-settings handler only assigned `appState.site` and
displayed success; it never called the CMS save endpoint. The public hero,
gift banner, contact shell and about introduction also used hardcoded copy
instead of the stored settings. Some database reads automatically replaced
specific saved titles/copy with legacy defaults.

## Changes

- Load current settings from the authenticated CMS endpoint before editing.
  Disable fields until ready; preserve unsaved edits across tab switches.
- Save through the authenticated, origin-checked authoritative D1 transaction.
  Show success only after server acknowledgement. On failure keep form input.
  Refuse saves while an image upload is still pending.
- Force a fresh D1 read for CMS GET; invalidate public layout on settings save.
- Request-render public layout, share its settings read with the homepage,
  and connect hero text / responsive image sources, gifting content, notice,
  hotline, Zalo, opening hours, address and about introduction.
- Allowlist text fields and validate image / link schemes; reject base64 and
  executable URLs. Keep uploaded media in R2 through the existing uploader.
- Stop rewriting intentionally saved copy at read time.
- Use the confirmed main-store address for defaults. Bà Rén stays the workshop.

## Hero Images

- Existing desktop source: 1440 x 810 pixels; the fixed-height hero crops it.
- Existing mobile source: 750 x 750 pixels.
- Recommended desktop upload: 1920 x 780 pixels (~2.46:1).
- Recommended mobile upload: 1080 x 1080 pixels (1:1).
- Images use object-cover, so some cropping varies by viewport. Keep the
  subject centered and the bottom area free for the existing text/CTA overlay.
- Existing upload limit is 3 MB; prefer compressed WebP or JPG.

## Verification Scope

Regression tests cover server-read freshness, saving/reopening persisted
settings, preservation of custom copy, rejecting unsafe links, hero image
selection, and browser-handler acknowledgement / failure / unsaved-input
behavior. Production verification must not replace the owner's copy or images
with temporary test content.

## Production Result

- 114 tests, TypeScript and production build passed. Implementation commit
  `fde148d`; tested deployment `dpl_27oSiL5QjBP1VgQo65XGEvTS3P5U` was promoted
  to yenhami.com.
- Saved the existing authoritative configuration using the actual admin form
  without editing any values. Saw the server-acknowledged success message,
  reloaded the admin page and compared all 18 displayed fields: unchanged.
- Public hero uses the saved title, lead, CTA and image sources. Desktop
  1440x900 viewport loads the 1440px desktop image; mobile 390x844 viewport
  loads the 750px mobile image. No horizontal overflow observed.
- Admin and storefront browser error logs were empty during verification.
- Original image files, product prices and order data were not modified.
- Screenshots: `output/site-settings-fixed-2026-10-16.jpg`,
  `output/site-hero-desktop-2026-10-16.jpg`,
  `output/site-hero-mobile-2026-10-16.jpg`.
