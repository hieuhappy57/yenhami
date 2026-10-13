import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { COCONUT_PRODUCT_COPY, resolveProductCopy } from "../lib/product-copy";
import { DEMO_PRODUCTS } from "../db/demo-fixtures";

const legacy = {
  usageGuide: "Thưởng thức ngon nhất khi thố còn ấm nóng vừa giao. Dùng muỗng sứ đi kèm, thưởng thức từ tốn từng muỗng nhỏ.",
  storageGuide: "Bảo quản ngăn mát tủ lạnh nếu chưa dùng ngay; xem thời hạn sử dụng trên tem niêm phong thố.",
  cautionNote: "Sản phẩm sử dụng mật hoa dừa tự nhiên, hoàn toàn không hương liệu và không chất bảo quản.",
  supportedOptions: ["Độ ngọt mật hoa dừa tiêu chuẩn"],
};

describe("Coconut product copy", () => {
  it("normalizes the existing D1 seed and remains idempotent", () => {
    const copy = resolveProductCopy("prod-dua-mat-thanh-diu", legacy);
    assert.deepEqual(copy, COCONUT_PRODUCT_COPY);
    assert.deepEqual(resolveProductCopy("prod-dua-mat-thanh-diu", copy), copy);
    assert.deepEqual(copy.supportedOptions, ["Không đường", "Bình thường", "Đường kiêng"]);
    assert.match(copy.storageGuide, /36 giờ/);
    assert.doesNotMatch(copy.usageGuide, /muỗng sứ/);
  });

  it("uses the same approved copy for new catalogs", () => {
    const product = DEMO_PRODUCTS.find(p => p.id === "prod-dua-mat-thanh-diu")!;
    for (const key of ["usageGuide", "storageGuide", "cautionNote", "supportedOptions"] as const) {
      assert.deepEqual(product[key], COCONUT_PRODUCT_COPY[key]);
    }
  });

  it("preserves staff-edited copy and other products", () => {
    const custom = {...legacy, usageGuide: "Nội dung riêng", storageGuide: "Bảo quản theo nhãn mới", cautionNote: "Lưu ý riêng", supportedOptions: ["Tùy chọn riêng"]};
    assert.deepEqual(resolveProductCopy("prod-dua-mat-thanh-diu", custom), custom);
    assert.deepEqual(resolveProductCopy("prod-kim-thao", legacy), legacy);
  });
});
