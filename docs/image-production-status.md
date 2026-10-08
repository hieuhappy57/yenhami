# Image Production: First Review Batch

Date: 2026-10-08

## Ownership

- photo_sources: real photo audit and square bowl candidate.
- asset_direction: corrected 17-asset production brief and gift banner candidate.
- web_assets: existing image audit, hero integration and stable page H1.
- root: real bowl/carry-box hero desktop and mobile variants, optimization and QC.

## Delivered

- `public/brand/banners/hero-slide-1-tho-su-v2.png`: generated desktop hero, 1672x941.
- `public/brand/banners/hero-slide-1-tho-su-mobile-v2.png`: generated mobile hero, 1024x1536.
- `public/brand/banners/hero-slide-1-tho-su-mobile-v3.png`: square mobile revision, 1254x1254, prevents handle cropping in the current short mobile hero.
- Desktop v2 and mobile v3 WebP versions are integrated locally, about 142 KB and 143 KB respectively. Mobile v2 is retained as a discarded review variant.
- `public/brand/banners/cat-banner-set-qua-v2.png`: review concept only. NOT integrated: regenerated small label text is inaccurate.
- `../HA-MI-LAUNCH/website-images/review/tho-yen-anh-that-v2.png`: square bowl review candidate. NOT assigned to a recipe until confirmed.

Original source files on the external volume are unchanged. No deployment or Git push performed in this batch.

## Tool and Prompts

All generated assets use the built-in image generation tool, not a CLI/API model override. The filename of the source brief does not confirm the underlying tool model.

Desktop prompt: reference-based product photography, wide 16:9. Source Ha Mi_01000.jpg defines the actual straight-sided white ceramic bowl, matching domed lid, gold swiftlet/green HA MI logo and mixed nest soup. The supplied packaging sheet defines ONLY the assembled teal gable carry box, with white face, mountain/wave layers, gold lines, swiftlets and gold sun. Warm wooden family table, daylight, spoon, slight steam; visible uncropped bowl and box; calm lower third for HTML overlay; no promotional text, extra jars, gift boxes or invented insulated bag.

Mobile prompt: derive a portrait 2:3 variant from the approved desktop candidate; preserve bowl, soup, lid, logos and teal carry-box artwork. Box upper center behind bowl, entire product group inside central 90% width, lower 30% calm tabletop for HTML overlay. No added copy or packaging changes.

Mobile revision prompt: square 1:1, same product and packaging, complete uncut box handle and bowl/lid grouped above, calm wooden tabletop below for the heading and CTA. No additional objects, labels or invented packaging. The generated product extends beyond requested top55%, so the mobile title is shortened and introductory kicker hidden to keep copy below the product.

The gift-banner prompt is recorded in image-production-plan.md; bowl prompt and references are recorded in image-source-audit.md.

## Remaining Gates

- Review hero packaging print and mobile HTML crop before publishing. AI scenes are illustrations based on actual product references, not untouched documentary photos.
- Confirm recipes before mapping the eight real bowl photos.
- Obtain verified individual jar/label references before producing 11 flavor assets. Do not turn generated variants into unsupported SKU claims.
- Complete other hero/category assets only after the first visual direction is accepted.

## Full Batch Completed

The user's follow-up authorized generation of the remaining images. The local website now uses the complete 25-image set: 3 hero images, 3 category banners, 11 separate jar images and 8 separate bowl illustrations. Each hero also has a dedicated mobile variant. Existing source files remain untouched; versioned PNG masters and optimized WebP derivatives are saved under public/brand/banners, public/brand/catalog and public/brand/dishes.

- Hero 2: hero-slide-2-set-qua-sen-vang-v3.webp and hero-slide-2-set-qua-sen-vang-mobile-v2.webp.
- Hero 3: hero-slide-3-yen-viet-nguyen-to-v2.webp and hero-slide-3-yen-viet-nguyen-to-mobile-v2.webp.
- Categories: cat-banner-set-qua-v3.webp, cat-banner-yen-hu-v2.webp, cat-banner-yen-tinh-che-v2.webp.
- Jars: hu-75ml-*-v2.webp (6) and hu-100ml-*-v2.webp (5).
- Bowls: all 8 recipe slugs with -v2.webp suffix.

Prompt sets and reference/QC details are in banner-batch-results.md, jars-75ml-batch-results.md, jars-100ml-batch-results.md and bowls-batch-results.md. All assets used the built-in image generation tool. Tiny package text and unverified flavor bands are illustrative, not documentary proof of a physical label. Unverified flavor text was removed rather than falsely retaining a different flavor. Product cards and details show the illustration status.

Image replacements are resolved centrally at product-read time; only known legacy URLs are replaced. Staff-customized images, prices, recipes and order logic are preserved. No cloud database migration, Git push or deployment was performed.

Verification: TypeScript passed; npm test passed 10/10, including all19 product targets existing, explicit ginger/four-flavor mapping, idempotency and preserving custom uploads. Browser verified all8 bowl and all11 jar images loaded, mobile hero variants and detail image. No horizontal overflow at360,390,430 or1440px (scrollWidth equals clientWidth). Saved mobile proof: menu-mobile-batch.png and jars-mobile-batch.png.

Publication remains separate from local implementation. Physical label originals and final recipe/brand-print approval are still needed before treating generated scenes as exact product photography.
