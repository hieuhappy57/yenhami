import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Heart, Sparkles } from "lucide-react";
import { getAllProducts } from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Set Quà Biếu Yến Sào Thượng Hạng & Thiệp Viết Tay",
  description:
    "Gửi trao Set Quà Yến Sào Thượng Hạng 6 vị, Thố Yến Tươi Chưng Nóng và Yến Sào Tinh Chế cao cấp kèm thiệp viết tay và tùy chọn ẩn giá trên phiếu giao tại Đà Nẵng.",
  path: "/gui-qua",
  image: "/brand/catalog/set-qua-hop-sen-en.jpg",
});

const GIFT_PRIVILEGES = [
  {
    title: "Hộp Quà Hoa Sen & Đàn Én",
    desc: "Thiết kế ép kim trang nhã, sang trọng khi trao tặng ông bà, cha mẹ và đối tác.",
    bgColor: "#FFE9DD",
  },
  {
    title: "Thiệp Nhắn Gửi Viết Tay",
    desc: "Chuẩn bị riêng tấm thiệp ghi lời chúc chân thành từ người gửi đến người thương.",
    bgColor: "#F5E2F9",
  },
  {
    title: "Ẩn Giá Trên Phiếu Giao",
    desc: "Mặc định che toàn bộ giá tiền trên phiếu giao quà để món quà trọn vẹn sự tinh tế.",
    bgColor: "#E2FCF3",
  },
  {
    title: "Miễn Phí Giao Quà Tận Nơi",
    desc: "Miễn phí giao hàng cho Set Quà và đơn từ 2 thố yến tươi chưng nóng trong 5km.",
    bgColor: "#FAEFCA",
  },
];

export default function GuiQuaPage() {
  const products = getAllProducts();
  const freshBowlProducts = products.filter((p) => !p.id.startsWith("cat-"));

  return (
    <div className="bg-[#FDFBF7] pb-12 space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Set quà biếu sức khỏe", path: "/gui-qua" },
        ]}
      />

      {/* 1. LANGFARM-STYLE FULL-BLEED GIFT HERO BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10 md:p-12 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/banners/hero-slide-2-set-qua-sen-vang-v3.webp"
            alt="Set Quà Yến Sào Thượng Hạng Hoa Sen & Đàn Én Hà Mi"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0D231A]/95 via-[#0D231A]/55 to-black/15"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-xs border border-[#F3D78A]/45 px-3.5 py-1 text-xs font-semibold text-[#F3D78A]">
              <Gift className="w-3.5 h-3.5 text-[#F3D78A]" />
              Món quà của sự an tâm • Chạm đến sự bình yên
            </span>
            <h1 className="font-serif-display text-2xl sm:text-4xl md:text-[42px] font-bold text-white leading-tight">
              Set Quà Yến Sào Thượng Hạng & Thố Yến Biếu Tặng
            </h1>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed max-w-2xl">
              Từ bộ hộp quà Hoa Sen & Đàn Én 6 hũ Yến Sào Thượng Hạng, hộp Yến Sào Tinh Chế xuất khẩu đến từng thố sứ chưng nóng giữ ấm — Hà Mi chuẩn bị riêng thiệp viết tay và hỗ trợ ẩn giá trên phiếu giao.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/dat-hang?gift=1"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D78A] to-[#D4AF37] text-[#1B1B1B] text-xs sm:text-sm font-bold shadow-sm hover:brightness-105 transition"
              >
                <Sparkles className="w-4 h-4 text-[#1B4332]" />
                <span>Tạo đơn Quà Tặng kèm Thiệp →</span>
              </Link>
              <a
                href="#danh-muc-set-qua"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/35 text-xs sm:text-sm font-semibold text-white hover:bg-white/25 transition"
              >
                <Heart className="w-4 h-4 text-[#F3D78A]" />
                <span>Khám phá Bộ Sưu Tập Quà</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 4 LANGFARM PASTEL PRIVILEGE TILES */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GIFT_PRIVILEGES.map((item) => (
            <div
              key={item.title}
              style={{ backgroundColor: item.bgColor }}
              className="rounded-3xl p-5 sm:p-6 space-y-1.5"
            >
              <h2 className="font-serif-display text-base sm:text-lg font-bold text-[#1B1B1B]">
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4A4A] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CATALOG GIFT SETS & PRODUCT LINES */}
      <CatalogProductLinesSection products={products} />

      {/* 4. FRESH STEAMED BOWLS FOR GIFTING */}
      <ProductMenuSection
        products={freshBowlProducts}
        title="Chọn Thố Yến Tươi Chưng Nóng Gửi Tặng Người Thân"
        subtitle="Bấm dấu (+) trên từng món rồi tích chọn 'Quà tặng' ở bước đặt hàng để ghi thiệp viết tay và ẩn giá trên phiếu giao."
        showGiftQuickSwitch={true}
      />
    </div>
  );
}
