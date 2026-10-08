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
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="mb-6">
        <Link
          href="/yen-tuoi-chung-nong"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại Thực đơn & Sản phẩm</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Langfarm-style Square Studio Product Visual + 3 Pastel Badges */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F8F5EC] shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={`Thố yến ${product.name}`}
              width={800}
              height={800}
              className="w-full h-full object-cover"
            />
            {product.isIllustrationImage && (
              <span className="absolute top-4 left-4 bg-white/95 text-[#2B433A] text-xs font-semibold px-3.5 py-1 rounded-full shadow-2xs">
                Ảnh minh họa
              </span>
            )}
            <span className="absolute bottom-4 left-4 bg-[#1B4332]/95 text-[#FFFCF4] text-xs font-semibold px-3.5 py-1 rounded-full">
              {product.volumeMl === 200
                ? "Thố sứ 200ml • 35g Yến tươi"
                : `Quy cách ${product.volumeMl}ml`}
            </span>
          </div>

          {/* 3 Langfarm Pastel Trust Badges under product photo */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#FFE9DD] p-3">
              <p className="font-serif-display text-xs sm:text-sm font-bold text-[#1B1B1B]">
                35g Yến Tươi
              </p>
              <p className="text-[11px] text-[#4A4A4A]">Nguyên tổ Việt Nam</p>
            </div>
            <div className="rounded-2xl bg-[#E2FCF3] p-3">
              <p className="font-serif-display text-xs sm:text-sm font-bold text-[#1B1B1B]">
                Giao Nóng 2H
              </p>
              <p className="text-[11px] text-[#4A4A4A]">Nội thành Đà Nẵng</p>
            </div>
            <div className="rounded-2xl bg-[#FAEFCA] p-3">
              <p className="font-serif-display text-xs sm:text-sm font-bold text-[#1B1B1B]">
                ISO & FDA
              </p>
              <p className="text-[11px] text-[#4A4A4A]">Không chất bảo quản</p>
            </div>
          </div>
        </div>

        {/* Right: Product Info & Selection in Langfarm Minimalist Style */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C4D2B] bg-[#FFE9DD] px-3 py-1 rounded-full">
                {product.categoryLabel}
              </span>
              {product.status === "AVAILABLE" && (
                <span className="text-xs font-bold text-[#1B4332] bg-[#E2FCF3] px-3 py-1 rounded-full">
                  Chưng tươi thủ công • Giao ngay trong 2H
                </span>
              )}
              {product.status === "OUT_OF_STOCK" && (
                <span className="text-xs font-bold text-white bg-amber-800 px-3 py-1 rounded-full">
                  Tạm hết trong ngày
                </span>
              )}
              {product.status === "PENDING_DATA_APPROVAL" && (
                <span className="text-xs font-bold text-[#FFFCF4] bg-[#2B433A] px-3 py-1 rounded-full">
                  Đang cập nhật giá • Chưa mở đặt
                </span>
              )}
            </div>

            <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1B1B1B] leading-tight">
              {product.name}
            </h1>

            {/* Price Box */}
            <div className="p-5 rounded-3xl bg-[#FAF4EB] space-y-2">
              {unitPrice !== null ? (
                <div className="flex flex-wrap items-baseline gap-3">
                  <span
                    data-testid="product-detail-price"
                    className="text-3xl sm:text-4xl font-extrabold text-[#1B1B1B]"
                  >
                    {unitPrice.toLocaleString("vi-VN")} ₫
                  </span>
                  <span className="text-xs font-semibold text-[#7C4D2B] bg-white px-3 py-1 rounded-full">
                    {product.volumeMl === 200
                      ? "Thố sứ 200ml (35g yến tươi) • Giao nóng 2H"
                      : `Quy cách ${product.volumeMl}ml • Chuẩn ISO 22000 & FDA`}
                  </span>
                </div>
              ) : (
                <p className="text-sm font-semibold text-[#7C4D2B]">
                  Món hiện đang cập nhật thông số định lượng và giá chính thức nên tạm khóa đặt trực tuyến.
                </p>
              )}
              <p className="text-xs sm:text-sm text-[#1B4332] font-medium leading-relaxed">
                ✨ Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#2B433A] leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Ingredients List */}
            <div className="space-y-2.5">
              <h2 className="text-xs font-bold text-[#7C4D2B] uppercase tracking-wider">
                Thành phần nguyên bản ({product.volumeMl}ml):
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.ingredients.map((ing) => (
                  <li
                    key={ing}
                    className="flex items-center gap-2 text-xs sm:text-sm bg-white px-3.5 py-2.5 rounded-2xl shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                    <span className="font-medium text-[#1B1B1B]">{ing}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs sm:text-sm text-[#4A4A4A] pt-1">
                <strong className="text-[#1B1B1B]">Khẩu vị:</strong> {product.tasteProfile}
              </p>
            </div>

            {/* Variants & Options (Only shown when orderable) */}
            {isOrderable && (
              <div className="space-y-4 pt-4 border-t border-[#E6DAC6]">
                {/* Packaging Variant */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1B1B1B] mb-2">
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
                          className={`min-h-[48px] px-4 py-3 rounded-2xl text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                            active
                              ? "bg-[#1B4332] text-white font-bold shadow-xs"
                              : "bg-white text-[#1B1B1B] hover:bg-[#FAF4EB]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span>{v.name}</span>
                            {v.priceDeltaVnd > 0 && (
                              <span
                                className={
                                  active ? "text-[#F3D78A]" : "text-[#7C4D2B] font-semibold"
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
                      className="block text-xs sm:text-sm font-bold text-[#1B1B1B] mb-1.5"
                    >
                      2. Tùy chọn độ ngọt:
                    </label>
                    <select
                      id="kitchen-option-select"
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-white text-sm font-medium text-[#1B1B1B] shadow-2xs"
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
                  <span className="text-xs sm:text-sm font-bold text-[#1B1B1B]">
                    3. Số lượng:
                  </span>
                  <div className="inline-flex items-center rounded-full bg-white p-1 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Giảm số lượng"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B4332] hover:bg-[#FAF4EB] cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span
                      data-testid="detail-quantity-value"
                      className="px-5 font-bold text-base text-[#1B1B1B]"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      aria-label="Tăng số lượng"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[#1B4332] hover:bg-[#FAF4EB] cursor-pointer"
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
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-white text-[#1B4332] border border-[#1B4332]/25 font-bold text-sm hover:bg-[#FAF4EB] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    <span>Thêm vào giỏ</span>
                  </button>

                  <button
                    type="button"
                    data-testid="detail-order-now"
                    onClick={() => handleAddToCart(true, false)}
                    className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D78A] to-[#D4AF37] text-[#1B1B1B] font-bold text-sm shadow-xs hover:brightness-105 transition cursor-pointer"
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
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-full bg-[#FFE9DD] text-[#7C4D2B] hover:bg-[#FAD4B8] text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Gửi Tặng Người Thân (Kèm hộp quà & thiệp viết tay)</span>
                </button>
              </div>
            )}

            {/* Usage, Storage & Safety in Soft Langfarm Cards */}
            <div className="space-y-3 pt-4 border-t border-[#E6DAC6]">
              <div className="p-4 rounded-2xl bg-[#FAF4EB]">
                <h3 className="text-xs sm:text-sm font-bold text-[#1B4332]">
                  Hướng dẫn thưởng thức:
                </h3>
                <p className="text-xs sm:text-sm text-[#2B433A]/90 mt-1 leading-relaxed">
                  {product.usageGuide}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF4EB]">
                <h3 className="text-xs sm:text-sm font-bold text-[#1B4332]">
                  Hướng dẫn bảo quản:
                </h3>
                <p className="text-xs sm:text-sm text-[#2B433A]/90 mt-1 leading-relaxed">
                  {product.storageGuide}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAEFCA]/65 flex items-start gap-2.5">
                <AlertCircle
                  className="w-4 h-4 text-[#7C4D2B] shrink-0 mt-0.5"
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
