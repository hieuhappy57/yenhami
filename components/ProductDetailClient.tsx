"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Minus,
  Plus,
  ShoppingBag,
  Gift,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import type { ProductRecord } from "@/db/schema";
import { useCart } from "./CartProvider";

export function ProductDetailClient({ product }: { product: ProductRecord }) {
  const router = useRouter();
  const { addItem, setOrderPurpose } = useCart();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ""
  );
  const [selectedOption, setSelectedOption] = useState<string>(
    product.supportedOptions[0] || "Độ ngọt tiêu chuẩn"
  );
  const [quantity, setQuantity] = useState<number>(1);

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const isOrderable = product.status === "AVAILABLE" && product.priceVnd !== null;
  const unitPrice =
    product.priceVnd !== null && selectedVariant
      ? product.priceVnd + selectedVariant.priceDeltaVnd
      : null;

  const handleAddToCart = (goToCheckout: boolean, asGift = false) => {
    if (!isOrderable || unitPrice === null || !selectedVariant) return;
    if (asGift) {
      setOrderPurpose("GIFT");
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      productName: product.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      unitPriceVnd: unitPrice,
      volumeMl: product.volumeMl,
      selectedOption,
      imageUrl: product.imageUrl,
      quantity,
    });
    if (goToCheckout) {
      router.push("/dat-hang");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link
          href="/yen-tuoi-chung-nong"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#155132] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại Menu Yến Tươi Chưng Nóng</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left: Product Visual */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[5/4] rounded-xl overflow-hidden bg-[#FFFCF4] border border-[#BD9342]/40 shadow-xs">
            <img
              src={product.imageUrl}
              alt={`Thố yến ${product.name}`}
              width={800}
              height={640}
              className="w-full h-full object-cover"
            />
            {product.isIllustrationImage && (
              <span className="absolute top-3 left-3 bg-white/95 text-[#2B433A] border border-[#BD9342]/50 text-xs font-medium px-3 py-1 rounded">
                Ảnh minh họa
              </span>
            )}
            <span className="absolute bottom-3 left-3 bg-[#155132] text-[#FFFCF4] text-xs font-semibold px-3 py-1 rounded">
              Thố sứ {product.volumeMl}ml
            </span>
          </div>
        </div>

        {/* Right: Product Info & Selection */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/40 px-2.5 py-1 rounded">
                {product.categoryLabel}
              </span>
              {product.status === "AVAILABLE" && (
                <span className="text-xs font-semibold text-[#155132] bg-[#DBF1EE]/80 px-2.5 py-1 rounded">
                  Chưng tươi thủ công • Giao ngay trong 2H
                </span>
              )}
              {product.status === "OUT_OF_STOCK" && (
                <span className="text-xs font-semibold text-white bg-amber-800 px-2.5 py-1 rounded">
                  Tạm hết trong ngày
                </span>
              )}
              {product.status === "PENDING_DATA_APPROVAL" && (
                <span className="text-xs font-semibold text-[#FFFCF4] bg-[#2B433A] px-2.5 py-1 rounded">
                  Đang cập nhật giá • Chưa mở đặt
                </span>
              )}
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#155132]">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-4 rounded-lg bg-[#FFFCF4] border border-[#BD9342]/45 space-y-2">
              {unitPrice !== null ? (
                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span
                    data-testid="product-detail-price"
                    className="text-2xl sm:text-3xl font-bold text-[#155132]"
                  >
                    {unitPrice.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs font-semibold text-[#8A6632] bg-white border border-[#BD9342]/40 px-2 py-0.5 rounded">
                    {product.volumeMl === 200
                      ? "Thố sứ 200ml (35g yến tươi) • Giao nóng 2H"
                      : `Quy cách ${product.volumeMl}ml • Chuẩn ISO 22000 & FDA`}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#8A6632]">
                  Món hiện đang cập nhật thông số định lượng và giá chính thức nên tạm khóa đặt trực
                  tuyến.
                </p>
              )}
              <p className="text-xs text-[#155132] font-medium leading-relaxed">
                ✨ Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!
              </p>
            </div>

            <p className="text-base text-[#2B433A] leading-relaxed">{product.shortDescription}</p>

            {/* Ingredients List */}
            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-semibold text-[#155132] uppercase tracking-wider">
                Thành phần trong thố ({product.volumeMl}ml):
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="flex items-center gap-2 text-sm bg-white border border-[#155132]/15 px-3 py-2 rounded-md"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#155132] shrink-0" aria-hidden="true" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-[#2B433A]/85 pt-1">
                <strong>Khẩu vị:</strong> {product.tasteProfile}
              </p>
            </div>

            {/* Variants & Options (Only shown when orderable) */}
            {isOrderable && (
              <div className="space-y-4 pt-3 border-t border-[#155132]/15">
                {/* Packaging Variant */}
                <div>
                  <label className="block text-sm font-semibold text-[#155132] mb-2">
                    1. Chọn hình thức chuẩn bị:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {product.variants.map((v) => {
                      const active = v.id === selectedVariant?.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`min-h-[48px] p-3 rounded-lg border text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                            active
                              ? "bg-[#155132] text-[#FFFCF4] border-[#BD9342] font-semibold"
                              : "bg-white text-[#2B433A] border-[#155132]/25 hover:bg-[#FFFCF4]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{v.name}</span>
                            {v.priceDeltaVnd > 0 && (
                              <span
                                className={
                                  active ? "text-[#BD9342]" : "text-[#8A6632] font-semibold"
                                }
                              >
                                +{v.priceDeltaVnd.toLocaleString("vi-VN")}đ
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Kitchen-supported Option */}
                {product.supportedOptions.length > 0 && (
                  <div>
                    <label
                      htmlFor="kitchen-option-select"
                      className="block text-sm font-semibold text-[#155132] mb-1.5"
                    >
                      2. Tùy chọn độ ngọt:
                    </label>
                    <select
                      id="kitchen-option-select"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-md border border-[#155132]/30 bg-white text-sm text-[#2B433A]"
                    >
                      {product.supportedOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-sm font-semibold text-[#155132]">3. Số lượng thố:</span>
                  <div className="inline-flex items-center rounded-md border border-[#155132]/30 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Giảm số lượng"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      data-testid="detail-quantity-value"
                      className="px-4 font-bold text-base text-[#155132]"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      aria-label="Tăng số lượng"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    data-testid="detail-add-to-cart"
                    onClick={() => handleAddToCart(false, false)}
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-md bg-white text-[#155132] border-2 border-[#155132] font-semibold text-sm hover:bg-[#FFFCF4] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    <span>Thêm vào giỏ</span>
                  </button>

                  <button
                    type="button"
                    data-testid="detail-order-now"
                    onClick={() => handleAddToCart(true, false)}
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 rounded-md bg-[#155132] text-[#FFFCF4] border-2 border-[#BD9342] font-semibold text-sm hover:bg-[#0e3b23] transition-colors cursor-pointer"
                  >
                    <span>Đặt món này →</span>
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="detail-gift-cta"
                  onClick={() => {
                    const giftVar = product.variants[1] || product.variants[0];
                    if (giftVar) setSelectedVariantId(giftVar.id);
                    setOrderPurpose("GIFT");
                    addItem({
                      productId: product.id,
                      slug: product.slug,
                      productName: product.name,
                      variantId: giftVar.id,
                      variantName: giftVar.name,
                      unitPriceVnd: (product.priceVnd || 0) + giftVar.priceDeltaVnd,
                      volumeMl: product.volumeMl,
                      selectedOption,
                      imageUrl: product.imageUrl,
                      quantity,
                    });
                    router.push("/dat-hang");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-md bg-[#FFFCF4] text-[#8A6632] hover:text-[#155132] border border-[#BD9342]/50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
                >
                  <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Tặng người thân (Kèm hộp quà & thiệp)</span>
                </button>
              </div>
            )}

            {/* Usage, Storage & Safety */}
            <div className="space-y-3 pt-4 border-t border-[#155132]/15">
              <div className="p-3.5 rounded-lg bg-[#FFFCF4] border border-[#BD9342]/30">
                <h3 className="text-sm font-semibold text-[#155132]">Cách dùng:</h3>
                <p className="text-xs sm:text-sm text-[#2B433A]/90 mt-1 leading-relaxed">
                  {product.usageGuide}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-[#FFFCF4] border border-[#BD9342]/30">
                <h3 className="text-sm font-semibold text-[#155132]">Bảo quản:</h3>
                <p className="text-xs sm:text-sm text-[#2B433A]/90 mt-1 leading-relaxed">
                  {product.storageGuide}
                </p>
              </div>
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-[#BD9342]/40 flex items-start gap-2.5">
                <AlertCircle
                  className="w-4 h-4 text-[#8A6632] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-[#2B433A] leading-relaxed">
                  <strong>Lưu ý thành phần:</strong> {product.cautionNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
