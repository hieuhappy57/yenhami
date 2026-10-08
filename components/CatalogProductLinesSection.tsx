"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ProductRecord } from "@/db/schema";
import { useCart } from "./CartProvider";

export function CatalogProductLinesSection({
  products,
}: {
  products: ProductRecord[];
}) {
  const { addItem } = useCart();
  const [jarVolumeTab, setJarVolumeTab] = useState<"75ml" | "100ml" | "all">("75ml");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const giftSetProducts = useMemo(
    () => products.filter((p) => p.id.startsWith("cat-set-qua-")),
    [products]
  );

  const allJars = useMemo(
    () => products.filter((p) => p.id.startsWith("cat-yen-hu-")),
    [products]
  );

  const refinedNestProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.id.startsWith("cat-yen-tinh-che-") ||
          p.id.startsWith("cat-yen-rut-long-")
      ),
    [products]
  );

  const handleQuickAdd = (product: ProductRecord) => {
    if (product.status !== "AVAILABLE" || product.priceVnd === null) return;
    const chosenVariant = product.variants[0];
    if (!chosenVariant) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      variantId: chosenVariant.id,
      variantName: chosenVariant.name,
      unitPriceVnd: product.priceVnd + chosenVariant.priceDeltaVnd,
      volumeMl: product.volumeMl,
      selectedOption: product.supportedOptions[0] || "Tiêu chuẩn",
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* =====================================================================
          1. BANNER + DANH MỤC: SET QUÀ TẶNG YẾN SÀO THƯỢNG HẠNG
         ===================================================================== */}
      <section
        id="danh-muc-set-qua"
        aria-labelledby="set-qua-heading"
        data-testid="section-set-qua"
        className="scroll-mt-24"
      >
        {/* Langfarm-style Full-Bleed Category Banner */}
        <div className="relative w-full max-w-[1440px] mx-auto h-[220px] sm:h-[300px] md:h-[370px] overflow-hidden bg-[#155132]">
          <img
            src="/brand/banners/cat-banner-set-qua-v3.webp"
            alt="Ảnh minh họa bộ quà yến Hà Mi trong hộp vàng kem"
            loading="lazy"
            className="absolute right-0 top-0 h-full w-auto max-w-none [mask-image:linear-gradient(to_right,transparent,black_18%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-4 lg:px-8 pb-6 sm:pb-10 flex items-end justify-between gap-4">
            <h2 className="font-serif-display text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
              Set Quà Biếu Sức Khỏe
            </h2>
            <Link
              href="/gui-qua"
              className="shrink-0 inline-flex items-center justify-center min-h-[38px] sm:min-h-[44px] px-5 sm:px-7 py-2 rounded-full bg-gradient-to-r from-[#E6C56F] via-[#F9E498] to-[#C89B3C] text-[#4A3208] font-serif-display font-bold text-xs sm:text-base shadow-md border border-[#FFF5D6] hover:brightness-105 transition-all"
            >
              Khám phá Set Quà Biếu
            </Link>
          </div>
        </div>

        {/* Product Row for Gift Sets */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 md:pt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p
              id="set-qua-heading"
              className="font-serif-display text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#1d2327]"
            >
              Set Quà Yến Sào Thượng Hạng
            </p>
            <Link
              href="/gui-qua"
              className="text-xs sm:text-sm font-semibold text-[#155132] hover:underline"
            >
              Ghi thiệp tay & Ẩn giá →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {giftSetProducts.map((product, index) => {
              const isJustAdded = justAddedId === product.id;
              const fallbackImg =
                index === 0
                  ? "/brand/catalog/set-qua-hop-sen-en.jpg"
                  : "/brand/catalog/set-qua-6-hu-6-vi.jpg";
              return (
                <article
                  key={product.id}
                  data-testid={`product-card-${product.slug}`}
                  className="group flex flex-col gap-3 bg-white rounded-3xl"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      aria-label={`Xem chi tiết ${product.name}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={product.imageUrl || fallbackImg}
                        alt={`${product.name} — ${product.categoryLabel} | Yến Sào Hà Mi Đà Nẵng`}
                        loading="lazy"
                        decoding="async"
                        width={410}
                        height={410}
                        className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      aria-label={`Chọn ${product.name}`}
                      onClick={() => handleQuickAdd(product)}
                      className={`absolute bottom-2.5 right-2.5 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md transition-all cursor-pointer ${
                        isJustAdded
                          ? "bg-[#155132] text-[#F9E498] scale-105"
                          : "bg-white/95 text-[#155132] hover:bg-[#155132] hover:text-white"
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 px-0.5">
                    <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                      <Link href={`/san-pham/${product.slug}`}>
                        {product.name} (Hộp 6 hũ × {product.volumeMl}ml)
                      </Link>
                    </h3>
                    <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                      {(product.priceVnd || 0).toLocaleString("en-US")}đ
                    </p>
                  </div>
                </article>
              );
            })}

            {/* 2 Showcase Gift Box Cards to complete the 4-column desktop row cleanly */}
            <Link
              href="/gui-qua"
              className="group flex flex-col gap-3 bg-white rounded-3xl"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                <img
                  src="/brand/catalog/set-qua-hop-sen-en.jpg"
                  alt="Hộp quà Hoa Sen & Đàn Én ép kim"
                  loading="lazy"
                  className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1 px-0.5">
                <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                  Set Quà Thố Sứ Chưng Nóng Giao Hẹn Giờ Kèm Thiệp Tay
                </h3>
                <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                  295,000đ
                </p>
              </div>
            </Link>

            <Link
              href="/gui-qua"
              className="group flex flex-col gap-3 bg-white rounded-3xl"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                <img
                  src="/brand/catalog/set-qua-6-hu-6-vi.jpg"
                  alt="Trọn bộ 6 hũ 6 hương vị thảo mộc"
                  loading="lazy"
                  className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1 px-0.5">
                <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                  Combo 2 Thố Yến Tươi Chưng Nóng 200ml (Miễn Phí Giao 2H)
                </h3>
                <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                  590,000đ
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. BANNER + DANH MỤC: YẾN HŨ CHƯNG SẴN THƯỢNG HẠNG (75ML & 100ML)
         ===================================================================== */}
      <section
        id="danh-muc-yen-hu"
        aria-labelledby="yen-hu-heading"
        data-testid="section-yen-hu"
        className="scroll-mt-24"
      >
        {/* Langfarm-style Full-Bleed Category Banner */}
        <div className="relative w-full max-w-[1440px] mx-auto h-[220px] sm:h-[300px] md:h-[370px] overflow-hidden bg-[#155132]">
          <img
            src="/brand/banners/cat-banner-yen-hu-v2.webp"
            alt="Ảnh minh họa dòng yến hũ Hà Mi nắp vàng và nắp đỏ"
            loading="lazy"
            className="absolute right-0 top-0 h-full w-auto max-w-none [mask-image:linear-gradient(to_right,transparent,black_18%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-4 lg:px-8 pb-6 sm:pb-10 flex items-end justify-between gap-4">
            <h2 className="font-serif-display text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
              Yến Hũ Chưng Sẵn Đặc Sản
            </h2>
            <a
              href="#yen-hu-heading"
              className="shrink-0 inline-flex items-center justify-center min-h-[38px] sm:min-h-[44px] px-5 sm:px-7 py-2 rounded-full bg-gradient-to-r from-[#E6C56F] via-[#F9E498] to-[#C89B3C] text-[#4A3208] font-serif-display font-bold text-xs sm:text-base shadow-md border border-[#FFF5D6] hover:brightness-105 transition-all"
            >
              Xem dòng Yến Hũ
            </a>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 md:pt-12">
          <div className="mb-6 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <p
              id="yen-hu-heading"
              className="font-serif-display text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#1d2327]"
            >
              Yến Hũ Chưng Sẵn (75ml & 100ml)
            </p>

            {/* Volume Switcher Tabs */}
            <div
              role="tablist"
              aria-label="Chọn thể tích Yến Hũ"
              className="flex flex-nowrap overflow-x-auto gap-2 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                role="tab"
                aria-selected={jarVolumeTab === "75ml"}
                onClick={() => setJarVolumeTab("75ml")}
                className={`shrink-0 min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  jarVolumeTab === "75ml"
                    ? "bg-[#155132] text-white"
                    : "bg-[#F6F4EE] text-[#1d2327] hover:bg-[#EBE6D8]"
                }`}
              >
                Hũ 75ml (40k–45k)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={jarVolumeTab === "100ml"}
                onClick={() => setJarVolumeTab("100ml")}
                className={`shrink-0 min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  jarVolumeTab === "100ml"
                    ? "bg-[#155132] text-white"
                    : "bg-[#F6F4EE] text-[#1d2327] hover:bg-[#EBE6D8]"
                }`}
              >
                Hũ 100ml (100k–110k)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={jarVolumeTab === "all"}
                onClick={() => setJarVolumeTab("all")}
                className={`shrink-0 min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  jarVolumeTab === "all"
                    ? "bg-[#155132] text-white"
                    : "bg-[#F6F4EE] text-[#1d2327] hover:bg-[#EBE6D8]"
                }`}
              >
                Tất cả (11)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {allJars.map((product) => {
              const isJustAdded = justAddedId === product.id;
              const isVisible =
                jarVolumeTab === "all" ||
                (jarVolumeTab === "75ml" && product.volumeMl === 75) ||
                (jarVolumeTab === "100ml" && product.volumeMl === 100);
              return (
                <article
                  key={product.id}
                  data-testid={`product-card-${product.slug}`}
                  className={
                    isVisible
                      ? "group flex flex-col gap-3 bg-white rounded-3xl"
                      : "hidden"
                  }
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      aria-label={`Xem chi tiết ${product.name}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={product.imageUrl}
                        alt={`${product.name} — ${product.categoryLabel} | Yến Sào Hà Mi Đà Nẵng`}
                        loading="lazy"
                        decoding="async"
                        width={410}
                        height={410}
                        className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {product.isIllustrationImage && (
                        <span className="absolute top-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[#2B433A]">
                          Ảnh minh họa
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      aria-label={`Chọn món ${product.name}`}
                      onClick={() => handleQuickAdd(product)}
                      className={`absolute bottom-2.5 right-2.5 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md transition-all cursor-pointer ${
                        isJustAdded
                          ? "bg-[#155132] text-[#F9E498] scale-105"
                          : "bg-white/95 text-[#155132] hover:bg-[#155132] hover:text-white"
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 px-0.5">
                    <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                      <Link href={`/san-pham/${product.slug}`}>
                        {product.name}, đặc sản Hà Mi
                      </Link>
                    </h3>
                    <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                      {(product.priceVnd || 0).toLocaleString("en-US")}đ
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. BANNER + DANH MỤC: YẾN SÀO TINH CHẾ NGUYÊN TỔ 100G
         ===================================================================== */}
      <section
        id="danh-muc-yen-tinh-che"
        aria-labelledby="yen-tinh-che-heading"
        data-testid="section-yen-tinh-che"
        className="scroll-mt-24"
      >
        {/* Langfarm-style Full-Bleed Category Banner */}
        <div className="relative w-full max-w-[1440px] mx-auto h-[220px] sm:h-[300px] md:h-[370px] overflow-hidden bg-[#155132]">
          <img
            src="/brand/banners/cat-banner-yen-tinh-che-v2.webp"
            alt="Ảnh minh họa tổ yến và hộp yến tinh chế Hà Mi"
            loading="lazy"
            className="absolute right-0 top-0 h-full w-auto max-w-none [mask-image:linear-gradient(to_right,transparent,black_18%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 max-w-[1440px] mx-auto px-4 lg:px-8 pb-6 sm:pb-10 flex items-end justify-between gap-4">
            <h2 className="font-serif-display text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
              Yến Sào Tinh Chế Quý Hiếm
            </h2>
            <a
              href="#yen-tinh-che-heading"
              className="shrink-0 inline-flex items-center justify-center min-h-[38px] sm:min-h-[44px] px-5 sm:px-7 py-2 rounded-full bg-gradient-to-r from-[#E6C56F] via-[#F9E498] to-[#C89B3C] text-[#4A3208] font-serif-display font-bold text-xs sm:text-base shadow-md border border-[#FFF5D6] hover:brightness-105 transition-all"
            >
              Xem dòng Yến Tinh Chế
            </a>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 md:pt-12">
          <div className="mb-6 lg:mb-10 flex items-center justify-between gap-4">
            <p
              id="yen-tinh-che-heading"
              className="font-serif-display text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#1d2327]"
            >
              Yến Sào Tinh Chế Cao Cấp (Hộp 100g)
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {refinedNestProducts.map((product) => {
              const isJustAdded = justAddedId === product.id;
              return (
                <article
                  key={product.id}
                  data-testid={`product-card-${product.slug}`}
                  className="group flex flex-col gap-3 bg-white rounded-3xl"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC] p-4 flex items-center justify-center">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      aria-label={`Xem chi tiết ${product.name}`}
                      className="block w-full h-full"
                    >
                      <img
                        src={product.imageUrl}
                        alt={`${product.name} — ${product.categoryLabel} | Yến Sào Hà Mi Đà Nẵng`}
                        loading="lazy"
                        decoding="async"
                        width={410}
                        height={410}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      aria-label={`Chọn ${product.name}`}
                      onClick={() => handleQuickAdd(product)}
                      className={`absolute bottom-2.5 right-2.5 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md transition-all cursor-pointer ${
                        isJustAdded
                          ? "bg-[#155132] text-[#F9E498] scale-105"
                          : "bg-white/95 text-[#155132] hover:bg-[#155132] hover:text-white"
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 px-0.5">
                    <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                      <Link href={`/san-pham/${product.slug}`}>
                        {product.name}, chuẩn ISO 22000 & FDA
                      </Link>
                    </h3>
                    <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                      {(product.priceVnd || 0).toLocaleString("en-US")}đ
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
