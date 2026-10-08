# Ha Mi Image Integration Audit

Date: 2026-10-08. Source: `gpt_image_2_design_brief.md` and the current website repository.

## Current State

- `components/LangfarmHeroCarousel.tsx` supplies the three hero slides. Slide 1 has a separate desktop/mobile pair; slides 2 and 3 reuse catalog photographs.
- `components/CatalogProductLinesSection.tsx` contains the three category banners and renders product cards from `ProductRecord.imageUrl`.
- `app/page.tsx` contains four featured-category thumbnails, separate from the full-width category banners.
- `db/demo-fixtures.ts` supplies all 11 jar product image URLs. The URLs currently repeat generic product/group photographs.
- Existing bowl files already cover all eight dishes in `public/brand/dishes/`. Replacing those files changes all consumers of those URLs.
- None of the 17 core asset files requested by the brief exists at the time of this audit. Do not replace a live URL with a candidate before its file has been generated and reviewed.

## Core Asset Targets

| Placement | Public URL | Existing fallback |
| --- | --- | --- |
| Hero: hot bowl | `/brand/banners/hero-slide-1-tho-su-2h.jpg` | `/brand/hero-desktop-clean.jpg`; mobile `/brand/hero-mobile-clean.jpg` |
| Hero: jar gift set | `/brand/banners/hero-slide-2-set-qua-sen-vang.jpg` | `/brand/catalog/set-qua-hop-sen-en.jpg` |
| Hero: raw nests | `/brand/banners/hero-slide-3-yen-viet-nguyen-to.jpg` | `/brand/catalog/nha-may-so-che.jpg` |
| Category: gifts | `/brand/banners/cat-banner-set-qua.jpg` | `/brand/catalog/set-qua-hop-sen-en.jpg` |
| Category: jars | `/brand/banners/cat-banner-yen-hu.jpg` | `/brand/catalog/set-qua-6-hu-6-vi.jpg` |
| Category: refined nests | `/brand/banners/cat-banner-yen-tinh-che.jpg` | `/brand/catalog/nha-may-so-che.jpg` |

Hero desktop uses a wide 1440 x 580 container while mobile uses a tall 380px container. A desktop-only composition cropped with `object-cover` can lose both product and real packaging on mobile. Produce a separate mobile crop or provide a reviewed focal position. The brief labels 1536 x 1024 as 16:9, but that size is 3:2. Use an actual approved ratio.

## Jar Product Mapping

All targets below are under `/brand/catalog/`.

| Product ID | Target file | Existing fallback file |
| --- | --- | --- |
| `cat-yen-hu-75ml-duong-phen` | `hu-75ml-duong-phen.jpg` | `yen-hu-75ml-100ml-cam-tay.jpg` |
| `cat-yen-hu-75ml-co-ngot` | `hu-75ml-co-ngot.jpg` | `yen-hu-3-chai-khay-go.jpg` |
| `cat-yen-hu-75ml-gung` | `hu-75ml-vi-gung.jpg` | `yen-hu-3-chai-khay-go.jpg` |
| `cat-yen-hu-75ml-nhan-sam` | `hu-75ml-nhan-sam.jpg` | `set-qua-6-hu-6-vi.jpg` |
| `cat-yen-hu-75ml-dong-trung` | `hu-75ml-dong-trung.jpg` | `set-qua-6-hu-6-vi.jpg` |
| `cat-yen-hu-75ml-tu-vi` | `hu-75ml-tam-tu-vi.jpg` | `set-qua-6-hu-6-vi.jpg` |
| `cat-yen-hu-100ml-duong-phen` | `hu-100ml-duong-phen.jpg` | `yen-hu-100ml-red.jpg` |
| `cat-yen-hu-100ml-hat-chia` | `hu-100ml-hat-chia.jpg` | `yen-hu-100ml-red.jpg` |
| `cat-yen-hu-100ml-mat-hoa-dua` | `hu-100ml-mat-hoa-dua.jpg` | `yen-hu-100ml-red.jpg` |
| `cat-yen-hu-100ml-dong-trung` | `hu-100ml-dong-trung.jpg` | `yen-hu-100ml-red.jpg` |
| `cat-yen-hu-100ml-tao-do` | `hu-100ml-tao-do.jpg` | `yen-hu-100ml-red.jpg` |

The ginger and four-flavor product IDs differ from the names proposed in the brief. Map explicitly, rather than deriving filenames from IDs.

## Data And Override Safety

`db/index.ts` initializes existing databases by upserting fixture image URLs. However, `syncDbFromCloud()` can subsequently replace the entire products table using persisted cloud data. Its post-sync corrections do not refresh image URLs. Updating fixtures alone is therefore insufficient for a reliable live rollout.

For an image-only rollout, prefer an explicit product-ID mapping applied only when the persisted URL is the known legacy placeholder. Preserve staff-uploaded/custom URLs. Select a replacement only when the public file is present. Apply the resolver at the central product-reading boundary to keep catalog, detail, cart, and order views consistent. A cloud migration is a separate operation and must not overwrite product prices or copy.

## Reference Authority

- Actual bowl photos from the supplied external volume take precedence over an invented bowl shape, lid, label, or logo.
- The uploaded carry-box artwork is the hot-bowl outer packaging. It is not evidence that the separate six-jar gift set uses that box.
- Preserve the real turquoise handle, white panels, layered mountain/wave artwork, gold details, logo, and hotline when depicting that carry box.
- Jar body/cap/label and gift-set references still need review before generating replacements. Do not invent sellable packaging as if it were an actual product photograph.
- The visual brief is not certification evidence. Do not add ISO, FDA, nutritional, medical, delivery-time, or product-concentration claims through new imagery or alt text.

## Acceptance Checks

1. Every newly referenced asset exists and loads without 404.
2. Product IDs map to the correct flavor and volume; jar cards no longer show group photographs.
3. Edited real product references retain product identity and are marked as illustration where appropriate.
4. Hero products and packaging remain visible at 360, 390, 430, and 1440px widths; captions do not cover the food.
5. LCP hero uses eager/high-priority loading; below-the-fold imagery stays lazy loaded.
6. Preserve a single stable page H1 while switching hero slides. The current carousel conditionally removes H1 when slides 2/3 are active; address in its integration change.
7. No horizontal overflow, mobile right gutter, or floating-action overlap is introduced.
8. Run TypeScript, existing tests, and browser screenshots before any deployment.
