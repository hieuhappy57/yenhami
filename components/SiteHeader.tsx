"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, PhoneCall, ShoppingBag, X } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { useCart } from "./CartProvider";

const NAV_LINKS = [
  {
    href: "/#menu-chu-luc",
    label: "Sản phẩm",
    children: [
      { href: "/#menu-chu-luc", label: "Yến Tươi Chưng Nóng (Thố sứ)" },
      { href: "/#danh-muc-set-qua", label: "Set Quà Biếu Sức Khỏe" },
      { href: "/#danh-muc-yen-hu", label: "Yến Hũ Chưng Sẵn" },
      { href: "/#danh-muc-yen-tinh-che", label: "Yến Tổ Tinh Chế" },
    ],
  },
  { href: "/gui-qua", label: "Set Quà Tặng" },
  { href: "/ve-ha-mi", label: "Về Hà Mi" },
  { href: "/bai-viet", label: "Tin tức" },
  { href: "/lien-he", label: "Liên hệ" },
];

const MOBILE_NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/#menu-chu-luc", label: "Yến Tươi Chưng Nóng (Thố sứ)" },
  { href: "/#danh-muc-set-qua", label: "Set Quà Tặng Biếu Tặng" },
  { href: "/#danh-muc-yen-hu", label: "Yến Hũ Chưng Sẵn" },
  { href: "/#danh-muc-yen-tinh-che", label: "Yến Tổ Tinh Chế" },
  { href: "/bai-viet", label: "Tin tức & Cẩm nang" },
  { href: "/ve-ha-mi", label: "Về Hà Mi" },
  { href: "/lien-he", label: "Liên hệ & Cửa hàng" },
  { href: "/dat-hang", label: "Đặt món (Từ 2 thố Free Ship)" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { totalBowls, setIsModalOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = (next: boolean) => {
    setMobileMenuOpen(next);
    setIsModalOpen(next);
  };

  const cartHref = totalBowls > 0 ? "/dat-hang" : "/gio-hang";

  if (pathname?.startsWith("/quan-tri") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="w-full sticky top-0 z-30 bg-white">
      {/* Langfarm-style Top Promo Bar with centered message + mini pill CTA */}
      <div
        data-testid="demo-mode-banner"
        className="bg-[#155132] text-white"
      >
        <div className="max-w-[1440px] mx-auto px-4 h-[40px] flex items-center justify-center gap-3">
          <p className="text-xs leading-[1.125rem] font-medium text-white truncate">
            YẾN TƯƠI CHƯNG NÓNG • GIAO NGAY 2H ĐÀ NẴNG (TỪ 295K)
          </p>
          <a
            href="/#menu-chu-luc"
            className="shrink-0 inline-flex items-center justify-center gap-1 h-6 py-0.5 px-2.5 text-xs font-semibold rounded-md bg-[#F9E498] text-[#155132] hover:bg-[#FFF0B8] transition-colors"
          >
            <span>Đặt ngay</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Langfarm-style Main Header Bar: Left Brand Lockup — Center Nav — Right Pill + Circular Cart */}
      <div className="relative border-b border-[#BD9342]/25 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 flex min-h-[68px] w-full items-center justify-between py-2">
          {/* Mobile Hamburger (Left) */}
          <button
            type="button"
            onClick={() => toggleMobileMenu(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
            }
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#1d2327] hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>

          {/* Left Brand Lockup (Logo + Luxury Serif Wordmark YẾN SÀO HÀ MI) */}
          <Link
            href="/"
            aria-label="Trang chủ Yến Sào Hà Mi"
            className="flex items-center gap-2 sm:gap-2.5 group"
          >
            <img
              src="/brand/ha-mi-logo-web-640.png"
              alt="Logo Yến Sào Hà Mi"
              width={48}
              height={48}
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-brand-serif uppercase text-[17px] sm:text-[22px] md:text-[25px] font-bold text-[#155132] tracking-[0.06em] whitespace-nowrap">
              YẾN SÀO HÀ MI
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden lg:flex items-center gap-9"
          >
            {NAV_LINKS.map((item) => {
              const active =
                item.href !== "/#menu-chu-luc" && pathname?.startsWith(item.href);

              if (item.children) {
                return (
                  <div key={item.label} className="relative group py-2">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-base leading-6 font-semibold text-[#1d2327] hover:text-[#155132] transition duration-200 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className="w-4 h-4 text-[#8A6632] transition-transform duration-200 group-hover:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute left-0 top-full pt-1 z-30">
                      <ul className="w-64 rounded-2xl bg-white shadow-xl border border-[#155132]/12 overflow-hidden py-1.5">
                        {item.children.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-4 py-2.5 text-sm font-medium text-[#1d2327] hover:bg-[#FDF3E3] hover:text-[#155132] transition-colors"
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-base leading-6 font-semibold transition duration-200 ${
                    active
                      ? "text-[#155132] underline decoration-[#BD9342] decoration-2 underline-offset-8"
                      : "text-[#1d2327] hover:text-[#155132]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area: Langfarm-style Soft Pill + Circular Cart Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href={`tel:${BRAND_CONFIG.contact.hotlineTel || "0935052959"}`}
              className="hidden sm:flex min-h-[46px] items-center gap-2.5 p-1 pr-4 bg-[#FDF3E3] hover:bg-[#FAEFCA] rounded-full transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#155132] shadow-2xs">
                <PhoneCall className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-[#1d2327]">
                {BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}
              </span>
            </a>

            <Link
              href={cartHref}
              data-testid="header-cart-link"
              aria-label={`Giỏ hàng và gửi yêu cầu đặt món, hiện có ${totalBowls} thố`}
              title="Giỏ hàng & Đặt món"
              className="relative inline-flex items-center justify-center w-[46px] h-[46px] sm:w-[48px] sm:h-[48px] rounded-full bg-[#155132] hover:bg-[#0e3b23] text-white transition-colors shrink-0"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              <span
                data-testid="header-cart-count"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#E85D04] text-white text-[11px] font-bold flex items-center justify-center border border-white"
              >
                {totalBowls}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-white border-b border-[#BD9342]/30 px-4 py-3 shadow-lg"
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {MOBILE_NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => toggleMobileMenu(false)}
                  className={`min-h-[42px] flex items-center px-2 py-2 text-sm sm:text-base transition-colors ${
                    active
                      ? "font-bold text-[#155132]"
                      : "font-medium text-[#1d2327] hover:text-[#155132]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
