import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Heart, CheckCircle2, Sparkles } from "lucide-react";
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

export default function GuiQuaPage() {
  const products = getAllProducts();
  const freshBowlProducts = products.filter((p) => !p.id.startsWith("cat-"));

  return (
    <div className="space-y-8 pb-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Set quà biếu sức khỏe", path: "/gui-qua" },
        ]}
      />
      <section className="bg-[#FFFCF4] border-b border-[#BD9342]/35 py-10 md:py-14 px-4">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#BD9342]/50 px-3 py-1 text-xs font-semibold text-[#8A6632]">
              <Gift className="w-3.5 h-3.5 text-[#BD9342]" />
              Món quà của sự an tâm, chạm đến sự bình yên
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#155132]">
              Set Quà Yến Sào Thượng Hạng & Thố Yến Biếu Tặng
            </h1>
            <p className="text-sm sm:text-base text-[#2B433A]/90 leading-relaxed max-w-2xl">
              Từ bộ hộp quà Hoa Sen & Đàn Én 6 hũ Yến Sào Thượng Hạng, hộp Yến Sào Tinh Chế xuất khẩu đến từng thố sứ chưng nóng giữ ấm — Hà Mi chuẩn bị riêng thiệp viết tay và hỗ trợ ẩn giá trên phiếu giao.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm text-[#2B433A]">
              <li className="flex items-center gap-2 bg-white border border-[#155132]/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#155132] shrink-0" />
                <span>Hộp quà Hoa Sen & Đàn Én ép kim sang trọng</span>
              </li>
              <li className="flex items-center gap-2 bg-white border border-[#155132]/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#155132] shrink-0" />
                <span>Thiệp nhắn gửi viết tay theo yêu cầu</span>
              </li>
              <li className="flex items-center gap-2 bg-white border border-[#155132]/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#155132] shrink-0" />
                <span>Mặc định ẩn giá trên phiếu giao quà</span>
              </li>
              <li className="flex items-center gap-2 bg-white border border-[#155132]/15 px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-[#155132] shrink-0" />
                <span>Miễn phí giao hàng cho Set Quà & đơn từ 2 thố</span>
              </li>
            </ul>

            <div className="pt-3 flex flex-wrap gap-3">
              <Link
                href="/dat-hang?gift=1"
                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-[#155132] border border-[#BD9342] text-sm font-bold text-[#FFFCF4] hover:bg-[#0e3b23]"
              >
                <Sparkles className="w-4 h-4 text-[#BD9342]" />
                <span>Bắt đầu tạo đơn quà tặng</span>
              </Link>
              <a
                href="#danh-muc-set-qua"
                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl bg-white border border-[#155132]/30 text-sm font-semibold text-[#155132] hover:bg-[#FFFCF4]"
              >
                <Heart className="w-4 h-4 text-[#8A6632]" />
                <span>Xem Set Quà bên dưới</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#BD9342]/45 bg-white shadow-xs">
              <img
                src="/brand/catalog/set-qua-6-hu-6-vi.jpg"
                alt="Set Quà 6 Hũ Yến Sào Thượng Hạng 6 Vị Hà Mi"
                width={640}
                height={480}
                className="w-full h-auto object-cover"
              />
              <span className="absolute top-3 left-3 bg-white/95 text-[#155132] border border-[#BD9342]/45 text-xs font-semibold px-2.5 py-1 rounded">
                Ảnh thực tế Set Quà 6 Vị Hà Mi
              </span>
            </div>
          </div>
        </div>
      </section>

      <CatalogProductLinesSection products={products} />

      <ProductMenuSection
        products={freshBowlProducts}
        title="Chọn Thố Yến Tươi Chưng Nóng Gửi Tặng"
        subtitle="Bấm dấu (+) trên từng món rồi tích chọn 'Quà tặng' ở bước đặt hàng để ghi thiệp và ẩn giá."
        showGiftQuickSwitch={true}
      />
    </div>
  );
}
