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
