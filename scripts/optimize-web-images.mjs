import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

async function optimizeImage(filePath, { width, height, fit = "cover", format, quality = 80 }) {
  const fullPath = path.join(process.cwd(), filePath);
  try {
    const statBefore = await fs.stat(fullPath);
    const beforeSize = statBefore.size;

    let transformer = sharp(fullPath);
    if (width || height) {
      transformer = transformer.resize(width, height, { fit, withoutEnlargement: true });
    }

    if (format === "jpeg") {
      transformer = transformer.jpeg({ quality, mozjpeg: true });
    } else if (format === "png") {
      transformer = transformer.png({ compressionLevel: 9, adaptiveFiltering: true });
    } else if (format === "webp") {
      transformer = transformer.webp({ quality, effort: 6 });
    }

    const tempPath = fullPath + ".tmp";
    await transformer.toFile(tempPath);
    const statAfter = await fs.stat(tempPath);
    const afterSize = statAfter.size;

    if (afterSize < beforeSize) {
      await fs.rename(tempPath, fullPath);
      console.log(`✅ ${filePath}: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (-${(((beforeSize - afterSize) / beforeSize) * 100).toFixed(0)}%)`);
      return { before: beforeSize, after: afterSize };
    } else {
      await fs.unlink(tempPath);
      console.log(`ℹ️ ${filePath}: kept original (${(beforeSize / 1024).toFixed(1)} KB)`);
      return { before: beforeSize, after: beforeSize };
    }
  } catch (err) {
    console.error(`❌ Error optimizing ${filePath}:`, err.message);
    return { before: 0, after: 0 };
  }
}

async function run() {
  console.log("🚀 Starting ultra web image optimization...");
  let totalBefore = 0;
  let totalAfter = 0;

  const tasks = [
    // Brand Logo WebP & PNG
    { file: "public/brand/ha-mi-logo-web.webp", opts: { width: 140, height: 140, fit: "contain", format: "webp", quality: 85 } },
    { file: "public/brand/ha-mi-logo-web-640.png", opts: { width: 140, height: 140, fit: "contain", format: "png" } },
    
    // Catalog Boxes WebP
    { file: "public/brand/catalog/set-qua-hop-sen-en-v2.webp", opts: { width: 420, height: 420, format: "webp", quality: 80 } },
    { file: "public/brand/catalog/set-qua-6-hu-6-vi-v2.webp", opts: { width: 420, height: 420, format: "webp", quality: 80 } },
    { file: "public/brand/catalog/yen-tinh-che-to-yen-v2.webp", opts: { width: 420, height: 420, format: "webp", quality: 80 } },

    // Catalog JPEGs (backwards compatibility)
    { file: "public/brand/catalog/set-qua-hop-sen-en.jpg", opts: { width: 420, height: 420, format: "jpeg", quality: 78 } },
    { file: "public/brand/catalog/set-qua-6-hu-6-vi.jpg", opts: { width: 420, height: 420, format: "jpeg", quality: 78 } },
    { file: "public/brand/catalog/yen-tinh-che-to-yen.jpg", opts: { width: 420, height: 420, format: "jpeg", quality: 78 } },
    { file: "public/brand/catalog/yen-hu-3-chai-khay-go.jpg", opts: { width: 420, height: 420, format: "jpeg", quality: 78 } },
    { file: "public/brand/catalog/yen-hu-75ml-100ml-cam-tay.jpg", opts: { width: 420, height: 420, format: "jpeg", quality: 78 } },

    // Desktop Hero Banners
    { file: "public/brand/banners/hero-slide-1-tho-su-v2.webp", opts: { width: 1440, height: 810, format: "webp", quality: 80 } },
    { file: "public/brand/banners/hero-slide-2-set-qua-sen-vang-v3.webp", opts: { width: 1440, height: 810, format: "webp", quality: 80 } },
    { file: "public/brand/banners/hero-slide-3-yen-viet-nguyen-to-v2.webp", opts: { width: 1440, height: 810, format: "webp", quality: 80 } },

    // Mobile Hero Banners
    { file: "public/brand/banners/hero-slide-1-tho-su-mobile-v3.webp", opts: { width: 750, height: 750, format: "webp", quality: 80 } },
    { file: "public/brand/banners/hero-slide-2-set-qua-sen-vang-mobile-v2.webp", opts: { width: 750, height: 750, format: "webp", quality: 80 } },
    { file: "public/brand/banners/hero-slide-3-yen-viet-nguyen-to-mobile-v2.webp", opts: { width: 750, height: 750, format: "webp", quality: 80 } },

    // Section Category Banners
    { file: "public/brand/banners/cat-banner-yen-hu-v2.webp", opts: { width: 960, height: 540, format: "webp", quality: 78 } },
    { file: "public/brand/banners/cat-banner-set-qua-v3.webp", opts: { width: 960, height: 540, format: "webp", quality: 78 } },
    { file: "public/brand/banners/cat-banner-yen-tinh-che-v2.webp", opts: { width: 960, height: 540, format: "webp", quality: 78 } },
  ];

  // 8 Fresh Bowls (420x420)
  const dishes = [
    "thanh-nguyen-v2.webp", "dua-mat-thanh-diu-v2.webp", "tu-quy-an-nhien-v2.webp", "kim-thao-v2.webp",
    "hong-lien-kim-thao-v2.webp", "ngu-bao-hat-chia-v2.webp", "luc-bao-trung-thao-v2.webp", "tam-an-trung-thao-v2.webp"
  ];
  for (const d of dishes) {
    tasks.push({
      file: `public/brand/dishes/${d}`,
      opts: { width: 420, height: 420, format: "webp", quality: 80 }
    });
  }

  // 11 Catalog Jars (420x420)
  const jars = [
    "hu-75ml-duong-phen-v2.webp", "hu-75ml-co-ngot-v2.webp", "hu-75ml-vi-gung-v2.webp",
    "hu-75ml-nhan-sam-v2.webp", "hu-75ml-dong-trung-v2.webp", "hu-75ml-tam-tu-vi-v2.webp",
    "hu-100ml-duong-phen-v2.webp", "hu-100ml-hat-chia-v2.webp", "hu-100ml-mat-hoa-dua-v2.webp",
    "hu-100ml-dong-trung-v2.webp", "hu-100ml-tao-do-v2.webp"
  ];
  for (const j of jars) {
    tasks.push({
      file: `public/brand/catalog/${j}`,
      opts: { width: 420, height: 420, format: "webp", quality: 80 }
    });
  }

  for (const task of tasks) {
    const res = await optimizeImage(task.file, task.opts);
    totalBefore += res.before;
    totalAfter += res.after;
  }

  console.log(`\n🎉 Ultra Optimization finished!`);
  console.log(`Total original: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total optimized: ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total saved: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(2)} MB (-${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);
}

run();
