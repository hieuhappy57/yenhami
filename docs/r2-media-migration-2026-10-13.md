# R2 media migration - 2026-10-13

## Production release

- Website: https://yenhami.com
- Deployment: `dpl_6WQ6HbiDyUN3f8JHAk47Xvc1xMZH`
- Vercel project: `yenhami`
- Private R2 bucket: `yenhami-storage`
- 212 unique image objects, 219,146,657 bytes, uploaded and read back with matching SHA-256 checksums; zero transfer failures.
- 97,772,456 bytes of tracked public images excluded from the new deployment. The isolated release stage contains zero public raster image files. Remaining migrated files were local untracked originals.
- These figures describe deployment assets, not runtime RAM, billed usage, or total historical Vercel account storage.

## Behavior and safety

- Existing `/brand`, image-only `/bai-viet`, and compatible `/assets` image URLs resolve through the protected media proxy to manifest-approved R2 objects. Article routes remain unchanged.
- Original image files remain on the local machine. No order, customer, payment, or revenue records were modified by this migration.
- Database and backup objects remain private; `/api/media/db/ha-mi-db-state.json` returns 404.
- Admin image uploads require a permitted raster type, matching file signature, a size of at most 3 MiB, acknowledged R2 storage, and readback checksum verification. Failures return errors instead of storing base64 as a successful fallback.
- Product editing now waits for the canonical backend save rather than updating local UI state only. Upload controls cover product images, article covers, hero images, and gifting images.
- The migration endpoint requires a deployment-specific temporary token and expiry. The final deployment has neither; POST returns 404.
- Removed only temporary deployments created for this migration: `dpl_389C3ktzqKZ7fFK9jHmYGAzeLWMi` and `dpl_6wcWBvysWYFdArtr2XbW8aUSKENP`. Prior stable release `dpl_5M1LKMfr19ZuCheQibSPJjX6voKM` retained for rollback.

## Verification

- 96 automated tests passed; TypeScript checks and final remote production build passed.
- Nine representative image URLs verified on the release candidate: HTTP 200, R2 response header, matching full-file SHA-256.
- Four representative image URLs verified again on `yenhami.com`, covering logo, mobile hero, product, and article image: HTTP 200, R2 response header, matching SHA-256.
- Production catalog returns HTTP 200. Private database media path and disabled migration endpoint return HTTP 404.
- Chrome desktop (1920px) and mobile (390px) screenshots inspected; visible logo, hero, category, and product images loaded. No horizontal page overflow observed. Temporary viewport override reset.
- Live authenticated admin upload was not manually exercised in this rollout; upload failure and canonical-save behavior have automated coverage.

Local evidence (not committed because reports contain machine-specific paths):

- `output/r2-media-transfer-report.json`
- `output/r2-media-serving-report.json`
- `output/r2-production-smoke.json`
- `output/r2-production-desktop.png`
- `output/r2-production-mobile.png`

## Repeatable deployment

Generate the manifest before migrating new repository images. Upload and verify every manifest object before excluding local deployment assets. `scripts/deploy-media-release.mjs` requires a matching successful transfer report and builds an isolated code-only stage. Normal local development continues to use local originals unless `HAMI_STATIC_MEDIA_R2=1` is explicitly enabled.
