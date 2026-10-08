import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  Flame,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";
import { BRAND_CONFIG } from "@/config/brand";

export const metadata: Metadata = buildPageMetadata({
  title: "Câu Chuyện Thương Hiệu — Chuẩn ISO 22000:2018 & FDA Hoa Kỳ",
  description:
    "Tìm hiểu câu chuyện thương hiệu Yến Sào Hà Mi tại Đà Nẵng: Yến sào thật – Tinh khiết – Thượng hạng, nhà máy đạt chuẩn ISO 22000:2018 và chứng nhận FDA Hoa Kỳ.",
  path: "/ve-ha-mi",
  image: "/brand/catalog/nha-may-so-che.jpg",
});

export default function VeHaMiPage() {
  return (
    <div className="bg-[#FDFBF7] pb-14 space-y-12">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Về Yến Sào Hà Mi", path: "/ve-ha-mi" },
        ]}
      />

      {/* 1. LANGFARM-STYLE FULL-BLEED STORY HERO */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[420px] flex flex-col justify-end p-6 sm:p-10 md:p-12 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/banners/hero-slide-3-yen-viet-nguyen-to-v2.webp"
            alt="Về Yến Sào Hà Mi — Chuẩn ISO 22000:2018 & FDA Hoa Kỳ"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0D231A]/95 via-[#0D231A]/60 to-black/20"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl space-y-3.5">
            <span className="inline-block rounded-full bg-white/15 backdrop-blur-xs border border-[#F3D78A]/45 px-3.5 py-1 text-xs font-semibold text-[#F3D78A]">
              Món quà của sự an tâm • Chạm đến sự bình yên
            </span>
            <h1 className="font-serif-display text-2xl sm:text-4xl md:text-[42px] font-bold text-white leading-tight">
              Yến Sào Hà Mi — Chất Từng Sợi Yến
            </h1>
            <p className="text-xs sm:text-base text-white/90 leading-relaxed max-w-2xl">
              Hà Mi toàn tâm toàn ý giữ trọn dưỡng chất tự nhiên trong từng sợi yến Việt nguyên tổ để mang đến cho mẹ bầu, người đang hồi phục sau bệnh và ông bà cao tuổi sự bồi bổ thuần khiết, ấm áp nhất.
            </p>
          </div>
        </div>
      </section>

      {/* 2. LANGFARM-STYLE MISSION QUOTE BANNER + WOVEN RIBBON + 3 PASTEL BLOBS */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="rounded-t-3xl bg-[#FAD4B8] px-6 py-10 sm:px-12 sm:py-12 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7C4D2B] mb-2">
            Triết lý hoạt động: Tự nhiên – Chất lượng – Minh bạch
          </p>
          <blockquote className="font-serif-display text-xl sm:text-2xl md:text-[28px] font-bold text-[#1B1B1B] max-w-4xl mx-auto leading-snug">
            “Yến Sào Thật – Tinh Khiết – Thượng Hạng – Dinh Dưỡng Cao – Lợi Ích Thực Cho Sức Khỏe Gia Đình Việt”
          </blockquote>
        </div>
        <div
          className="h-3 w-full rounded-b-xl overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #1B4332 0px, #1B4332 16px, #D4AF37 16px, #D4AF37 32px, #C86D51 32px, #C86D51 48px, #FAF6F0 48px, #FAF6F0 64px)",
          }}
          aria-hidden="true"
        />
      </section>

      {/* 3. 4 PASTEL STORY PILLARS (LANGFARM CARD GRID) */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-[#FFE9DD] p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2.5 text-[#1B4332]">
              <span className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#7C4D2B]" />
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B]">
                Nguồn nguyên liệu tuyển chọn
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Hà Mi trực tiếp khai thác và hợp tác với <strong>hàng trăm nhà yến đạt chuẩn</strong> tại các vùng chim yến nổi tiếng của Việt Nam, nơi có tổ yến già cho sợi dài dày và hàm lượng protein cao.
            </p>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Quy trình sơ chế áp dụng phương pháp <strong>làm ẩm nhẹ và rút lông đại thủ công</strong> bằng nước lọc RO tinh khiết — hoàn toàn không chất tẩy trắng, không chất độn (mủ trôm), không thêm muối hay đường.
            </p>
          </div>

          <div className="rounded-3xl bg-[#E2FCF3] p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2.5 text-[#1B4332]">
              <span className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#1B4332]" />
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B]">
                Chuẩn quốc tế ISO 22000:2018 & FDA
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Cơ sở sản xuất của Hà Mi đạt tiêu chuẩn quản lý an toàn thực phẩm quốc tế <strong className="text-[#1B4332]">ISO 22000:2018</strong> và chứng nhận <strong className="text-[#1B4332]">FDA của Cục Quản lý Thực phẩm và Dược phẩm Hoa Kỳ</strong>.
            </p>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Nhà máy trang bị các phòng chức năng chuyên dụng và <strong>hệ thống lọc nước tinh khiết RO toàn diện</strong> xuyên suốt từ khâu nhặt lông đến khi chưng nóng thố sứ.
            </p>
          </div>

          <div className="rounded-3xl bg-[#FAEFCA] p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2.5 text-[#1B4332]">
              <span className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-[#7C4D2B]" />
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B]">
                Con người & Tâm huyết trong từng thố yến
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Đội ngũ nghệ nhân sơ chế và đầu bếp chưng yến tại Hà Mi được đào tạo bài bản với tinh thần trách nhiệm cao. Mỗi thố yến 200ml chứa đến 35g yến tươi thật được chưng thủ công tươi nóng ngay khi nhận đơn như chính tay người thân chăm sóc.
            </p>
          </div>

          <div className="rounded-3xl bg-[#F5E2F9] p-6 sm:p-8 space-y-3">
            <div className="inline-flex items-center gap-2.5 text-[#1B4332]">
              <span className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#1B4332]" />
              </span>
              <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B]">
                Tầm nhìn & Sự tin chọn
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              Sản phẩm Yến Tươi Chưng Nóng Thố Sứ 200ml, Set Quà Hoa Sen Vàng và Yến Sào Tinh Chế Hà Mi được các gia đình, doanh nghiệp và khách hàng tại Đà Nẵng tin chọn làm món quà bồi bổ cho mẹ bầu, người bệnh, ông bà và đối tác.
            </p>
          </div>
        </div>
      </section>

      {/* 4. BOTANICAL WAVE DIVIDER */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8" aria-hidden="true">
        <svg viewBox="0 0 1200 60" fill="none" className="w-full h-10 sm:h-12 text-[#1B4332]">
          <path
            d="M0 42 Q 300 54, 580 38 T 1200 42"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M585 38 C 585 20, 570 12, 562 15 C 566 26, 576 34, 585 38 Z" fill="currentColor" />
          <path d="M588 38 C 594 18, 610 10, 618 14 C 612 26, 600 34, 588 38 Z" fill="currentColor" />
        </svg>
      </div>

      {/* 5. OFFICIAL CONTACT BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="rounded-3xl bg-[#FAF4EB] p-6 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DAC6] pb-5">
            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B4332]">
                Thông tin liên hệ chính thức — Yến Sào Hà Mi
              </h2>
              <p className="text-xs sm:text-sm text-[#7C4D2B] mt-1">
                Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất • Giao Ngay Trong 2H Tại Đà Nẵng
              </p>
            </div>
            <Link
              href="/dat-hang"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 rounded-full bg-[#1B4332] text-xs sm:text-sm font-bold text-[#FFFCF4] hover:bg-[#133023] transition shrink-0"
            >
              Đặt Giao Nóng 2H →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs sm:text-sm text-[#2B433A]">
            <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
              <MapPin className="w-5 h-5 text-[#7C4D2B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#1B4332]">Địa chỉ chính:</strong>
                <span>{BRAND_CONFIG.contact.addressDisplay}</span>
                <strong className="block text-[#1B4332] mt-2">Xưởng sản xuất:</strong>
                <span>{BRAND_CONFIG.workshopAddressDisplay}</span>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
              <Phone className="w-5 h-5 text-[#7C4D2B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#1B4332]">Hotline / Zalo OA 2H:</strong>
                <a
                  href="tel:0935052959"
                  className="font-bold text-base text-[#7C4D2B] hover:underline"
                >
                  0935 052 959
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
              <Flame className="w-5 h-5 text-[#7C4D2B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#1B4332]">Khung giờ chưng nóng & giao:</strong>
                <span>08:00 – 21:00 mỗi ngày (Giao trong 2 giờ)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
