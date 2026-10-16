export const PRODUCT_LINES = {
  "fresh-bowl": "Yến tươi chưng nóng",
  "gift-set": "Set quà tặng",
  jar: "Yến hũ chưng sẵn",
  "refined-nest": "Yến tinh chế",
} as const;
export type ProductLine = keyof typeof PRODUCT_LINES;

export function getProductLine(product:{id:string;productLine?:string}):ProductLine {
  if (product.productLine && Object.hasOwn(PRODUCT_LINES,product.productLine)) return product.productLine as ProductLine;
  if (product.id.startsWith("cat-set-qua-")) return "gift-set";
  if (product.id.startsWith("cat-yen-hu-")) return "jar";
  if (product.id.startsWith("cat-yen-tinh-che-") || product.id.startsWith("cat-yen-rut-long-")) return "refined-nest";
  return "fresh-bowl";
}
