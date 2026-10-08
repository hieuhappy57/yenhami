import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { getAllProducts, getDeliverySlots, getServiceZones, syncDbFromCloud } from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Yến Tươi Chưng Nóng Đà Nẵng",
  description:
    "Xem thực đơn yến tươi chưng nóng tại Đà Nẵng. Chọn món và gửi yêu cầu đặt hàng để Hà Mi xác nhận trước khi chuẩn bị và giao.",
  path: "/yen-tuoi-chung-nong",
});

const QUICK_CATEGORIES = [
  {
    title: "Yến Chưng Nóng 2H",
    subtitle: "8 vị thố sứ 200ml • Từ 295.000đ",
    href: "#menu-chu-luc",
    bgColor: "#FFE9DD",
  },
  {
    title: "Set Quà Biếu",
    subtitle: "Hộp Hoa Sen & Đàn Én sang trọng",
    href: "#danh-muc-set-qua",
    bgColor: "#F5E2F9",
  },
  {
    title: "Yến Hũ Chưng Sẵn",
    subtitle: "75ml & 100ml tiện lợi dùng ngay",
    href: "#danh-muc-yen-hu",
    bgColor: "#E2FCF3",
  },
  {
    title: "Yến Sào Tinh Chế",
    subtitle: "Nguyên tổ 100g • ISO & FDA",
    href: "#danh-muc-yen-tinh-che",
    bgColor: "#FAEFCA",
  },
];

export default async function MenuPage() {
  await syncDbFromCloud();
  const products = getAllProducts();
  const freshBowlProducts = products.filter((p) => !p.id.startsWith("cat-"));
  const zones = getServiceZones();
  const slots = getDeliverySlots();

  return (
    <div className="bg-[#FDFBF7] pb-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Thực đơn & Sản phẩm", path: "/yen-tuoi-chung-nong" },
        ]}
      />

      {/* 1. LANGFARM-STYLE FULL-BLEED ROUNDED HERO BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[400px] flex flex-col justify-end p-6 sm:p-10 md:p-12 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/banners/hero-slide-1-tho-su-v2.webp"
            alt="Thực Đơn Yến Tươi Chưng Nóng Thố Sứ 200ml & Sản Phẩm Yến Sào Hà Mi"
            width={1280}
            height={520}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0D231A]/95 via-[#0D231A]/55 to-black/15"
            aria-hidden="true"
          />

          {/* Top-right circular gold seal */}
          <div className="hidden sm:flex absolute top-6 right-6 w-20 h-20 rounded-full bg-[#1B4332]/90 border-2 border-[#D4AF37] flex-col items-center justify-center text-center p-2 shadow-md">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#F3D78A]">
              Chưng tươi
            </span>
            <span className="font-serif-display text-sm font-bold text-white leading-tight">
              35g Yến
            </span>
            <span className="text-[9px] text-[#F3D78A]">Giao 2H</span>
          </div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-xs border border-[#F3D78A]/45 px-3.5 py-1 text-xs font-semibold text-[#F3D78A]">
              Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất
            </span>
            <h1 className="font-serif-display text-2xl sm:text-4xl md:text-[42px] font-bold text-white leading-tight">
              Yến Tươi Chưng Nóng Đà Nẵng
            </h1>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed max-w-2xl">
              Mỗi thố yến 200ml chứa đến 35g yến tươi thật nguyên tổ, chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng tận tay trong 2 giờ tại Đà Nẵng.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/dat-hang"
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D78A] to-[#D4AF37] text-[#1B1B1B] font-bold text-xs sm:text-sm shadow-sm hover:brightness-105 transition"
              >
                Đặt Giao Nóng 2H - Từ 295.000đ →
              </Link>
              <a
                href="#khu-vuc-giao-2h"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/30 text-white font-semibold text-xs sm:text-sm hover:bg-white/25 transition"
              >
                Xem Khu Vực & Giờ Giao 2H
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 Ô NGANG SẢN PHẨM NỔI BẬT GỌN & SANG TRỌNG */}
      <section className="max-w-[1280px] mx-auto px-3 sm:px-6 md:px-8 pt-5">
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {QUICK_CATEGORIES.map((cat) => (
            <a
              key={cat.title}
              href={cat.href}
              className="group rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5E8] to-[#F3E9D2] border border-[#D4AF37]/45 hover:border-[#155132] p-2.5 sm:p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs flex flex-col justify-between text-center sm:text-left"
            >
              <h2 className="font-serif-display text-[11px] sm:text-base font-bold text-[#155132] leading-tight">
                {cat.title}
              </h2>
              <p className="hidden sm:block text-xs text-[#6E5628] mt-1">{cat.subtitle}</p>
            </a>
          ))}
        </div>
      </section>

      {/* 3. MAIN FRESH BOWL MENU */}
      <ProductMenuSection
        products={freshBowlProducts}
        title="Menu Yến Tươi Chưng Nóng (Thố Sứ 200ml • 35g Yến Tươi)"
        subtitle="Chưng thủ công tươi nóng ngay khi nhận đơn, giao ấm nóng trong 2 giờ (08:00 – 21:00). Đặt từ 2 thố được Miễn phí giao hàng trong bán kính 5km."
      />

      {/* 4. CATALOG PRODUCT LINES */}
      <CatalogProductLinesSection products={products} />

      {/* 5. ZONE & SLOT OVERVIEW IN LANGFARM SOFT PASTEL CARDS */}
      <section
        id="khu-vuc-giao-2h"
        className="max-w-[1280px] mx-auto px-4 md:px-8 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="rounded-3xl bg-[#FAF4EB] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#1B4332] font-serif-display text-xl sm:text-2xl font-bold">
            <span className="w-10 h-10 rounded-2xl bg-[#FFE9DD] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#7C4D2B]" aria-hidden="true" />
            </span>
            <h2>Khu vực phục vụ giao nóng 2H tại Đà Nẵng</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 leading-relaxed">
            Thố sứ 200ml giữ nhiệt giúp món yến đến tay vẫn ấm nóng trọn vị. Đặt từ 2 thố miễn phí giao hàng trong bán kính 5km:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {zones.map((z) => (
              <li
                key={z.id}
                className="p-3.5 rounded-2xl bg-white flex items-start justify-between gap-3 shadow-2xs"
              >
                <div>
                  <p className="font-bold text-[#1B4332]">{z.district}</p>
                  <p className="text-xs text-[#2B433A]/75 mt-0.5">{z.wardSample}</p>
                </div>
                <div className="text-right shrink-0">
                  {z.deliveryStatus === "SUPPORTED" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] bg-[#E2FCF3] px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {z.shippingFeeVnd === 0
                        ? "Miễn phí giao"
                        : `${z.shippingFeeVnd?.toLocaleString("vi-VN")}đ`}
                    </span>
                  )}
                  {z.deliveryStatus === "FEE_PENDING_CONFIRMATION" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C4D2B] bg-[#FAEFCA] px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      Báo phí khi xác nhận
                    </span>
                  )}
                  {z.deliveryStatus === "OUT_OF_ZONE" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 bg-red-50 px-3 py-1 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Ngoài vùng giao nóng
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-[#FAF4EB] p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-[#1B4332] font-serif-display text-xl sm:text-2xl font-bold">
            <span className="w-10 h-10 rounded-2xl bg-[#E2FCF3] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#1B4332]" aria-hidden="true" />
            </span>
            <h2>Khung giờ chưng nóng & giao ngay trong ngày</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 leading-relaxed">
            Mỗi thố yến được chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng trong vòng 2 giờ (08:00 – 21:00):
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {slots.map((s) => {
              const isFull = s.remainingBowls <= 0 || !s.isActive;
              return (
                <li
                  key={s.id}
                  className="p-3.5 rounded-2xl bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <p className="font-bold text-[#1B4332]">{s.label}</p>
                    <p className="text-xs text-[#2B433A]/75">
                      Thời gian chuẩn bị tối thiểu: {s.minLeadMinutes} phút
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isFull
                        ? "bg-red-50 text-red-800"
                        : "bg-[#E2FCF3] text-[#1B4332]"
                    }`}
                  >
                    {isFull
                      ? "Tạm đầy khung giờ"
                      : `Còn nhận ${s.remainingBowls}/${s.maxCapacityBowls} thố`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
