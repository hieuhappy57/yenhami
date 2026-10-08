import React from "react";
import Link from "next/link";
import { ArrowRight, CookingPot, Leaf, Truck } from "lucide-react";
import {
  getAllPosts,
  getAllProducts,
  syncDbFromCloud,
} from "@/db";
import { LangfarmHeroCarousel } from "@/components/LangfarmHeroCarousel";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";
import { FaqJsonLd } from "@/components/SeoJsonLd";

export const dynamic = "force-dynamic";

const FEATURED_CATEGORIES = [
  {
    title: "Yến Tươi Chưng Nóng",
    subtitle: "Thố sứ 200ml • Giao 2H",
    badge: "Từ 295k",
    href: "/yen-tuoi-chung-nong",
    image: "/brand/dishes/tu-quy-an-nhien-v2.webp",
  },
  {
    title: "Set Quà Thượng Hạng",
    subtitle: "Hộp Hoa Sen & Đàn Én",
    badge: "Quà biếu",
    href: "/gui-qua",
    image: "/brand/catalog/set-qua-hop-sen-en.jpg",
  },
  {
    title: "Yến Hũ Chưng Sẵn",
    subtitle: "Hũ 75ml & 100ml tiện lợi",
    badge: "Từ 40k",
    href: "#danh-muc-yen-hu",
    image: "/brand/catalog/hu-75ml-duong-phen-v2.webp",
  },
  {
    title: "Yến Sào Tinh Chế",
    subtitle: "Nguyên tổ 100g • ISO/FDA",
    badge: "Thượng hạng",
    href: "#danh-muc-yen-tinh-che",
    image: "/brand/catalog/yen-tinh-che-to-yen.jpg",
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
  const latestPosts = getAllPosts(true).slice(0, 4);

  return (
    <div className="bg-white">
      <FaqJsonLd items={FAQ_ITEMS} />

      {/* 1. LANGFARM-STYLE FULL-BLEED HERO CAROUSEL */}
      <LangfarmHeroCarousel />

      {/* 2. SẢN PHẨM NỔI BẬT (4 Ô Ngang Gọn Gàng & Sang Trọng trên cả Mobile & Desktop) */}
      <section
        aria-label="Sản phẩm nổi bật Yến Sào Hà Mi"
        className="py-6 sm:py-10 md:py-12 bg-gradient-to-b from-[#FAF6EE] to-white border-b border-[#E8DEC8]/60"
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-4 sm:mb-7">
            <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9A7432] mb-1">
              Tinh Hoa Dưỡng Chất Tự Nhiên
            </span>
            <h2 className="font-serif-display text-xl sm:text-3xl lg:text-4xl font-bold text-[#155132]">
              Sản phẩm nổi bật
            </h2>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
            {FEATURED_CATEGORIES.map((cat) => (
              <a
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col lg:flex-row items-center text-center lg:text-left rounded-2xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF5E8] to-[#F3E9D2] border border-[#D4AF37]/45 hover:border-[#155132] p-2 sm:p-3.5 lg:px-4 lg:py-3.5 gap-1.5 sm:gap-3 lg:gap-4 shadow-[0_4px_14px_rgba(21,81,50,0.06)] hover:shadow-[0_10px_24px_rgba(21,81,50,0.12)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                {/* Gold-rimmed circular studio image */}
                <div className="w-14 h-14 sm:w-20 sm:h-20 lg:w-[76px] lg:h-[76px] shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-[#B8892D] via-[#F5DF98] to-[#C89B3C] shadow-xs">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      loading="lazy"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-108"
                    />
                  </div>
                </div>

                {/* Text content */}
                <div className="min-w-0 flex-1 flex flex-col items-center lg:items-start">
                  <span className="hidden sm:inline-block rounded-full bg-[#155132]/10 border border-[#D4AF37]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#155132] mb-1">
                    {cat.badge}
                  </span>
                  <p className="font-serif-display text-[11px] sm:text-sm lg:text-base font-bold text-[#155132] group-hover:text-[#0E3B23] leading-tight line-clamp-2">
                    {cat.title}
                  </p>
                  <p className="hidden sm:block text-[11px] lg:text-xs text-[#6E5628] mt-0.5 truncate max-w-full">
                    {cat.subtitle}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SẢN PHẨM CHỦ LỰC: YẾN TƯƠI CHƯNG NÓNG (THỐ SỨ 200ML) */}
      <ProductMenuSection
        products={freshBowlProducts}
        title="Yến tươi chưng nóng nổi bật"
      />

      {/* 4. CÁC DÒNG SẢN PHẨM ĐẶC SẢN HÀ MI (Banner + Lưới sản phẩm không viền) */}
      <CatalogProductLinesSection products={allProducts} />

      {/* 5. TỪ BẾP HÀ MI: ẢNH NỀN CHÌM TÔNG KEM SÁNG & THÔNG ĐIỆP NỔI BẬT ĐỒNG BỘ MÀU WEB */}
      <section
        id="tu-bep-ha-mi"
        aria-labelledby="craft-heading"
        data-testid="brand-commitment"
        className="mt-10 md:mt-16 max-w-[1440px] mx-auto px-4 lg:px-8"
      >
        <div className="relative overflow-hidden rounded-3xl min-h-[500px] sm:min-h-[520px] md:min-h-[460px] flex items-end md:items-center bg-[#FAF6EE] border border-[#D4AF37]/45 shadow-[0_8px_30px_rgba(21,81,50,0.07)]">
          {/* Recessed Background Image (Ảnh làm nền chìm phía sau) */}
          <img
            src="/brand/ha-mi-craft-real.webp"
            alt="Đôi tay nâng thố yến Hà Mi trong bộ ảnh sản phẩm thực tế"
            width={1000}
            height={1500}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover object-[50%_34%] md:object-[75%_40%]"
          />

          {/* Warm Ivory/Cream Veil so the photo sits softly behind and matches the site's light cream & green-gold palette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-[#FAF6EE]/80 via-[#FAF6EE]/72 to-[#FAF6EE]/95 md:bg-gradient-to-r md:from-[#FAF6EE]/95 md:via-[#FAF6EE]/82 md:to-[#FAF6EE]/25"
          />

          {/* Foreground Content & Highlighted Message Cards over the image */}
          <div className="relative z-10 w-full p-5 sm:p-8 md:p-12 lg:p-14">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#D4AF37]/55 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A6632] shadow-2xs">
                Từ bếp Hà Mi • Chuẩn vị thủ công
              </span>

              <h2
                id="craft-heading"
                className="mt-3 font-serif-display text-2xl sm:text-4xl lg:text-[42px] font-bold leading-[1.2] text-[#155132]"
              >
                Chưng tươi mỗi ngày.{" "}
                <span className="text-[#9A6F22]">Trao gửi tận tâm.</span>
              </h2>

              <p className="mt-2.5 max-w-lg text-sm sm:text-base font-medium leading-relaxed text-[#2B433A]">
                Một thố yến ấm, một lời quan tâm chân thành dành cho người thương.
              </p>
            </div>

            {/* 3 Highlighted Message Cards in Warm Pearl White + Canopy Green + Gold */}
            <ul className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <li className="flex items-start gap-3.5 rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-[#D4AF37]/45 p-3.5 sm:p-4 shadow-[0_6px_18px_rgba(21,81,50,0.08)] transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#155132] text-[#F9E498] border border-[#D4AF37]/50 shadow-2xs">
                  <Truck className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-display text-sm sm:text-base font-bold text-[#155132]">
                    Giao nóng tại Đà Nẵng
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-snug text-[#2B433A]/85">
                    Trong 2 giờ · Miễn phí giao từ 2 thố
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-[#D4AF37]/45 p-3.5 sm:p-4 shadow-[0_6px_18px_rgba(21,81,50,0.08)] transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#155132] text-[#F9E498] border border-[#D4AF37]/50 shadow-2xs">
                  <CookingPot className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-display text-sm sm:text-base font-bold text-[#155132]">
                    Thố sứ 200ml
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-snug text-[#2B433A]/85">
                    35g yến tươi · Chưng theo yêu cầu
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5 rounded-2xl bg-white/92 hover:bg-white backdrop-blur-md border border-[#D4AF37]/45 p-3.5 sm:p-4 shadow-[0_6px_18px_rgba(21,81,50,0.08)] transition-all">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#155132] text-[#F9E498] border border-[#D4AF37]/50 shadow-2xs">
                  <Leaf className="h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif-display text-sm sm:text-base font-bold text-[#155132]">
                    Nguyên liệu chọn lọc
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm leading-snug text-[#2B433A]/85">
                    Nhặt sạch bằng nước RO · Không chất bảo quản
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6. TIN TỨC & CẨM NANG SỨC KHỎE (Borderless Langfarm Card Style) */}
      {latestPosts.length > 0 && (
        <section
          aria-labelledby="blog-home-heading"
          className="py-10 md:py-16 px-4 lg:px-8 max-w-[1440px] mx-auto"
        >
          <div className="flex items-end justify-between gap-4 mb-6 lg:mb-10">
            <h2
              id="blog-home-heading"
              className="font-serif-display text-2xl sm:text-3xl lg:text-[40px] font-semibold text-[#1d2327]"
            >
              Cẩm nang dinh dưỡng & quà biếu
            </h2>
            <Link
              href="/bai-viet"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#155132] hover:underline"
            >
              <span>Xem tất cả bài viết cẩm nang</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/bai-viet/${post.slug}`}
                className="group flex flex-col gap-3 bg-white rounded-3xl"
              >
                <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl}
                    alt={post.coverImageAlt || post.title}
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={400}
                    className="h-full w-full rounded-2xl object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-1 px-0.5">
                  <span className="text-xs font-semibold text-[#8A6632]">
                    {post.category}
                  </span>
                  <h3 className="text-sm sm:text-base leading-6 font-medium text-[#1d2327] group-hover:text-[#155132] line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. FAQ 3 CÂU NGẮN */}
      <section
        aria-labelledby="faq-heading"
        className="pb-12 md:pb-16 px-4 max-w-[1440px] mx-auto"
      >
        <div className="max-w-2xl mx-auto">
          <h2
            id="faq-heading"
            className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#1d2327] mb-5 text-center"
          >
            Câu hỏi thường gặp
          </h2>
          <div className="space-y-2.5">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-2xl bg-[#F8F5EC] px-5 py-3.5 open:bg-[#FDF3E3] transition-colors"
              >
                <summary className="min-h-[36px] font-medium text-sm sm:text-base text-[#1d2327] cursor-pointer list-none flex items-center justify-between gap-3">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="text-[#155132] text-lg font-bold group-open:rotate-45 transition-transform shrink-0"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm text-[#50575e] leading-relaxed pt-2.5 border-t border-black/10">
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
