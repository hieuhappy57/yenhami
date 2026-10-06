"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProductCategory, ProductRecord } from "@/db/schema";
import { useCart } from "./CartProvider";

export function ProductMenuSection({
  products,
  title = "Menu Yến Tươi Chưng Nóng",
  subtitle,
}: {
  products: ProductRecord[];
  title?: string;
  subtitle?: string;
  showGiftQuickSwitch?: boolean;
}) {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<"all" | ProductCategory>("all");

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
  };

  return (
    <section
      id="menu-chu-luc"
      aria-labelledby="menu-section-heading"
      className="py-4 md:py-10 px-3 sm:px-4 max-w-[1200px] mx-auto"
    >
      {/* Compact Header + Single-Row Horizontal Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 mb-3.5 md:mb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="menu-section-heading"
              className="font-serif-display text-xl sm:text-3xl font-semibold text-[#155132]"
            >
              {title}
            </h2>
            <span className="text-[11px] sm:text-xs font-medium text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/35 px-2 py-0.5 rounded">
              Thố 200ml • Giá và ảnh minh họa
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-[#155132] bg-[#155132]/10 border border-[#155132]/25 px-2 py-0.5 rounded">
              Đặt từ 2 thố • Free Ship
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#2B433A]/85 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Single-Row Scrollable Filter Tabs */}
        <div
          role="tablist"
          aria-label="Lọc món"
          className="flex flex-nowrap overflow-x-auto gap-1.5 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className={`shrink-0 whitespace-nowrap min-h-[36px] px-2.5 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#155132] text-[#FFFCF4] border border-[#BD9342]"
                    : "bg-[#FFFCF4] text-[#2B433A] border border-[#155132]/20 hover:border-[#155132]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column Mobile / 4-Column Desktop Compact Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {filteredProducts.map((product) => {
          const isOrderable = product.status === "AVAILABLE" && product.priceVnd !== null;
          const isOutOfStock = product.status === "OUT_OF_STOCK";
          const isPendingApproval =
            product.status === "PENDING_DATA_APPROVAL" || product.priceVnd === null;

          const highlightIngredients = product.ingredients.filter(
            (ing) => !/^(tổ yến tươi chưng|nước tinh khiết)/i.test(ing.trim())
          );
          const visibleIngredientsText =
            (highlightIngredients.length > 0
              ? highlightIngredients
              : product.ingredients
            ).join(" • ");

          return (
            <article
              key={product.id}
              data-testid={`product-card-${product.slug}`}
              className="flex flex-col rounded-lg bg-white border border-[#155132]/15 shadow-xs hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Square Clickable Image */}
              <div className="relative aspect-square bg-[#FFFCF4] overflow-hidden">
                <Link
                  href={`/san-pham/${product.slug}`}
                  aria-label={`Xem chi tiết ${product.name}`}
                  className="block w-full h-full"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    width={320}
                    height={320}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {isOutOfStock && (
                  <span
                    data-testid={`badge-out-of-stock-${product.slug}`}
                    className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-amber-800 text-white text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded shadow"
                  >
                    Tạm hết
                  </span>
                )}
                {isPendingApproval && (
                  <span
                    data-testid={`badge-unapproved-${product.slug}`}
                    className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-[#2B433A] text-[#FFFCF4] text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded shadow"
                  >
                    Chưa mở đặt
                  </span>
                )}
              </div>

              {/* Compact Card Body: 2-line stable name, desktop-only ingredients, price + Plus */}
              <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2.5">
                <div className="min-w-0">
                  <h3 className="font-serif-display text-[13px] sm:text-lg font-semibold text-[#155132] leading-tight sm:leading-snug line-clamp-2 min-h-[2.05rem] sm:min-h-[2.75rem]">
                    <Link
                      href={`/san-pham/${product.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {product.name}
                    </Link>
                  </h3>
                  <p
                    title={product.ingredients.join(", ")}
                    className="hidden sm:block text-xs text-[#2B433A]/80 mt-1 truncate"
                  >
                    {visibleIngredientsText}
                  </p>
                </div>

                <div className="pt-1.5 sm:pt-2.5 border-t border-[#155132]/10 flex items-center justify-between gap-1.5">
                  {product.priceVnd !== null ? (
                    <span className="text-xs sm:text-lg font-bold text-[#155132] truncate">
                      {product.priceVnd.toLocaleString("vi-VN")}đ
                    </span>
                  ) : (
                    <span className="text-[11px] sm:text-xs font-semibold text-[#8A6632] truncate">
                      Đang cập nhật
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={!isOrderable}
                    data-testid={`add-to-cart-${product.slug}`}
                    title={
                      isOrderable
                        ? `Chọn ${product.name}`
                        : isOutOfStock
                          ? "Món tạm hết ca này"
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
                    className={`shrink-0 inline-flex items-center justify-center min-w-[36px] min-h-[36px] rounded-md text-[11px] sm:text-xs font-semibold transition-colors ${
                      isOrderable
                        ? "w-9 h-9 sm:w-10 sm:h-10 bg-[#155132] text-[#FFFCF4] border border-[#BD9342] hover:bg-[#0e3b23] cursor-pointer"
                        : "px-2 py-1 bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                    }`}
                  >
                    {isOrderable ? (
                      <Plus className="w-4 h-4" aria-hidden="true" />
                    ) : isOutOfStock ? (
                      <span>Hết</span>
                    ) : (
                      <span>Khóa</span>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
