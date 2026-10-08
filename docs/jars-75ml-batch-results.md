# Ha Mi 75ml Jar Illustration Batch

Date: 2026-10-08. Method: built-in `image_gen`, six separate generation calls and one targeted stevia correction; no CLI/API fallback. All six final assets exist in the website workspace.

## Classification And References

All outputs are AI-assisted product illustrations, NOT actual SKU photographs or pixel-faithful reproductions of labels. The actual product photo originals were inspected and preserved:

- `public/brand/catalog/yen-hu-3-chai-khay-go.jpg`: gold cap, smooth cylindrical jar, cream Ha Mi mountain/swiftlet label; confirmed rock-sugar label.
- `public/brand/catalog/set-qua-6-hu-6-vi.jpg`: actual packaging family; visible ginger, ginseng, cordyceps and four-flavor label references.
- Stevia label is not verified. Its final illustration intentionally has no flavor wording, while retaining generic Ha Mi branding. This avoids using the wrong rock-sugar label.

Output location: `/Users/hieunguyen/Documents/HÀ MI/ha-mi-website/public/brand/catalog/`. PNG masters are all measured **1254 x 1254** (the requested 1024 square was not the built-in output size). Delivery WebP versions are all **1024 x 1024**, quality 82, sharp effort 6. No crop or product alteration during conversion.

| File stem | WebP bytes | Suggested factual alt text |
| --- | ---: | --- |
| `hu-75ml-duong-phen-v2` | 74688 | Illustration of a Ha Mi gold-cap jar with rock sugar beside it. |
| `hu-75ml-co-ngot-v2` | 81084 | Illustration of a Ha Mi gold-cap jar with stevia leaves beside it. |
| `hu-75ml-vi-gung-v2` | 84938 | Illustration of a Ha Mi gold-cap jar with ginger beside it. |
| `hu-75ml-nhan-sam-v2` | 86744 | Illustration of a Ha Mi gold-cap jar with ginseng beside it. |
| `hu-75ml-dong-trung-v2` | 87450 | Illustration of a Ha Mi gold-cap jar with cordyceps beside it. |
| `hu-75ml-tam-tu-vi-v2` | 90832 | Illustration of a Ha Mi gold-cap jar with dates, lotus seeds, longan and goji beside it. |

Each stem has both `.png` and `.webp`. `tam-tu-vi` is the requested filename, but the visible label follows the verified reference wording `TỨ VỊ`; no new `TÂM TỨ VỊ` label was invented.

## Visual QC

- Single intact jar per image; consistent front camera with slightly visible cap top, warm cream surface, natural shadows, and pale wooden ingredient dish.
- Correct gold cap and cream label family; no faceted jar, neck ribbon, added certification, floating headline, health claim or watermark.
- Rock sugar, ginger, ginseng, cordyceps and four-flavor words are legible and correspond to reference flavor naming. Stevia intentionally has a blank flavor band after correction.
- Labels, brand marks and precise food quantities have AI variation. Do not present these as documentary product photography or use imagery as proof of volume, concentration or manufacturing claims.
- Rock-sugar illustration includes loose translucent nest strands behind the ingredient dish; they are a styling cue rather than a demonstrated serving quantity. Other final versions do not show loose nest strands outside the jar.
- Jar heights vary modestly (approximately 70-80% frame) but all subjects fit intact within the square crop. Ingredient dishes approach the right edge; no jar cap or glass base is clipped.
- All files are well under the 200KB WebP delivery budget.

## Source Output Paths

Built-in originals are retained under `/Users/hieunguyen/.codex/generated_images/01a11937-083a-7a12-95bb-c9a8f5662816/`:

- duong-phen: `exec-21232c5b-d7bf-4911-bc0e-73a8b9365b10.png`
- co-ngot: `exec-5d152b39-5b9d-4224-b8e5-0026592a99a1.png`
- vi-gung: `exec-1b84babf-8eef-42d9-b030-42a1fa56e1ff.png`
- nhan-sam: `exec-c4342e6b-ef9a-4902-9d1d-6961858211b5.png`
- dong-trung: `exec-c18f4540-56a4-4aba-9ce1-bd307d7a5a59.png`
- tam-tu-vi: `exec-abbe5d49-4f71-46eb-a840-e0ed11c2d2a6.png`

## Exact Prompt Set

### duong-phen

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Rock sugar flavor: realistic translucent edible nest strands in clear pale broth, modest few translucent rock sugar crystals on a tiny pale wood dish beside the lower right of jar, keep jar main focus.
```

### co-ngot

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Stevia flavor illustration: realistic translucent edible nest strands in clear pale broth, small fresh stevia leaf sprig beside the lower right of jar. Flavor label is NOT verified so do not create or change flavor text; retain reference cream mountain/swiftlet label artwork. Same straight front camera, scale, shadow and small pale wood ingredient dish as previous studio jar.
```

### vi-gung

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Ginger flavor illustration. Use the confirmed GỪNG jar in input2 top middle as authoritative flavor label; preserve that original label, do not use sugar flavor print. Realistic translucent edible nest strands in clear pale broth. Only three thin fresh ginger slices and a small ginger root in a tiny pale wood dish lower right; NO external nest strands, sugar crystals, herb leaves or other props. Input1 packaging family, input2 actualginger SKU. Singlejar70%height, samecleanfrontangle.
```

### nhan-sam

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Ginseng flavor illustration. Use the confirmed NHÂN SÂM jar in input2 top right as authoritative flavor label; preserve original label, do not use sugarflavor print. Realistic translucent edible nest strands in clear pale broth and two subtle ginseng slices. Only small natural ginseng root with two slices in tiny pale wooddish lower right; NO externalnest strands, sugarcrystals, otherprops. Same singlejar70%height cleanfrontangle.
```

### dong-trung

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Cordyceps flavor illustration. Use confirmed ĐÔNG TRÙNG HẠ THẢO jar input2 bottomleft as authoritative originalflavorlabel. Realistic translucent edible nest strands in palebroth with modest orange cordyceps filaments. Only a few orange dried cordyceps filaments in tiny pale wooddish lower right; NOexternalneststrands, sugarcrystals, otherprops. Same singlejar70%height cleanfrontangle.
```

### tam-tu-vi

```text
Use case: product-mockup. Asset type: Ha Mi website illustrative 75ml jar catalog image. Square 1:1 composition, desired 1024x1024. Input image1 authoritative smooth cylindrical 75ml glass jar with gold metal screw cap, cream wrap label with gold Ha Mi circular logo, swiftlets and mountain artwork. Input image2 authoritative jar packaging family. Create ONE jar centered, 70 percent of frame height, straight front view with camera very slightly above so gold cap top visible. Soft diffused daylight from upper left, pale warm cream solid studio background #F8F5EC, clean neutral table natural short shadow. Preserve actual jar dimensions, cap color and original cream label artwork. No faceted jar, ribbon, green box, exaggerated density, invented certifications, organic or health claims, watermark, floating text or headline. This is an AI-assisted illustration not documentary photo. Do not invent or relabel unverified flavor wording. Keep print from reference unchanged, render clearly where legible. Flavor cue: Four-flavor illustration, red jujube, longan, lotus seed and goji. Use confirmed TỨ VỊ jar input2 bottomright as authoritative originalflavorlabel; preserve TỨ VỊ original wording, do not invent TÂM TỨ VỊ. Realistic translucent edible nest strands clear palegold broth with modestsmallconfirmed fourtoppings. Only two red dates, two lotus seeds, one dried longan and a few goji in tiny pale wooddish lower right; NOexternalneststrands, sugarcrystals, otherprops. Same singlejar70%height cleanfrontangle.
```

### Stevia Targeted Correction

```text
Use case: precise-object-edit. Asset type: Ha Mi75ml stevia jar illustration correction. Edit input image1 only. Preserve exact same jar shape, gold cap, composition, scale, cream background, natural shadows and brand mountain/swiftlet artwork. Keep HA MI logo and YẾN SÀO THƯỢNG HẠNG words unchanged. REMOVE the bottom flavor text ĐƯỜNG PHÈN and leave this small flavor band plain cream without new letters. Remove rock sugar crystals from the wooddish and all loose nest strands outside jar. Leave only a small fresh stevia leafsprig resting in that wooddish beside jar. No healthclaim, no added label, no other changes.
```

The first stevia draft retained the sugar label and props; that rejected draft is not the saved final workspace asset. Its built-in source remains available for provenance as `exec-a42d0fc1-2ecd-49d7-b23d-cf5f9f77e3ad.png`.

## Integration Handoff

No website component or database change was made in this batch. Root owns integration. Mark each replacement as `isIllustrationImage: true`, preserve staff-customized images, map ginger/four-flavor product IDs explicitly, and verify catalog plus detail views against cloud-sync behavior before publishing.

