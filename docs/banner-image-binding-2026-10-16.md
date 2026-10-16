# Banner image binding and recovery

Production still referenced the bundled desktop/mobile defaults after the
owner reported an uploaded-image mismatch. The previous verification only
saved unchanged settings; it did not test a newly uploaded banner.

## Fix

- A verified R2 banner upload now binds only the selected site-image field
  in an authoritative D1 transaction before returning success. Text drafts
  and other image slots are not overwritten.
- The client requires the canonical image binding acknowledgement; uploading
  an object alone cannot produce a banner-success message.
- Editor-image library is restricted to authenticated content staff, lists
  only public image objects under `uploads/editor/`, and never returns
  database backups or storage credentials. Choosing a prior upload updates
  only the selected banner field.
- Show existing image previews when settings load; previews use contain so
  a crop is not mistaken for a different image.
- Block choosing uploads while configuration fields are disabled.

## Tests

The CMS isolated test now verifies invalid slots are rejected before R2 writes
and a successful banner upload remains attached after reopening the database.
The client test rejects R2-only success without D1 field acknowledgement.

R2 object listing follows the official API:
https://developers.cloudflare.com/api/resources/r2/subresources/buckets/subresources/objects/methods/list/

## Recovered Original

The authenticated image library found the owner's sole editor image:
`untitled-design-3-.jpg`, 2032 x 774 pixels, object hash
`e4877ccf2601d82f53fd13b1f636cc032cb42c40a3609a199a77bea6171298a0`.
It is a complete designed banner with text and QR artwork. Restored this
object to the desktop hero through the actual admin picker.

Uploaded designed banners now display intact with contain fitting, no
duplicate heading, overlay or seal. They replace the default slideshow so
the page cannot rotate back to an old bundled image. Until a separate
mobile banner is uploaded, mobile uses the same complete uploaded artwork.

## Live Verification

- 116 tests passed; TypeScript and production builds passed.
- Image-binding / library release: `33ce0cd`, deployment
  `dpl_EA3tGPwVA1uo6wnbaspf9LPfY6Hp`. Unauthenticated library request returned
  401, authenticated admin recovered the sole original upload successfully.
- Display release: `2813e32`, deployment
  `dpl_BQQTMCMDXgoxbXE76KW74ZE5L2z1`, promoted after HTML verification.
- Official UI at 1440x900 and 390x844 uses the exact recovered object URL;
  natural image size is 2032x774, object-fit is contain, no duplicate hero
  heading or slider buttons, and no horizontal overflow.
- Desktop/mobile screenshots saved under
  `output/owner-banner-restored-{desktop,mobile}-2026-10-16.jpg`.
- Did not modify the image bytes, other site text, product prices or orders.
  Retained concurrent address/map updates already present in the repository.

## Carousel Correction

The owner requires the hero slideshow to remain enabled. Superseding the
single-banner decision above: retain all three slides, 5.5-second autoplay,
previous/next arrows and slide selectors even after an uploaded banner is
attached. Only the uploaded first slide suppresses duplicated text/seals and
uses contain fitting; other slides retain their copy. Keep the responsive
container height stable between slides to prevent page jumps. Regression
coverage exercises autoplay wraparound, both arrows and direct selection
with an uploaded banner present.

Verified and released correction `b4a3e44` as deployment
`dpl_DZR5wX84yzNNdHHTh2JCcwa7aGrG`. All 116 tests, TypeScript and build passed.
On yenhami.com, exercised Next, Previous, direct slide 2/3 selection and
observed autoplay return from slide 3 to the uploaded first banner. Desktop
height remains 580px; mobile height remains 380px with all three selectors
and no horizontal overflow. No stored settings, images or orders changed.
Proof: `output/hero-carousel-restored-2026-10-16.jpg` and
`output/hero-carousel-restored-mobile-2026-10-16.jpg`.

## Narrow Desktop Slide Layout

For the reported third-slide screenshot: move the CTA below the copy in a
left-aligned column, reserve clearance from the fixed contact rail, reduce
kicker/headline sizing and leave dedicated room above the pagination dots.
Replace the global green rectangular selector focus outline with a rounded
white keyboard-only indicator, and expose the current slide via aria-current.
Switch the header to its existing compact navigation below 1280px, where
full desktop navigation previously wrapped into multiple lines.
Keep all three slides, autoplay and the owner's uploaded first image.

Released layout fix `e494482` as `dpl_EZVM6Qsh8ZvNtuw9YczBZ65oab5w` after
116 tests, TypeScript, build and staged HTML checks passed. On official
slide 3 at 1110x714 and 390x844, the CTA did not intersect contact controls;
mobile CTA stayed inside the 380px hero and no horizontal overflow occurred.
All three selectors remain present, aria-current identifies slide 3, and
pointer focus no longer produces the green rectangular outline. Screenshot:
`output/hero-slide-layout-fixed-2026-10-16.jpg`.

## Gift Slide Image Correction

The owner's follow-up screenshot identifies slide 2. Site-settings wiring
incorrectly used the 420x420 `giftingImage` product shot as both hero images.
Restore dedicated 1440x810 desktop and 750x750 mobile hero artwork for slide
2; keep the gift-section image independent and keep its configured title /
badge. Add regression assertions for both sources with a square gift image
present in the settings. No uploads or stored settings are rewritten.

Released correction `8891689` as `dpl_J3txM4Rm9EaWk2mexrDQGku2FXaA`
after 116 tests, TypeScript and build passed. Verified official slide 2
at desktop 1110x714 and mobile 390x844: the desktop source loads at
1440x810 and the mobile source at 750x750. Mobile has no horizontal
overflow; all three selectors remain. No orders, product data or stored
site settings changed. Proof: `output/gift-hero-slide-fixed-2026-10-16.jpg`
and `output/gift-hero-slide-fixed-mobile-2026-10-16.jpg`.
