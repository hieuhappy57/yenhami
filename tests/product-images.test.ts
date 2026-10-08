import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PRODUCT_IMAGE_REPLACEMENTS, resolveProductImage } from "../lib/product-images";

describe("Product illustration replacements", () => {
  it("maps all 19 product images to existing optimized files", () => {
    assert.equal(Object.keys(PRODUCT_IMAGE_REPLACEMENTS).length, 19);
    for (const [id, replacement] of Object.entries(PRODUCT_IMAGE_REPLACEMENTS)) {
      assert.ok(fs.existsSync(path.join(process.cwd(), "public", replacement.imageUrl)), id);
      assert.deepEqual(resolveProductImage(id, replacement.legacy, false), {
        imageUrl: replacement.imageUrl, isIllustrationImage: true,
      });
    }
  });

  it("preserves custom staff images and unknown product images", () => {
    assert.deepEqual(resolveProductImage("cat-yen-hu-75ml-gung", "/uploads/real-ginger.jpg", false), {
      imageUrl: "/uploads/real-ginger.jpg", isIllustrationImage: false,
    });
    assert.deepEqual(resolveProductImage("custom-product", "/uploads/photo.jpg", true), {
      imageUrl: "/uploads/photo.jpg", isIllustrationImage: true,
    });
  });

  it("maps ginger and four-flavor IDs explicitly and remains idempotent", () => {
    assert.equal(PRODUCT_IMAGE_REPLACEMENTS["cat-yen-hu-75ml-gung"].imageUrl,
      "/brand/catalog/hu-75ml-vi-gung-v2.webp");
    assert.equal(PRODUCT_IMAGE_REPLACEMENTS["cat-yen-hu-75ml-tu-vi"].imageUrl,
      "/brand/catalog/hu-75ml-tam-tu-vi-v2.webp");
    const replacement = PRODUCT_IMAGE_REPLACEMENTS["prod-kim-thao"];
    assert.equal(resolveProductImage("prod-kim-thao", replacement.imageUrl, false).isIllustrationImage, true);
  });
});
