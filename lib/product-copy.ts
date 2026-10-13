import type { ProductRecord } from "../db/schema";

type ProductCopy = Pick<ProductRecord, "usageGuide" | "storageGuide" | "cautionNote" | "supportedOptions">;

export const COCONUT_PRODUCT_COPY: ProductCopy = {
  usageGuide: "Dùng trực tiếp khi thố còn ấm nóng. Khuấy nhẹ trước khi thưởng thức.",
  storageGuide: "Nếu chưa dùng ngay, đậy kín và bảo quản trong ngăn mát tủ lạnh, tối đa 36 giờ kể từ khi nhận.",
  cautionNote: "",
  supportedOptions: ["Không đường", "Bình thường", "Đường kiêng"],
};

// Normalize only obsolete seeded copy so existing D1 catalogs and new seeds agree.
export function resolveProductCopy(id: string, copy: ProductCopy): ProductCopy {
  if (id !== "prod-dua-mat-thanh-diu") return copy;
  return {
    usageGuide: copy.usageGuide === "Thưởng thức ngon nhất khi thố còn ấm nóng vừa giao. Dùng muỗng sứ đi kèm, thưởng thức từ tốn từng muỗng nhỏ."
      ? COCONUT_PRODUCT_COPY.usageGuide : copy.usageGuide,
    storageGuide: copy.storageGuide === "Bảo quản ngăn mát tủ lạnh nếu chưa dùng ngay; xem thời hạn sử dụng trên tem niêm phong thố."
      ? COCONUT_PRODUCT_COPY.storageGuide : copy.storageGuide,
    cautionNote: copy.cautionNote === "Sản phẩm sử dụng mật hoa dừa tự nhiên, hoàn toàn không hương liệu và không chất bảo quản."
      ? "" : copy.cautionNote,
    supportedOptions: copy.supportedOptions.length === 1 && copy.supportedOptions[0] === "Độ ngọt mật hoa dừa tiêu chuẩn"
      ? [...COCONUT_PRODUCT_COPY.supportedOptions] : copy.supportedOptions,
  };
}
