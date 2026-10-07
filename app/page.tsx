import React from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Flame,
  Gift,
  Utensils,
} from "lucide-react";
import {
  getAllPosts,
  getAllProducts,
  getSiteContentSettings,
  syncDbFromCloud,
} from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  {
    icon: Flame,
    title: "Chưng nóng & Chưng sẵn",
    desc: "Thố sứ 200ml chưng mới theo ca (08:00 – 21:00) và yến hũ tiệt trùng 75ml & 100ml.",
  },
  {
    icon: Utensils,
    title: "Chuẩn ISO 22000 & FDA",
    desc: "100% yến thật tự nhiên, nước lọc RO tinh khiết, không chất bảo quản.",
  },
  {
    icon: ClipboardCheck,
    title: "Đặt từ 2 thố Free Ship",
    desc: "Chỉ cần điền địa chỉ nhận, Hà Mi xác nhận và miễn phí giao từ 2 thố/set.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Hà Mi có những dòng sản phẩm yến sào nào?",
    a: "Hà Mi phục vụ 4 dòng chủ lực: Yến Tươi Chưng Nóng (thố sứ 200ml giao nóng theo khung giờ 08:00–21:00), Yến Hũ Chưng Sẵn Thượng Hạng (75ml & 100ml), Set Quà Tặng Hoa Sen Vàng (6 hũ) và Yến Sào Tinh Chế nguyên tổ 100g đạt chuẩn ISO 22000:2018 & FDA Hoa Kỳ.",
  },
  {
    q: "Khi tặng quà có ghi thiệp và ẩn giá được không?",
    a: "Có. Bạn tích chọn “Quà tặng” ngay tại trang đặt hàng để nhập riêng thông tin người nhận, lời chúc viết thiệp và ẩn giá trên phiếu giao.",
  },
  {
    q: "Chính sách giao hàng và Free Ship như thế nào?",
    a: "Khách chỉ cần nhập địa chỉ nhận và chọn khung giờ từ 08:00 sáng đến 21:00 đêm. Đơn từ 2 thố hoặc các Set Quà / Yến Tinh Chế được tự động Miễn phí giao hàng (Free Ship).",
  },
];

export default async function HomePage() {
  await syncDbFromCloud();
  const allProducts = getAllProducts();
  const freshBowlProducts = allProducts.filter((p) => !p.id.startsWith("cat-"));
  const siteSettings = getSiteContentSettings();
  const latestPosts = getAllPosts(true).slice(0, 3);

  return (
    <div>
      {/* 1. HERO FULL-BLEED: Thố yến chủ đạo, chữ tinh gọn trực tiếp trên nền sáng */}
      <section
        aria-label="Giới thiệu Yến Sào Hà Mi - Yến Tươi Chưng Nóng"
        data-testid="hero-section"
        className="relative w-full overflow-hidden border-b border-[#BD9342]/25 bg-[#FFFCF4]"
      >
        <picture className="block w-full">
          <source media="(min-width: 768px)" srcSet={siteSettings.heroDesktopImage} />
          <img
            src={siteSettings.heroMobileImage}
            alt="Thố Yến Tươi Chưng Nóng Yến Sào Hà Mi"
            fetchPriority="high"
            width={1640}
            height={680}
            className="w-full h-[460px] sm:h-[490px] md:h-[380px] lg:h-[520px] object-cover object-bottom md:object-[76%_center] lg:object-center"
          />
        </picture>

        <div className="absolute inset-x-0 top-0 md:inset-y-0 flex items-start md:items-center pointer-events-none">
          <div className="max-w-[1200px] w-full mx-auto px-4 md:pr-8 pt-3 sm:pt-4 md:py-4 lg:py-6">
            <div className="max-w-md md:max-w-[320px] lg:max-w-lg pointer-events-auto">
              <div className="mb-2 lg:mb-3">
                <p className="text-xs lg:text-sm font-semibold text-[#8A6632] uppercase tracking-wider">
                  {siteSettings.heroBadge}
                </p>
                <h1 className="mt-0.5 font-serif-display text-[28px] leading-[34px] sm:text-[34px] sm:leading-[40px] md:text-[34px] md:leading-[40px] lg:text-[46px] lg:leading-[52px] font-semibold text-[#155132]">
                  {siteSettings.heroTitle}
                </h1>
              </div>

              <p className="text-xs sm:text-sm lg:text-base text-[#2B433A] leading-snug lg:leading-relaxed mb-3 lg:mb-5 max-w-[300px] sm:max-w-sm lg:max-w-md">
                {siteSettings.heroLead}
              </p>

              <a
                href="#menu-chu-luc"
                data-testid="hero-cta-choose-dish"
                className="inline-flex items-center justify-center gap-2 min-h-[42px] sm:min-h-[44px] px-5 py-2 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] font-semibold text-xs sm:text-sm lg:text-base shadow-xs hover:bg-[#0e3b23] transition-colors"
              >
                <span>{siteSettings.heroCta}</span>
                <ArrowDown className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MENU CHỦ LỰC: YẾN TƯƠI CHƯNG NÓNG (THỐ SỨ 200ML) */}
      <ProductMenuSection products={freshBowlProducts} />

      {/* 2B. CÁC DÒNG SẢN PHẨM HÀ MI: SET QUÀ YẾN SÀO, YẾN HŨ 75ML & 100ML, YẾN SÀO TINH CHẾ */}
      <CatalogProductLinesSection products={allProducts} />

      {/* 3. BA Ý NGẮN (Unframed) */}
      <section
        aria-label="Điểm cốt lõi Yến Sào Hà Mi"
        className="border-y border-[#BD9342]/25 bg-[#FFFCF4]/60 py-8 md:py-10"
      >
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3">
                <Icon
                  className="w-5 h-5 text-[#155132] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-serif-display text-lg font-semibold text-[#155132]">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#2B433A]/85 mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
                <span>Chọn quà biếu</span>
                <ArrowRight className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4B. CẨM NANG & BÀI VIẾT MỚI TỪ TRANG QUẢN TRỊ */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="blog-home-heading"
          className="py-6 md:py-10 px-4 max-w-[1200px] mx-auto"
        >
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A6632]">
                Cẩm nang dinh dưỡng & quà biếu
              </p>
              <h2
                id="blog-home-heading"
                className="font-serif-display text-xl sm:text-2xl font-semibold text-[#155132]"
              >
                Bài viết mới từ Yến Sào Hà Mi
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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
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
                    alt={post.title}
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
