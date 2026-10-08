"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ProductCategory, ProductRecord } from "@/db/schema";
import { useCart } from "./CartProvider";

export function ProductMenuSection({
  products,
  title = "Yến Tươi Chưng Nóng Nổi Bật",
  subtitle,
}: {
  products: ProductRecord[];
  title?: string;
  subtitle?: string;
  showGiftQuickSwitch?: boolean;
}) {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<"all" | ProductCategory>("all");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filterTabs: { id: "all" | ProductCategory; label: string }[] = useMemo(
    () => [
      { id: "all", label: `Tất cả (${products.length})` },
      { id: "nguyen-ban", label: "Nguyên bản" },
      { id: "ngot-diu", label: "Ngọt dịu" },
      { id: "nhieu-tang", label: "Phối vị" },
    ],
    [products.length]
  );

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

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
      selectedOption: product.supportedOptions[0] || "Độ ngọt tiêu chuẩn",
      imageUrl: product.imageUrl,
      quantity: 1,
    });
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId((prev) => (prev === product.id ? null : prev));
    }, 1200);
  };

  return (
    <section
      id="menu-chu-luc"
      aria-labelledby="menu-section-heading"
      className="py-8 md:py-14 px-4 lg:px-8 max-w-[1440px] mx-auto"
    >
      {/* Langfarm-style Large Serif Section Heading + Filter Pills */}
      <div className="mb-6 lg:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2
            id="menu-section-heading"
            className="font-serif-display text-2xl sm:text-3xl lg:text-[42px] lg:leading-[3.25rem] font-semibold text-[#1d2327]"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#50575e] mt-1">{subtitle}</p>
          )}
        </div>

        {/* Filter Pills */}
        <div
          role="tablist"
          aria-label="Lọc món"
          className="flex flex-nowrap overflow-x-auto gap-2 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filterTabs.map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveCategory(tab.id)}
                className={`shrink-0 whitespace-nowrap min-h-[38px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#155132] text-white"
                    : "bg-[#F6F4EE] text-[#1d2327] hover:bg-[#EBE6D8]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Langfarm-style Borderless Product Grid: Rounded-2xl Square Image + Simple Title + Bold Price */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {filteredProducts.map((product) => {
          const isOrderable = product.status === "AVAILABLE" && product.priceVnd !== null;
          const isOutOfStock = product.status === "OUT_OF_STOCK";
          const isPendingApproval =
            product.status === "PENDING_DATA_APPROVAL" || product.priceVnd === null;
          const isJustAdded = justAddedId === product.id;

          return (
            <article
              key={product.id}
              data-testid={`product-card-${product.slug}`}
              className="group flex flex-col gap-3 bg-white rounded-3xl"
            >
              {/* Square Rounded-2xl Image Container */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                <Link
                  href={`/san-pham/${product.slug}`}
                  aria-label={`Xem chi tiết ${product.name}`}
                  className="block w-full h-full"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    width={410}
                    height={410}
                    className="h-full w-full rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>

                {product.isIllustrationImage && (
                  <span className="absolute bottom-2.5 left-2.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] text-[#2B433A]">
                    Ảnh minh họa
                  </span>
                )}

                {isOutOfStock && (
                  <span
                    data-testid={`badge-out-of-stock-${product.slug}`}
                    className="absolute top-2.5 left-2.5 bg-amber-800 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow"
                  >
                    Tạm hết
                  </span>
                )}
                {isPendingApproval && (
                  <span
                    data-testid={`badge-unapproved-${product.slug}`}
                    className="absolute top-2.5 left-2.5 bg-[#2B433A] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow"
                  >
                    Chưa mở đặt
                  </span>
                )}

                {/* Subtle Floating Add-to-Cart Button on Bottom-Right of Image */}
                <button
                  type="button"
                  disabled={!isOrderable}
                  data-testid={`add-to-cart-${product.slug}`}
                  title={
                    isOrderable
                      ? `Chọn ${product.name}`
                      : isOutOfStock
                        ? "Món tạm hết trong ngày"
                        : "Món chưa mở đặt"
                  }
                  aria-label={
                    isOrderable
                      ? `Chọn món ${product.name}`
                      : isOutOfStock
                        ? `${product.name} tạm hết`
                        : `${product.name} chưa mở đặt`
                  }
                  onClick={() => handleQuickAdd(product)}
                  className={`absolute bottom-2.5 right-2.5 inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md transition-all duration-150 ${
                    isOrderable
                      ? isJustAdded
                        ? "bg-[#155132] text-[#F9E498] scale-105 cursor-pointer"
                        : "bg-white/95 text-[#155132] hover:bg-[#155132] hover:text-white cursor-pointer"
                      : "bg-gray-200/90 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isOrderable ? (
                    isJustAdded ? (
                      <Check className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    )
                  ) : (
                    <span className="text-[10px] font-bold">Hết</span>
                  )}
                </button>
              </div>

              {/* Langfarm Minimalist Meta: Name + Price only */}
              <div className="flex flex-col gap-1 px-0.5">
                <h3 className="text-sm sm:text-base leading-6 font-normal text-[#1d2327] group-hover:text-[#155132] line-clamp-2 transition-colors">
                  <Link href={`/san-pham/${product.slug}`}>
                    {product.name}, thố sứ 200ml (35g yến tươi)
                  </Link>
                </h3>
                <div className="flex items-center gap-2">
                  {product.priceVnd !== null ? (
                    <p className="text-sm sm:text-base leading-6 font-semibold text-[#1d2327]">
                      {product.priceVnd.toLocaleString("en-US")}đ
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm font-medium text-[#8A6632]">
                      Đang cập nhật
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
