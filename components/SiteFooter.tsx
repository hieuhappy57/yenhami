"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, MapPin, Clock, ShieldCheck, Mail } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quan-tri") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#F6EFE4] text-[#2B433A] mt-14 pb-24 md:pb-10 border-t border-[#E6DAC6]">
      {/* Subtle geometric woven top ribbon inspired by Langfarm */}
      <div
        className="h-2 w-full opacity-75"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #1B4332 0px, #1B4332 18px, #D4AF37 18px, #D4AF37 36px, #C86D51 36px, #C86D51 54px, #FAF6F0 54px, #FAF6F0 72px)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Col 1: Brand Identity & Contact */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF2] to-[#F9EED8] p-1 border-[1.5px] border-[#C89B3C]/75 ring-3 ring-[#BD9342]/12 shadow-[0_4px_14px_rgba(189,147,66,0.22)] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/ha-mi-logo-web-640.png"
                alt="Logo YẾN SÀO HÀ MI"
                width={60}
                height={60}
                loading="lazy"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h2 className="font-serif-display text-xl sm:text-2xl font-extrabold uppercase tracking-[0.04em] text-[#11462B] leading-tight">
                YẾN SÀO HÀ MI
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="inline-block w-4 h-[1.5px] rounded-full bg-gradient-to-r from-[#BD9342] to-[#E5C168]"
                  aria-hidden="true"
                />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9A6F21]">
                  CHẤT TỪNG SỢI YẾN • ĐÀ NẴNG
                </p>
              </div>
              <p className="text-xs font-medium text-[#7C4D2B] mt-0.5">
                Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#2B433A]/85 leading-relaxed max-w-md">
            Mỗi thố yến 200ml chứa đến 35g yến tươi thật nguyên tổ, chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng tận tay trong 2 giờ tại Đà Nẵng.
          </p>

          <div className="space-y-2 text-xs sm:text-sm text-[#2B433A]/90 pt-1">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#7C4D2B] shrink-0 mt-0.5" />
              <span>{BRAND_CONFIG.contact.addressDisplay}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7C4D2B] shrink-0" />
              <span>{BRAND_CONFIG.contact.serviceHoursDisplay}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#7C4D2B] shrink-0" />
              <span>
                Hotline / Zalo OA:{" "}
                <a
                  href={`tel:${BRAND_CONFIG.contact.hotlineTel}`}
                  className="font-bold text-[#1B4332] hover:underline"
                >
                  {BRAND_CONFIG.contact.hotlineDisplay}
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#7C4D2B] shrink-0" />
              <span>
                Email CSKH:{" "}
                <a
                  href={`mailto:${BRAND_CONFIG.contact.emailDisplay}`}
                  className="font-bold text-[#1B4332] hover:underline"
                >
                  {BRAND_CONFIG.contact.emailDisplay}
                </a>
              </span>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#E5D5B5] px-3.5 py-1.5 text-xs font-semibold text-[#1B4332]">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Đạt chuẩn quốc tế ISO 22000:2018 & FDA Hoa Kỳ</span>
          </div>
        </div>

        {/* Col 2: Sản phẩm chủ lực */}
        <div className="md:col-span-3 space-y-3 text-xs sm:text-sm">
          <h3 className="font-serif-display text-base font-bold text-[#1B4332]">
            Sản phẩm Hà Mi
          </h3>
          <ul className="space-y-2 text-[#2B433A]/85">
            <li>
              <Link href="/yen-tuoi-chung-nong" className="hover:text-[#1B4332] hover:underline">
                Yến Tươi Chưng Nóng Thố Sứ 200ml
              </Link>
            </li>
            <li>
              <Link href="/gui-qua" className="hover:text-[#1B4332] hover:underline">
                Set Quà Tặng Hoa Sen & Đàn Én
              </Link>
            </li>
            <li>
              <Link href="/#danh-muc-yen-hu" className="hover:text-[#1B4332] hover:underline">
                Yến Hũ Chưng Sẵn 75ml & 100ml
              </Link>
            </li>
            <li>
              <Link href="/#danh-muc-yen-tinh-che" className="hover:text-[#1B4332] hover:underline">
                Yến Sào Tinh Chế Nguyên Tổ 100g
              </Link>
            </li>
            <li>
              <Link href="/dat-hang" className="font-semibold text-[#7C4D2B] hover:text-[#1B4332] hover:underline">
                Đặt Giao Nóng 2H Trực Tuyến →
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Về Hà Mi & Cẩm nang */}
        <div className="md:col-span-2 space-y-3 text-xs sm:text-sm">
          <h3 className="font-serif-display text-base font-bold text-[#1B4332]">
            Về Hà Mi
          </h3>
          <ul className="space-y-2 text-[#2B433A]/85">
            <li>
              <Link href="/ve-ha-mi" className="hover:text-[#1B4332] hover:underline">
                Câu chuyện thương hiệu
              </Link>
            </li>
            <li>
              <Link href="/bai-viet" className="hover:text-[#1B4332] hover:underline">
                Tin tức & Cẩm nang
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:text-[#1B4332] hover:underline">
                Khu vực giao nóng 2H
              </Link>
            </li>
            <li>
              <Link href="/yeu-cau-da-nhan" className="hover:text-[#1B4332] hover:underline">
                Tra cứu đơn hàng
              </Link>
            </li>
            <li>
              <Link href="/tuyen-dung" className="hover:text-[#1B4332] hover:underline">
                Tuyển dụng
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Chính sách phục vụ */}
        <div className="md:col-span-2 space-y-3 text-xs sm:text-sm">
          <h3 className="font-serif-display text-base font-bold text-[#1B4332]">
            Chính sách
          </h3>
          <ul className="space-y-2 text-[#2B433A]/85">
            <li>
              <Link href="/chinh-sach/giao-nhan" className="hover:text-[#1B4332] hover:underline">
                Giao nhận & Giữ ấm 2H
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach/thanh-toan" className="hover:text-[#1B4332] hover:underline">
                Xác nhận & Thanh toán
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach/doi-huy" className="hover:text-[#1B4332] hover:underline">
                Thay đổi / Hủy yêu cầu
              </Link>
            </li>
            <li>
              <Link href="/chinh-sach/quyen-rieng-tu" className="hover:text-[#1B4332] hover:underline">
                Bảo mật thông tin
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E6DAC6] py-4 px-4 text-xs text-[#2B433A]/75 text-center">
        {BRAND_CONFIG.contact.legalEntityDisplay}
      </div>
    </footer>
  );
}
