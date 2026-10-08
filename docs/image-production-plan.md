# Ha Mi Image Production Plan

Source brief: `/Users/hieunguyen/.gemini/antigravity/brain/8dd5958e-6f98-40df-b94c-8c0e821c49c4/gpt_image_2_design_brief.md`

## Production Rules

- This is a normalized production plan, not a statement that the proposed assets exist.
- Use actual product references before style references. Langfarm is an editorial direction (clean light, orderly catalog, restrained staging), not a source of packaging or brand marks.
- Hot bowls are the primary product. Preserve the photographed bowl, lid, logo, food portion and actual teal carry box supplied by the customer. The carry box is a 265 x 190 x 100 mm gable-handle carton with white faces, teal mountain/wave artwork and gold accents. It is not an insulated bag and not a six-jar gift box.
- Existing 75 ml reference jars are smooth cylindrical glass with gold caps and cream mountain/swiftlet labels. Do not invent faceted jars or remove their labels.
- Existing 100 ml reference shows a red cap and red/gold label. Do not silently replace these with a gold cap or a neck ribbon. The current reference is low resolution and needs a better original.
- Existing six-jar gift box is champagne/gold with lotus and swiftlet artwork; preserve its shape, compartments, finish and artwork. A forest-green gift box is not an approved product.
- Refined-nest references show round presentation packaging. An acrylic rectangular box is not verified.
- Never infer certification, medical suitability, purity, ingredient origin, concentration or nutrition from a photograph. Existing demo copy mentions 35 g, RO water and two-hour delivery, but fixtures are not verification. Do not add these claims to generated imagery, alt text or new copy until business confirmation. Remove diabetic, recovery, organic, ISO/FDA and "100% dense" instructions from production prompts.
- Generated variants are AI-assisted illustrative concepts, not original product photographs. Record reference and generation status per asset. Do not publish an invented label or a flavor with an unverified packaging reference as if it were an actual SKU photograph.
- No baked-in headline, CTA, certifications or watermarks. Keep actual packaging marks only, without redesigning them. Render website text in HTML.
- Use the built-in image generation tool, one call per asset. Do not silently switch to CLI/API. Inspect local references first. Preserve originals; save new versions beside them.

## Composition And Delivery

Hero and category masters: 2048 x 1152 or another true 16:9 canvas. The brief's 1536 x 1024 is 3:2; 1792 x 1024 is 7:4, not 16:9. Product masters: 1024 x 1024, 1:1. Built-in output may differ; verify dimensions before integrating rather than claiming a requested size was delivered.

Hero: main product stays legible, lower third calm for HTML copy. Category: products on the right, left 45% calm for HTML copy. Use real softly lit surfaces, not painted gradients or decorative bokeh orbs. Square products: same angle and scale within each line, product about 70% of frame, intact labels, modest ingredient props. On mobile, inspect actual crops so products remain visible; a separate hero composition may be needed.

Site color direction is forest green `#1B4332` with restrained gold `#D4AF37` / `#F3D78A`. Light product backgrounds may use `#F8F5EC` (75 ml) and `#F5EFE6` (100 ml). Do not recolor real packaging to match the website palette. Warm wood is a supporting surface, not the dominant visual theme.

Listed paths below are canonical targets from the brief. Generate versioned siblings such as `-v2.png` first; integrate only after review. Do not overwrite current photographs by default. Keep the selected generated original in the workspace and an optimized website derivative as needed. Optimize delivery without changing product identity; provide dimensions, reference source, alt text, status and generation prompt in the handoff.

## Core Manifest: 17 Assets

| Priority | Canonical path | Ratio | Normalized scene | Reference gate |
| --- | --- | --- | --- | --- |
| P0 | `public/brand/banners/hero-slide-1-tho-su-2h.jpg` | 16:9 | Real hot bowl, opened lid and modest steam, warm tray, actual teal carry carton; family-table setting, calm lower third. Filename retained from brief; it is not proof of a delivery promise. | Customer bowl photo directory and attached carry-box reference. |
| P1 | `public/brand/banners/hero-slide-2-set-qua-sen-vang.jpg` | 16:9 | Actual champagne/gold gift box opened to show six actual jars, understated card and lotus accent; calm lower third. | `catalog/set-qua-6-hu-6-vi.jpg` plus `catalog/set-qua-hop-sen-en.jpg`. |
| P1 | `public/brand/banners/hero-slide-3-yen-viet-nguyen-to.jpg` | 16:9 | Real dry nests and soaked strands on a preparation table with small ingredient dishes; calm lower third. No implied certification. | Current nest photos are small. Request original nest and preparation photography; concept only until verified. |
| P0 | `public/brand/banners/cat-banner-set-qua.jpg` | 16:9 | Actual champagne/gold gift box and actual jars grouped on right; soft neutral table on left. Keep hot-bowl carry box distinct if included. | Existing actual gift-set photos. First new version: `cat-banner-set-qua-v2.png`. |
| P1 | `public/brand/banners/cat-banner-yen-hu.jpg` | 16:9 | Actual 75 ml and 100 ml jars grouped on right, preserving each line's cap/label; calm left. | 75 ml photos available; require higher-resolution 100 ml reference. |
| P2 | `public/brand/banners/cat-banner-yen-tinh-che.jpg` | 16:9 | Actual refined nest presentation packaging on right with understated wood surface and lotus accent; calm left. | `catalog/yen-tinh-che-eco.jpg`, `catalog/yen-tinh-che-sieu-soi.jpg`, `catalog/yen-rut-long-xuat-khau.jpg`; request higher-resolution originals. |
| P1 | `public/brand/catalog/hu-75ml-duong-phen.jpg` | 1:1 | One actual 75 ml jar, cream background, small rock-sugar prop. | Actual sugar jar label visible in `yen-hu-3-chai-khay-go.jpg`. |
| P2 | `public/brand/catalog/hu-75ml-co-ngot.jpg` | 1:1 | Verified stevia jar, same scale; few stevia leaves and spoon. No medical implication. | Need actual stevia label/photo; current sugar-jar image is not proof. |
| P1 | `public/brand/catalog/hu-75ml-vi-gung.jpg` | 1:1 | Verified ginger jar, same scale; two small ginger slices. | Label visible in `set-qua-6-hu-6-vi.jpg`; prefer individual original. |
| P1 | `public/brand/catalog/hu-75ml-nhan-sam.jpg` | 1:1 | Verified ginseng jar, same scale; modest root slices. Do not specify Korean origin without confirmation. | Label visible in `set-qua-6-hu-6-vi.jpg`; prefer individual original. |
| P1 | `public/brand/catalog/hu-75ml-dong-trung.jpg` | 1:1 | Verified cordyceps jar, same scale; a few matching ingredient strands. | Label visible in `set-qua-6-hu-6-vi.jpg`; prefer individual original. |
| P2 | `public/brand/catalog/hu-75ml-tam-tu-vi.jpg` | 1:1 | Actual selected Tam Vi or Tu Vi jar; ingredient props follow its confirmed recipe. Do not merge two physical labels. | Both labels appear in gift-set reference. Select variant deliberately. |
| P2 | `public/brand/catalog/hu-100ml-duong-phen.jpg` | 1:1 | Actual red-cap 100 ml sugar jar on warm light background; small sugar prop. | `yen-hu-100ml-red.jpg` too small for reliable label reproduction; request original. |
| P2 | `public/brand/catalog/hu-100ml-hat-chia.jpg` | 1:1 | Actual 100 ml chia jar; modest chia scoop, realistic liquid/fiber proportion. | Need actual chia jar and label original. |
| P2 | `public/brand/catalog/hu-100ml-mat-hoa-dua.jpg` | 1:1 | Actual 100 ml coconut-nectar jar; small nectar vessel and flower accent. | Need actual nectar jar and label original. |
| P2 | `public/brand/catalog/hu-100ml-dong-trung.jpg` | 1:1 | Actual 100 ml cordyceps jar; few strands beside it, realistic filling. | Need actual cordyceps jar and label original. |
| P2 | `public/brand/catalog/hu-100ml-tao-do.jpg` | 1:1 | Actual 100 ml red-date jar; few dates beside it, realistic filling. | Need actual red-date jar and label original. |

## Prompt Templates

For hot-bowl hero, use case `compositing` or `product-mockup` as appropriate: "Commercial food photograph, true 16:9 composition. Image 1 is the authoritative real bowl and food; image 2 is the authoritative outer carry carton. Preserve bowl shape, lid, logo, portion, ingredients and carton design. Arrange the opened bowl and its lid on a simple warm table with the actual teal carry carton behind it, soft natural daylight, minimal steam. Keep the lower third quiet for HTML heading. No added text, medical or certification marks, insulated bag, invented gift box, enlarged nest quantity or decorative bokeh."

For category gift banner: "Commercial product photograph, true 16:9. Reference images are the authoritative Ha Mi champagne/gold gift box and smooth cylindrical gold-cap jars. Preserve their artwork, proportions, material and compartments. Arrange the actual gift set on the right 55% of a simple softly lit table, with a small lotus accent only if it does not obstruct products. Keep left 45% visually calm for HTML text. No new logos, labels, headline, CTA, green recolored box, extra jars or watermarks."

For verified individual jar: "Studio product photograph, square 1:1. The reference is the authoritative [SKU] jar. Keep its shape, cap color, label artwork, lettering and realistic filling unchanged. One jar centered at a consistent scale, about 70% frame height, on [line background]. Add only [confirmed ingredient] as a restrained prop beside the base. Soft diffused light and natural short shadow. No added text, invented label, medical implication, density exaggeration, neck ribbon or new packaging."

## Optional Eight Bowl Photos

The source brief treats these as optional, but the customer's new real-photo folder makes real bowl photography a higher priority than invented jar variants. First select and map real photos to the confirmed dish/ingredient combination. A photo with unidentified toppings must not be assigned a flavor by guesswork.

Existing targets: `public/brand/dishes/thanh-nguyen.jpg`, `dua-mat-thanh-diu.jpg`, `tu-quy-an-nhien.jpg`, `kim-thao.jpg`, `hong-lien-kim-thao.jpg`, `ngu-bao-hat-chia.jpg`, `luc-bao-trung-thao.jpg`, `tam-an-trung-thao.jpg`. Create versioned siblings rather than replace them without review. Same bowl, real contents, consistent angle and crop; background/lighting cleanup only. No artificial extra ingredients to make a source photo fit an SKU.

## Review Gates

1. Source: original reference inspected, correct SKU and physical packaging known.
2. Identity: no altered bowl/jar/box shape, cap, logo, label spelling or ingredient inventory.
3. Truth: no new certification, health claim, weight, delivery promise, density or product origin.
4. Layout: true measured dimensions; desktop/mobile crops keep products intact; no headline burned into image.
5. Delivery: file persisted in workspace, generation status explicit, alt text factual, web derivative optimized, no change to unrelated CMS overrides.

Until reference gates pass, retain existing real photography and track a concept as a concept, not a completed production SKU photo.

## First Generated Category Concept

- Output: `public/brand/banners/cat-banner-set-qua-v2.png`.
- Method: built-in `image_gen`, reference-based compositing; no CLI/API fallback.
- Original retained at `/Users/hieunguyen/.codex/generated_images/01a11936-e51d-7793-8200-cf2bd1ae5c04/exec-ffd1089b-4dd8-4116-b966-b0ca37ed850f.png`.
- Measured size: 1672 x 941 pixels (approximately 16:9); requested size 2048 x 1152 was not delivered.
- References: `public/brand/catalog/set-qua-hop-sen-en.jpg` and `public/brand/catalog/set-qua-6-hu-6-vi.jpg`.
- Review: correct champagne/gold box family, open six-jar arrangement, smooth gold-cap jars; no promotional text added. AI has altered small printed label lettering and included closed-box artwork reaching into the central region. This is an illustrative banner concept, not a pixel-faithful product photograph; do not use it as an SKU image. Left unobstructed space is closer to one third than the requested 45%; keep website copy inside the actual clear area, or revise before publication.
- Alt text suggestion, if approved as a decorative category illustration: "Illustration of a Ha Mi six-jar gift set in champagne-gold packaging."
- Exact generation prompt:

```text
Use case: compositing. Asset type: Ha Mi website gift-set category banner, new version. Create a photorealistic commercial product photograph with a true wide 16:9 landscape composition. Input image 1 is the authoritative actual Ha Mi champagne/gold gift box with lotus and swiftlet artwork and its real smooth cylindrical gold-cap labeled jars. Input image 2 is the authoritative opened gift box with six jars in its existing two-row three-column compartments. Preserve the physical packaging, gold/cream color, actual existing label artwork, logo and printing, jar shape/caps and realistic contents. Do not redesign, recolor or invent lettering. Arrange this actual gift set on the RIGHT 55% of a simple softly lit warm wood table, open box visible with all six real jars, front angle consistent with reference. Left 45% is empty visually calm real table and soft neutral room wall for website HTML title and CTA; no object in left overlay area. Clean modern product photography, soft natural daylight, restrained forest-green environment accent only, accurate actual product inspection, sharp packaging, natural short shadows. No extra headline, promotional text, watermarks, medical claims or certifications. No green gift box, teal carry carton, insulated bag, faceted glass jar, added bow/ribbon, extra jars, invented props, bokeh orbs or graphic gradients. Keep actual printed package labels only; no floating text. Desired image dimensions 2048x1152 true16:9, not3:2.
```
