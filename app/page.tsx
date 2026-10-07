import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Gift,
  Heart,
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
    title: "Giao trong 2H",
    desc: "Nhận đến tay thố yến ấm thơm, sẵn sàng thưởng thức ngay.",
  },
  {
    title: "Yến Việt Nam nguyên tổ",
    desc: "Sợi yến dài, dày, được nhặt sạch hoàn toàn bằng nước lọc RO tinh khiết.",
  },
  {
    title: "Chưng cùng đường phèn tự nhiên & dược liệu chọn lọc",
    desc: "Cân đối vị ngọt thanh tao, dễ dùng, dễ hấp thu.",
  },
  {
    title: "Không hương liệu – không chất bảo quản",
    desc: "Chỉ có sự tinh khiết và tâm huyết trong từng thố yến.",
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
      {/* 1. HERO FULL-BLEED: Thố yến chủ đạo, chữ tinh gọn trực tiếp trên nền sáng */}
      <section
        aria-label="Giới thiệu Yến Sào Hà Mi - Yến Tươi Chưng Nóng Giao Ngay 2H"
        data-testid="hero-section"
        className="relative w-full overflow-hidden border-b border-[#BD9342]/25 bg-[#FFFCF4]"
      >
        <picture className="block w-full">
          <source media="(min-width: 768px)" srcSet={siteSettings.heroDesktopImage} />
          <img
            src={siteSettings.heroMobileImage}
            alt="Thố Yến Tươi Chưng Nóng 200ml Giao Ngay 2H Tại Đà Nẵng - Yến Sào Hà Mi"
            fetchPriority="high"
            width={1640}
            height={680}
            className="w-full h-[520px] sm:h-[540px] md:h-[430px] lg:h-[560px] object-cover object-bottom md:object-[76%_center] lg:object-center"
          />
        </picture>

        <div className="absolute inset-x-0 top-0 md:inset-y-0 flex items-start md:items-center pointer-events-none">
          <div className="max-w-[1200px] w-full mx-auto px-4 md:pr-8 pt-3 sm:pt-4 md:py-4 lg:py-6">
            <div className="max-w-lg md:max-w-[420px] lg:max-w-xl pointer-events-auto bg-[#FFFCF4]/88 md:bg-[#FFFCF4]/82 backdrop-blur-xs p-3.5 sm:p-4 md:p-5 rounded-2xl border border-[#BD9342]/30 shadow-xs">
              <div className="mb-2 lg:mb-3">
                <p className="inline-flex items-center gap-1.5 text-xs lg:text-sm font-bold text-[#8A6632] uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 text-[#155132]" aria-hidden="true" />
                  <span>{siteSettings.heroBadge}</span>
                </p>
                <h1 className="mt-1 font-serif-display text-[22px] leading-[28px] sm:text-[28px] sm:leading-[34px] md:text-[28px] md:leading-[34px] lg:text-[38px] lg:leading-[44px] font-semibold text-[#155132]">
                  {siteSettings.heroTitle}
                </h1>
              </div>

              <p className="text-xs sm:text-sm lg:text-[15px] text-[#2B433A] leading-snug lg:leading-relaxed mb-3.5 lg:mb-5">
                {siteSettings.heroLead}
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href="#menu-chu-luc"
                  data-testid="hero-cta-choose-dish"
                  className="inline-flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[44px] px-4 sm:px-5 py-2 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] font-semibold text-xs sm:text-sm shadow-xs hover:bg-[#0e3b23] transition-colors"
                >
                  <span>{siteSettings.heroCta}</span>
                  <ArrowDown className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
                </a>

                <Link
                  href="/yen-tuoi-chung-nong"
                  data-testid="hero-cta-secondary"
                  className="inline-flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[44px] px-4 py-2 rounded-md bg-white/95 text-[#155132] border border-[#155132]/30 font-semibold text-xs sm:text-sm hover:bg-[#FFFCF4] hover:border-[#BD9342] transition-colors"
                >
                  <span>Xem Menu Thảo Mộc Thượng Hạng</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A6632]" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1B. CAM KẾT ĐỊNH LƯỢNG 35G YẾN TƯƠI & 4 ĐIỂM KHÁC BIỆT CỐT LÕI */}
      <section
        aria-label="4 Điểm Khác Biệt Cốt Lõi Yến Sào Hà Mi"
        className="border-b border-[#BD9342]/25 bg-[#FFFCF4]/80 py-6 md:py-9"
      >
        <div className="max-w-[1200px] mx-auto px-4 space-y-6">
          {/* Commitment Banner */}
          <div className="rounded-2xl bg-white border border-[#BD9342]/40 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A6632]">
                <Heart className="w-3.5 h-3.5 text-[#155132] fill-[#155132]" aria-hidden="true" />
                <span>Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất • Giá chỉ từ 295.000đ / 1 thố</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-[#155132]">
                Mỗi thố yến 200ml chứa đến 35g yến tươi thật, gói trọn hương vị tự nhiên và giá trị dinh dưỡng nguyên vẹn.
              </p>
              <p className="text-xs sm:text-sm text-[#2B433A]/90">
                Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!
              </p>
            </div>
            <a
              href="#menu-chu-luc"
              className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-lg bg-[#155132] text-[#FFFCF4] border border-[#BD9342] text-xs font-bold hover:bg-[#0e3b23] transition-colors"
            >
              <span>Chọn vị chưng nóng</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#BD9342]" aria-hidden="true" />
            </a>
          </div>

          {/* 4 Điểm Khác Biệt Cốt Lõi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CORE_DIFFERENTIATORS.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-xl bg-white border border-[#155132]/15 p-4 shadow-2xs"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#155132]/10 text-[#155132] border border-[#BD9342]/40 shrink-0 mt-0.5">
                  <Leaf className="w-4 h-4 text-[#155132]" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-serif-display text-base font-semibold text-[#155132] leading-snug">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#2B433A]/85 mt-1 leading-relaxed">
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

      {/* 2B. CÁC DÒNG SẢN PHẨM HÀ MI: SET QUÀ YẾN SÀO, YẾN HŨ 75ML & 100ML, YẾN SÀO TINH CHẾ */}
      <CatalogProductLinesSection products={allProducts} />

      {/* 4. MỘT MỤC GỬI QUÀ GỌN */}
      <section
        aria-labelledby="gifting-heading"
        className="py-8 md:py-12 px-4 max-w-[1200px] mx-auto"
      >
        <div className="rounded-lg bg-[#FFFCF4] border border-[#BD9342]/35 overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-5 h-[220px] sm:h-[260px]">
            <img
              src={siteSettings.giftingImage}
              alt="Hộp quà Yến Sào Thượng Hạng Hà Mi"
              loading="lazy"
              width={560}
              height={360}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="md:col-span-7 p-5 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
              <Gift className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
              <span>{siteSettings.giftingBadge}</span>
            </div>
            <h2
              id="gifting-heading"
              className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#155132]"
            >
              {siteSettings.giftingTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#2B433A]/90 leading-relaxed max-w-xl">
              {siteSettings.giftingDescription}
            </p>
            <div className="pt-1">
              <Link
                href="/gui-qua"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] font-semibold text-sm hover:bg-[#0e3b23] transition-colors"
              >
                <span>Chọn quà biếu sức khỏe</span>
                <ArrowRight className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4B. CẨM NANG & BÀI VIẾT CHUYÊN SÂU SEO/GEO */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="blog-home-heading"
          className="py-6 md:py-10 px-4 max-w-[1200px] mx-auto"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
                Cẩm nang dinh dưỡng & quà biếu sức khỏe
              </p>
              <h2
                id="blog-home-heading"
                className="font-serif-display text-xl sm:text-2xl font-semibold text-[#155132]"
              >
                Bài viết chuyên sâu từ Yến Sào Hà Mi
              </h2>
            </div>
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1.5 min-h-[36px] text-xs font-bold text-[#155132] hover:text-[#8A6632] transition-colors"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#155132]/15 bg-white shadow-2xs transition hover:border-[#BD9342] hover:shadow-md"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#F5F0E3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#8A6632]">
                      {post.category}
                    </span>
                    <h3 className="mt-1 font-serif-display text-base font-semibold text-[#155132] group-hover:text-[#8A6632] line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#2B433A]/80 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#155132]">
                    <BookOpen className="h-3.5 w-3.5 text-[#BD9342]" aria-hidden="true" />
                    Đọc bài viết →
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
        className="py-6 md:py-10 px-4 max-w-[1200px] mx-auto"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            id="faq-heading"
            className="font-serif-display text-xl sm:text-2xl font-semibold text-[#155132] mb-4"
          >
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-lg bg-[#FFFCF4] border border-[#BD9342]/30 px-4 py-3 open:bg-white transition-colors"
              >
                <summary className="min-h-[36px] font-medium text-sm sm:text-base text-[#155132] cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-[#8A6632] text-base font-bold group-open:rotate-45 transition-transform"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed pt-2.5 border-t border-[#155132]/10">
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
