import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Gift,
  Leaf,
} from "lucide-react";
import {
  getAllPosts,
  getAllProducts,
  getSiteContentSettings,
  syncDbFromCloud,
} from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";
import { FaqJsonLd } from "@/components/SeoJsonLd";

export const dynamic = "force-dynamic";

const CORE_DIFFERENTIATORS = [
  {
    title: "Giao Nóng 2H",
    desc: "Ấm thơm tận tay tại Đà Nẵng",
  },
  {
    title: "35g Yến Việt Nguyên Tổ",
    desc: "Sợi dài, nhặt sạch bằng nước RO",
  },
  {
    title: "Đường Phèn & Thảo Mộc",
    desc: "Vị ngọt thanh tao, dễ hấp thu",
  },
  {
    title: "Không Chất Bảo Quản",
    desc: "100% tinh khiết, chưng tươi mỗi đơn",
  },
];

const FAQ_ITEMS = [
  {
    q: "Một thố Yến Tươi Chưng Nóng Hà Mi 200ml có định lượng và giá bao nhiêu?",
    a: "Mỗi thố yến sứ 200ml chứa đến 35g yến tươi thật nguyên tổ, chưng thủ công tươi nóng ngay khi nhận đơn cùng đường phèn tự nhiên và thảo mộc chọn lọc. Giá chỉ từ 295.000đ / 1 thố, giao ấm nóng tận tay trong 2 giờ nội thành Đà Nẵng.",
  },
  {
    q: "Khi biếu tặng người bệnh, mẹ bầu hoặc ông bà có ghi thiệp và ẩn giá được không?",
    a: "Có. Bạn tích chọn “Quà tặng” ngay tại trang đặt hàng để nhập riêng thông tin người nhận, lời chúc viết thiệp tay trang trọng và ẩn giá trên phiếu giao hàng.",
  },
  {
    q: "Chính sách giao nóng 2H và Miễn phí giao hàng (Free Ship) như thế nào?",
    a: "Hà Mi chưng tươi thủ công ngay khi xác nhận đơn và giao ấm nóng trong 2 giờ (khung giờ phục vụ 08:00 – 21:00 hàng ngày). Đơn từ 2 thố hoặc các Set Quà / Yến Tinh Chế được tự động Miễn phí giao hàng.",
  },
];

export default async function HomePage() {
  await syncDbFromCloud();
  const allProducts = getAllProducts();
  const freshBowlProducts = allProducts.filter((p) => !p.id.startsWith("cat-"));
  const siteSettings = getSiteContentSettings();
  const latestPosts = getAllPosts(true).slice(0, 4);

  return (
    <div>
      <FaqJsonLd items={FAQ_ITEMS} />

      {/* 1. HERO FULL-BLEED: Tinh gọn, sang trọng, tôn vinh hình ảnh thố yến */}
      <section
        aria-label="Giới thiệu Yến Sào Hà Mi - Yến Tươi Chưng Nóng Giao Ngay 2H"
        data-testid="hero-section"
        className="relative w-full overflow-hidden border-b border-[#BD9342]/20 bg-[#FFFCF4]"
      >
        <picture className="block w-full">
          <source media="(min-width: 768px)" srcSet={siteSettings.heroDesktopImage} />
          <img
            src={siteSettings.heroMobileImage}
            alt="Thố Yến Tươi Chưng Nóng 200ml Giao Ngay 2H Tại Đà Nẵng - Yến Sào Hà Mi"
            fetchPriority="high"
            width={1640}
            height={680}
            className="w-full h-[470px] sm:h-[500px] md:h-[440px] lg:h-[540px] object-cover object-bottom md:object-[76%_center] lg:object-center"
          />
        </picture>

        <div className="absolute inset-x-0 top-0 md:inset-y-0 flex items-start md:items-center pointer-events-none">
          <div className="max-w-[1200px] w-full mx-auto px-4 md:pr-8 pt-3 sm:pt-4 md:py-6">
            <div className="max-w-[340px] sm:max-w-md md:max-w-[430px] lg:max-w-[490px] pointer-events-auto md:bg-[#FFFCF4]/86 md:backdrop-blur-xs md:p-5 lg:p-6 md:rounded-2xl md:border md:border-[#BD9342]/30 md:shadow-xs">
              <p className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-[#8A6632] uppercase tracking-wider">
                <Leaf className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#155132]" aria-hidden="true" />
                <span>Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất</span>
              </p>

              <h1 className="mt-0.5 sm:mt-1 font-serif-display text-[22px] leading-[27px] sm:text-[26px] sm:leading-[33px] lg:text-[36px] lg:leading-[44px] font-semibold text-[#155132] [text-wrap:balance]">
                Yến Tươi Chưng Nóng Thố Sứ — Giao Ngay 2H
                <span className="sr-only"> Tại Đà Nẵng</span>
              </h1>

              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-[#2B433A]/90 leading-snug sm:leading-relaxed mb-2.5 sm:mb-4">
                <span className="sm:hidden">
                  35g yến tươi nguyên tổ trong thố sứ 200ml • Quà bồi bổ mẹ bầu, người bệnh & ông bà.
                </span>
                <span className="hidden sm:inline">
                  35g yến tươi thật trong thố sứ 200ml, chưng thủ công tươi nóng ngay khi nhận đơn. Món quà ấm lòng cho mẹ bầu, người bệnh & ông bà.
                </span>
              </p>

              <div className="flex items-center gap-2">
                <a
                  href="#menu-chu-luc"
                  data-testid="hero-cta-choose-dish"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#155132] text-[#FFFCF4] border border-[#BD9342] font-semibold text-xs sm:text-sm shadow-xs hover:bg-[#0e3b23] transition-colors"
                >
                  <span>Đặt Giao Nóng • Từ 295k</span>
                  <ArrowDown className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
                </a>

                <Link
                  href="/gui-qua"
                  data-testid="hero-cta-secondary"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[38px] sm:min-h-[44px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/95 text-[#155132] border border-[#155132]/25 font-semibold text-xs sm:text-sm hover:bg-[#FFFCF4] hover:border-[#BD9342] transition-colors"
                >
                  <Gift className="w-3.5 h-3.5 text-[#8A6632]" aria-hidden="true" />
                  <span>Quà Biếu</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. THANH 4 ĐIỂM KHÁC BIỆT CỐT LÕI (Gọn gàng 2x2 trên Mobile, 4 cột ngang trên Desktop) */}
      <section
        aria-label="4 Điểm Khác Biệt Cốt Lõi Yến Sào Hà Mi"
        className="border-b border-[#BD9342]/20 bg-[#FFFCF4] py-3 sm:py-4 md:py-5"
      >
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
            {CORE_DIFFERENTIATORS.map((item) => (
              <div
                key={item.title}
                className="flex items-center sm:items-start gap-2 sm:gap-2.5 rounded-xl bg-white border border-[#155132]/12 px-2.5 py-2 sm:p-3.5 shadow-2xs"
              >
                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#155132]/10 text-[#155132] border border-[#BD9342]/35 shrink-0 sm:mt-0.5">
                  <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-[#155132]" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-serif-display text-xs sm:text-base font-semibold text-[#155132] leading-tight truncate sm:whitespace-normal">
                    {item.title}
                  </h2>
                  <p className="hidden sm:block text-xs text-[#2B433A]/80 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MENU CHỦ LỰC: YẾN TƯƠI CHƯNG NÓNG (THỐ SỨ 200ML) */}
      <ProductMenuSection products={freshBowlProducts} />

      {/* 3. CÁC DÒNG SẢN PHẨM HÀ MI: SET QUÀ YẾN SÀO, YẾN HŨ 75ML & 100ML, YẾN SÀO TINH CHẾ */}
      <CatalogProductLinesSection products={allProducts} />

      {/* 4. CẨM NANG & BÀI VIẾT CHUYÊN SÂU SEO/GEO (Tạp chí tinh gọn 2 cột Mobile / 4 cột Desktop) */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="blog-home-heading"
          className="py-6 md:py-10 px-3 sm:px-4 max-w-[1200px] mx-auto border-t border-[#BD9342]/20"
        >
          <div className="flex flex-wrap items-end justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
                Cẩm nang sức khỏe & dinh dưỡng
              </p>
              <h2
                id="blog-home-heading"
                className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#155132] [text-wrap:balance]"
              >
                Góc Chia Sẻ Cùng Hà Mi
              </h2>
            </div>
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#155132] hover:text-[#8A6632] transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#155132]/15 bg-white shadow-2xs transition hover:border-[#BD9342] hover:shadow-md"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#F5F0E3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#8A6632]">
                      {post.category}
                    </span>
                    <h3 className="mt-0.5 font-serif-display text-[13px] sm:text-base font-semibold text-[#155132] group-hover:text-[#8A6632] line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                  </div>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#155132]">
                    Đọc tiếp →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. FAQ 3 CÂU NGẮN (Đóng mặc định) */}
      <section
        aria-labelledby="faq-heading"
        className="py-6 md:py-10 px-3 sm:px-4 max-w-[1200px] mx-auto border-t border-[#BD9342]/20"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            id="faq-heading"
            className="font-serif-display text-xl sm:text-2xl font-semibold text-[#155132] mb-3.5 text-center"
          >
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-xl bg-[#FFFCF4] border border-[#BD9342]/30 px-4 py-2.5 open:bg-white transition-colors"
              >
                <summary className="min-h-[36px] font-medium text-xs sm:text-sm text-[#155132] cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-[#8A6632] text-base font-bold group-open:rotate-45 transition-transform shrink-0"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2 text-xs sm:text-sm text-[#2B433A]/85 leading-relaxed pt-2 border-t border-[#155132]/10">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
