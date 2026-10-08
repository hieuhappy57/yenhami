interface ProductImageReplacement {
  legacy: string;
  imageUrl: string;
}

const bowlNames = [
  "thanh-nguyen", "dua-mat-thanh-diu", "tu-quy-an-nhien", "kim-thao",
  "hong-lien-kim-thao", "ngu-bao-hat-chia", "luc-bao-trung-thao", "tam-an-trung-thao",
];

const jarNames = [
  ["75ml-duong-phen", "75ml-duong-phen", "yen-hu-75ml-100ml-cam-tay"],
  ["75ml-co-ngot", "75ml-co-ngot", "yen-hu-3-chai-khay-go"],
  ["75ml-gung", "75ml-vi-gung", "yen-hu-3-chai-khay-go"],
  ["75ml-nhan-sam", "75ml-nhan-sam", "set-qua-6-hu-6-vi"],
  ["75ml-dong-trung", "75ml-dong-trung", "set-qua-6-hu-6-vi"],
  ["75ml-tu-vi", "75ml-tam-tu-vi", "set-qua-6-hu-6-vi"],
  ["100ml-duong-phen", "100ml-duong-phen", "yen-hu-100ml-red"],
  ["100ml-hat-chia", "100ml-hat-chia", "yen-hu-100ml-red"],
  ["100ml-mat-hoa-dua", "100ml-mat-hoa-dua", "yen-hu-100ml-red"],
  ["100ml-dong-trung", "100ml-dong-trung", "yen-hu-100ml-red"],
  ["100ml-tao-do", "100ml-tao-do", "yen-hu-100ml-red"],
];

export const PRODUCT_IMAGE_REPLACEMENTS: Record<string, ProductImageReplacement> = {
  ...Object.fromEntries(bowlNames.map((name) => [
    `prod-${name}`,
    { legacy: `/brand/dishes/${name}.jpg`, imageUrl: `/brand/dishes/${name}-v2.webp` },
  ])),
  ...Object.fromEntries(jarNames.map(([id, file, legacy]) => [
    `cat-yen-hu-${id}`,
    { legacy: `/brand/catalog/${legacy}.jpg`, imageUrl: `/brand/catalog/hu-${file}-v2.webp` },
  ])),
};

// Resolve at read time so cloud sync cannot restore shared placeholder photos.
export function resolveProductImage(id: string, imageUrl: string, isIllustrationImage: boolean) {
  const replacement = PRODUCT_IMAGE_REPLACEMENTS[id];
  if (!replacement || (imageUrl !== replacement.legacy && imageUrl !== replacement.imageUrl)) {
    return { imageUrl, isIllustrationImage };
  }
  return { imageUrl: replacement.imageUrl, isIllustrationImage: true };
}
