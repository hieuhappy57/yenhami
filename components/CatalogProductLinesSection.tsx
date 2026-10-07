"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Check, CheckCircle2, Gift, Plus, ShieldCheck, Sparkles } from "lucide-react";
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

  const jarProducts = useMemo(() => {
    const allJars = products.filter((p) => p.id.startsWith("cat-yen-hu-"));
    if (jarVolumeTab === "75ml") {
      return allJars.filter((p) => p.volumeMl === 75);
    }
    if (jarVolumeTab === "100ml") {
      return allJars.filter((p) => p.volumeMl === 100);
    }
    return allJars;
  }, [products, jarVolumeTab]);

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
    <div className="space-y-8 md:space-y-12 py-6 md:py-10 px-3 sm:px-4 max-w-[1200px] mx-auto border-t border-[#BD9342]/25">
      {/* 1. SET QUÀ TẶNG YẾN SÀO THƯỢNG HẠNG (MẪU THỰC TẾ) */}
      <section
        id="danh-muc-set-qua"
        aria-labelledby="set-qua-heading"
        data-testid="section-set-qua"
        className="scroll-mt-28 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
              <Gift className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
              <span>Bộ sưu tập Quà biếu sức khỏe & Doanh nghiệp</span>
            </div>
            <h2
              id="set-qua-heading"
              className="font-serif-display text-xl sm:text-3xl font-bold text-[#155132] mt-0.5"
            >
              Set Quà Yến Sào Thượng Hạng
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85">
            Hộp quà Hoa Sen & Đàn Én ép kim sang trọng • Kèm thiệp viết tay
          </p>
        </div>

        {/* Real Product Showcase Banner + Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Left: 2-photo real product showcase */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-2.5">
            <div className="relative rounded-xl overflow-hidden border border-[#BD9342]/35 bg-[#FFFCF4] aspect-square">
              <img
                src="/brand/catalog/set-qua-hop-sen-en.jpg"
                alt="Hộp quà Hoa Sen & Đàn Én Yến Sào Hà Mi"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 right-2 bg-[#155132]/90 text-[#FFFCF4] text-[11px] font-medium px-2 py-1 rounded text-center">
                Hộp quà Sen Vàng & Đàn Én
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#BD9342]/35 bg-[#FFFCF4] aspect-square">
              <img
                src="/brand/catalog/set-qua-6-hu-6-vi.jpg"
                alt="Set 6 hũ Yến Sào Thượng Hạng 6 vị Hà Mi"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 right-2 bg-[#155132]/90 text-[#FFFCF4] text-[11px] font-medium px-2 py-1 rounded text-center">
                Trọn bộ 6 Hũ • 6 Hương Vị
              </span>
            </div>
          </div>

          {/* Right: Orderable Set Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {giftSetProducts.map((product) => {
              const isJustAdded = justAddedId === product.id;
              return (
                <article
                  key={product.id}
                  data-testid={`product-card-${product.slug}`}
                  className="flex flex-col justify-between rounded-xl bg-white border border-[#155132]/15 p-3.5 sm:p-4 shadow-xs hover:border-[#BD9342]/65 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/35 px-2 py-0.5 rounded">
                        Hộp 6 hũ × {product.volumeMl}ml
                      </span>
                      <span className="text-[11px] font-semibold text-[#155132]">
                        Free Ship
                      </span>
                    </div>
                    <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#155132] leading-snug">
                      <Link
                        href={`/san-pham/${product.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#2B433A]/85 leading-relaxed line-clamp-3">
                      {product.shortDescription}
                    </p>
                    <p className="text-[11px] text-[#8A6632] font-medium truncate">
                      Vị: {product.ingredients.join(" • ")}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#155132]/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-[#155132]">
                        {(product.priceVnd || 0).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="block text-[10px] text-[#2B433A]/70">
                        / Hộp quà 6 hũ
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      onClick={() => handleQuickAdd(product)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] text-xs font-semibold hover:bg-[#0e3b23] transition-colors cursor-pointer"
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                          <span>Đã chọn</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                          <span>Chọn Set</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. YẾN HŨ CHƯNG SẴN THƯỢNG HẠNG (75ML & 100ML) */}
      <section
        id="danh-muc-yen-hu"
        aria-labelledby="yen-hu-heading"
        data-testid="section-yen-hu"
        className="scroll-mt-28 space-y-4 pt-4 border-t border-[#BD9342]/20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
              <Sparkles className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
              <span>100% Yến tự nhiên tiệt trùng • Không chất bảo quản</span>
            </div>
            <h2
              id="yen-hu-heading"
              className="font-serif-display text-xl sm:text-3xl font-bold text-[#155132] mt-0.5"
            >
              Yến Hũ Chưng Sẵn (75ml & 100ml)
            </h2>
          </div>

          {/* Volume Switcher Tabs: 75ml vs 100ml */}
          <div
            role="tablist"
            aria-label="Chọn thể tích Yến Hũ"
            className="flex flex-nowrap overflow-x-auto gap-1.5 pb-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={jarVolumeTab === "75ml"}
              onClick={() => setJarVolumeTab("75ml")}
              className={`shrink-0 min-h-[40px] px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                jarVolumeTab === "75ml"
                  ? "bg-[#155132] text-[#FFFCF4] border border-[#BD9342]"
                  : "bg-[#FFFCF4] text-[#2B433A] border border-[#155132]/20 hover:border-[#155132]"
              }`}
            >
              Hũ 75ml Thượng Hạng (40k – 45k)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={jarVolumeTab === "100ml"}
              onClick={() => setJarVolumeTab("100ml")}
              className={`shrink-0 min-h-[40px] px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                jarVolumeTab === "100ml"
                  ? "bg-[#155132] text-[#FFFCF4] border border-[#BD9342]"
                  : "bg-[#FFFCF4] text-[#2B433A] border border-[#155132]/20 hover:border-[#155132]"
              }`}
            >
              Hũ 100ml Nguyên Chất (100k – 110k)
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={jarVolumeTab === "all"}
              onClick={() => setJarVolumeTab("all")}
              className={`shrink-0 min-h-[40px] px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                jarVolumeTab === "all"
                  ? "bg-[#155132] text-[#FFFCF4] border border-[#BD9342]"
                  : "bg-[#FFFCF4] text-[#2B433A] border border-[#155132]/20 hover:border-[#155132]"
              }`}
            >
              Tất cả (11)
            </button>
          </div>
        </div>

        {/* Compact Grid of 75ml / 100ml Jars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {jarProducts.map((product) => {
            const isJustAdded = justAddedId === product.id;
            return (
              <article
                key={product.id}
                data-testid={`product-card-${product.slug}`}
                className="flex flex-col rounded-lg bg-white border border-[#155132]/15 shadow-xs hover:border-[#BD9342]/65 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-square bg-[#FFFCF4] overflow-hidden">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <span className="absolute top-1.5 left-1.5 bg-[#155132] text-[#FFFCF4] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded shadow-2xs">
                    Hũ {product.volumeMl}ml
                  </span>
                </div>

                <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between gap-1.5 sm:gap-2">
                  <div>
                    <h3 className="font-serif-display text-[13px] sm:text-base font-semibold text-[#155132] leading-tight sm:leading-snug line-clamp-2 min-h-[2.05rem] sm:min-h-[2.5rem]">
                      <Link
                        href={`/san-pham/${product.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="hidden sm:block text-xs text-[#2B433A]/80 mt-1 truncate">
                      {product.ingredients.join(" • ")}
                    </p>
                  </div>

                  <div className="pt-1.5 sm:pt-2 border-t border-[#155132]/10 flex items-center justify-between gap-1.5">
                    <span className="text-xs sm:text-base font-bold text-[#155132]">
                      {(product.priceVnd || 0).toLocaleString("vi-VN")}đ
                    </span>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      aria-label={`Chọn món ${product.name}`}
                      onClick={() => handleQuickAdd(product)}
                      className={`w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#BD9342] transition-colors cursor-pointer ${
                        isJustAdded
                          ? "bg-[#0e3b23] text-[#BD9342]"
                          : "bg-[#155132] text-[#FFFCF4] hover:bg-[#0e3b23]"
                      }`}
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                      ) : (
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. YẾN SÀO TINH CHẾ NGUYÊN TỔ 100G (ISO 22000:2018 & FDA) */}
      <section
        id="danh-muc-yen-tinh-che"
        aria-labelledby="yen-tinh-che-heading"
        data-testid="section-yen-tinh-che"
        className="scroll-mt-28 space-y-4 pt-4 border-t border-[#BD9342]/20"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
              <Award className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
              <span>Sơ chế nước lọc RO tinh khiết • Chuẩn ISO 22000:2018 & FDA</span>
            </div>
            <h2
              id="yen-tinh-che-heading"
              className="font-serif-display text-xl sm:text-3xl font-bold text-[#155132] mt-0.5"
            >
              Yến Sào Tinh Chế Cao Cấp (Hộp 100g)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85">
            Làm ẩm nhẹ & rút lông đại thủ công • Không chất tẩy trắng • Không độn mủ trôm
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {refinedNestProducts.map((product) => {
            const isJustAdded = justAddedId === product.id;
            return (
              <article
                key={product.id}
                data-testid={`product-card-${product.slug}`}
                className="flex flex-col rounded-xl bg-white border border-[#155132]/15 shadow-xs hover:border-[#BD9342]/65 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="relative h-48 sm:h-52 bg-[#FFFCF4] flex items-center justify-center p-3 overflow-hidden">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block w-full h-full"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <span className="absolute top-2.5 left-2.5 bg-[#FFFCF4]/95 text-[#155132] border border-[#BD9342]/40 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    Hộp 100g • Nguyên chất
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#155132]">
                      <Link
                        href={`/san-pham/${product.slug}`}
                        className="hover:underline underline-offset-4"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-[#2B433A]/85 mt-1.5 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#155132]/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base sm:text-lg font-bold text-[#155132]">
                        {(product.priceVnd || 0).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="block text-[10px] text-[#2B433A]/70">
                        Miễn phí giao hàng
                      </span>
                    </div>
                    <button
                      type="button"
                      data-testid={`add-to-cart-${product.slug}`}
                      onClick={() => handleQuickAdd(product)}
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] text-xs font-semibold hover:bg-[#0e3b23] transition-colors cursor-pointer"
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                          <span>Đã chọn</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                          <span>Đặt mua</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Catalog Quality & Factory Assurance Strip */}
        <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/35 p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 h-36 sm:h-40 rounded-lg overflow-hidden border border-[#155132]/15">
            <img
              src="/brand/catalog/nha-may-so-che.jpg"
              alt="Nhà máy sản xuất Yến Sào Hà Mi chuẩn ISO 22000:2018 và FDA"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#155132]">
              <ShieldCheck className="w-4 h-4 text-[#155132]" aria-hidden="true" />
              <span>Năng lực sản xuất & Cam kết chất lượng Yến Sào Hà Mi</span>
            </div>
            <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
              Hà Mi trực tiếp khai thác và hợp tác với hàng trăm nhà yến đạt chuẩn tại các vùng chim yến nổi tiếng Việt Nam có hàm lượng protein cao. Nhà máy vận hành theo tiêu chuẩn quốc tế{" "}
              <strong className="text-[#155132]">ISO 22000:2018</strong> và chứng nhận{" "}
              <strong className="text-[#155132]">FDA Hoa Kỳ</strong>, ứng dụng hệ thống lọc nước tinh khiết RO toàn diện từ khâu sơ chế yến thô đến khi ra thành phẩm.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs font-medium text-[#155132]">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
                100% Yến thật tinh khiết
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
                Không chất bảo quản & tẩy trắng
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
                Chứng nhận ISO 22000:2018 & FDA
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
