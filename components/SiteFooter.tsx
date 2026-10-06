"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/quan-tri") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="bg-[#FFFCF4] border-t border-[#BD9342]/30 text-[#2B433A] mt-12 pb-24 md:pb-10">
      <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Brand & Contact */}
        <div className="md:col-span-6 flex items-start gap-3.5">
          <img
            src="/brand/ha-mi-logo-web-640.png"
            alt="Logo Yến Sào Hà Mi"
            width={64}
            height={64}
            loading="lazy"
            className="w-16 h-16 object-contain rounded bg-white p-1.5 border border-[#BD9342]/30 shrink-0"
          />
          <div className="space-y-1 text-xs sm:text-sm">
            <h2 className="font-serif-display text-lg font-semibold text-[#155132]">
              {BRAND_CONFIG.brandName} — {BRAND_CONFIG.flagshipLine}
            </h2>
            <p className="text-xs text-[#2B433A]/85">
              Khu vực: {BRAND_CONFIG.contact.addressDisplay} •{" "}
              {BRAND_CONFIG.contact.serviceHoursDisplay}
            </p>
            <p className="text-xs text-[#8A6632]">
              Hotline / Zalo OA:{" "}
              {BRAND_CONFIG.contact.hotlineDisplay || "Chưa cấu hình"}
            </p>
          </div>
        </div>

        {/* Main Links */}
        <div className="md:col-span-3 text-xs sm:text-sm">
          <h3 className="font-semibold text-[#155132] mb-2">Điều hướng</h3>
          <ul className="flex flex-wrap md:flex-col gap-x-4 gap-y-1.5">
            <li>
              <Link href="/yen-tuoi-chung-nong" className="hover:text-[#155132] hover:underline">
                Menu Yến Chưng
              </Link>
            </li>
            <li>
              <Link href="/gui-qua" className="hover:text-[#155132] hover:underline">
                Gửi quà biếu
              </Link>
            </li>
            <li>
              <Link href="/dat-hang" className="hover:text-[#155132] hover:underline">
                Đặt món
              </Link>
            </li>
            <li>
              <Link href="/yeu-cau-da-nhan" className="hover:text-[#155132] hover:underline">
                Tra cứu đơn
              </Link>
            </li>
            <li>
              <Link href="/ve-ha-mi" className="hover:text-[#155132] hover:underline">
                Về Hà Mi
              </Link>
            </li>
            <li>
              <Link href="/bai-viet" className="hover:text-[#155132] hover:underline">
                Bài viết & Cẩm nang
              </Link>
            </li>
            <li>
              <Link href="/tuyen-dung" className="hover:text-[#155132] hover:underline">
                Tuyển dụng
              </Link>
            </li>
          </ul>
        </div>

        {/* Expandable Policies */}
        <div className="md:col-span-3 text-xs sm:text-sm">
          <details className="group rounded-lg bg-white border border-[#155132]/15 px-3.5 py-2.5">
            <summary className="font-semibold text-[#155132] cursor-pointer list-none flex items-center justify-between">
              <span>Chính sách phục vụ</span>
              <span className="text-[#8A6632] font-bold group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <ul className="mt-2.5 pt-2 border-t border-[#155132]/10 space-y-1.5 text-xs">
              <li>
                <Link href="/chinh-sach/giao-nhan" className="hover:text-[#155132] hover:underline">
                  Giao nhận & Giữ ấm
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/thanh-toan" className="hover:text-[#155132] hover:underline">
                  Xác nhận & Thanh toán
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/doi-huy" className="hover:text-[#155132] hover:underline">
                  Thay đổi / Hủy yêu cầu
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/quyen-rieng-tu" className="hover:text-[#155132] hover:underline">
                  Bảo mật thông tin
                </Link>
              </li>
            </ul>
          </details>
        </div>
      </div>

      <div className="border-t border-[#BD9342]/20 py-3 px-4 text-[11px] text-[#2B433A]/75 text-center">
        {BRAND_CONFIG.contact.legalEntityDisplay}
      </div>
    </footer>
  );
}
