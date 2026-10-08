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
    <header className="w-full sticky top-0 z-30 bg-white/95 backdrop-blur-md">
      {/* Top Promo Bar with luxury emerald gradient + gold hairline */}
      <div
        data-testid="demo-mode-banner"
        className="bg-gradient-to-r from-[#0E3B23] via-[#155132] to-[#0E3B23] text-white border-b border-[#BD9342]/30"
      >
        <div className="max-w-[1440px] mx-auto px-4 h-[38px] sm:h-[40px] flex items-center justify-center gap-2.5 sm:gap-3.5">
          <span
            className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#F9E498] animate-pulse"
            aria-hidden="true"
          />
          <p className="text-[11px] sm:text-xs leading-[1.125rem] font-semibold tracking-wide text-[#FFFDF7] truncate">
            YẾN TƯƠI CHƯNG NÓNG • GIAO NGAY 2H ĐÀ NẴNG (TỪ 295K)
          </p>
          <a
            href="/#menu-chu-luc"
            className="shrink-0 inline-flex items-center justify-center gap-1 h-6 py-0.5 px-3 text-[11px] sm:text-xs font-bold rounded-full bg-gradient-to-r from-[#F9E498] to-[#E9C76B] text-[#11462B] hover:from-[#FFF0B8] hover:to-[#F3D782] shadow-2xs transition-all"
          >
            <span>Đặt ngay</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Main Header Bar: Prominent Left Brand Medallion & 2-Tier Lockup — Center Nav — Right Pill + Cart */}
      <div className="relative border-b border-[#E6DAC3] bg-white/95 shadow-[0_6px_24px_-12px_rgba(21,81,50,0.12)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex min-h-[74px] sm:min-h-[84px] w-full items-center justify-between py-2.5 gap-2">
          {/* Mobile Hamburger (Left) */}
          <button
            type="button"
            onClick={() => toggleMobileMenu(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
            }
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#155132] bg-[#FAF4E8] border border-[#BD9342]/30 hover:bg-[#F3E8D0] transition-colors cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Left Brand Lockup: Framed Gold Medallion + Modern Bold 2-Tier Wordmark */}
          <Link
            href="/"
            aria-label="Trang chủ Yến Sào Hà Mi"
            className="flex items-center gap-2.5 sm:gap-3.5 lg:pr-6 xl:pr-8 lg:border-r lg:border-[#BD9342]/25 group shrink-0"
          >
            {/* Luxury Medallion Badge */}
            <div className="relative flex items-center justify-center w-[52px] h-[52px] sm:w-[62px] sm:h-[62px] rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FFFBF2] to-[#F9EED8] p-1 border-[1.5px] border-[#C89B3C]/75 ring-3 ring-[#BD9342]/12 shadow-[0_4px_14px_rgba(189,147,66,0.24)] group-hover:scale-105 group-hover:border-[#B88628] group-hover:shadow-[0_6px_20px_rgba(189,147,66,0.34)] transition-all duration-300 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/ha-mi-logo-web-640.png"
                alt="Logo Yến Sào Hà Mi"
                width={60}
                height={60}
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            {/* 2-Tier Modern Luxury Brand Typography */}
            <div className="flex flex-col justify-center">
              <span className="font-serif-display uppercase text-[17px] sm:text-[23px] xl:text-[26px] font-extrabold text-[#11462B] group-hover:text-[#155132] tracking-[0.04em] leading-[1.1] whitespace-nowrap drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] transition-colors">
                YẾN SÀO HÀ MI
              </span>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <span
                  className="inline-block w-3.5 sm:w-5 h-[1.5px] rounded-full bg-gradient-to-r from-[#BD9342] to-[#E5C168]"
                  aria-hidden="true"
                />
                <span className="text-[9.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#9A6F21] whitespace-nowrap">
                  CHẤT TỪNG SỢI YẾN
                </span>
                <span
                  className="hidden sm:inline-block text-[10px] text-[#BD9342]"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#155132]/80 whitespace-nowrap">
                  ĐÀ NẴNG
                </span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden lg:flex items-center gap-7 xl:gap-9"
          >
            {NAV_LINKS.map((item) => {
              const active =
                item.href !== "/#menu-chu-luc" && pathname?.startsWith(item.href);

              if (item.children) {
                return (
                  <div key={item.label} className="relative group py-2">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-[15px] xl:text-base leading-6 font-bold text-[#1F332B] hover:text-[#155132] transition duration-200 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className="w-4 h-4 text-[#9A6F21] transition-transform duration-200 group-hover:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute left-0 top-full pt-1.5 z-30">
                      <ul className="w-64 rounded-2xl bg-white shadow-xl border border-[#BD9342]/25 overflow-hidden py-1.5">
                        {item.children.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-4 py-2.5 text-sm font-semibold text-[#1F332B] hover:bg-[#FDF6E7] hover:text-[#155132] transition-colors"
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
                  className={`relative py-1 text-[15px] xl:text-base leading-6 font-bold transition duration-200 ${
                    active
                      ? "text-[#155132] after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2.5px] after:rounded-full after:bg-[#BD9342]"
                      : "text-[#1F332B] hover:text-[#155132]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area: Luxury Hotline Pill + Circular Cart Button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <a
              href={`tel:${BRAND_CONFIG.contact.hotlineTel || "0935052959"}`}
              className="hidden md:flex min-h-[46px] items-center gap-2.5 p-1 pr-4 bg-gradient-to-r from-[#FDF6E7] to-[#FAF0D7] hover:from-[#FAF0D7] hover:to-[#F5E4BC] border border-[#BD9342]/35 rounded-full shadow-2xs transition-all cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-[#155132] border border-[#BD9342]/25 shadow-2xs">
                <PhoneCall className="w-4 h-4 text-[#B88628]" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6F21]">
                  Giao nóng 2H
                </span>
                <span className="text-sm font-extrabold text-[#11462B]">
                  {BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}
                </span>
              </span>
            </a>

            <Link
              href={cartHref}
              data-testid="header-cart-link"
              aria-label={`Giỏ hàng và gửi yêu cầu đặt món, hiện có ${totalBowls} thố`}
              title="Giỏ hàng & Đặt món"
              className="relative inline-flex items-center justify-center w-[44px] h-[44px] sm:w-[48px] sm:h-[48px] rounded-full bg-gradient-to-br from-[#1B5E3A] to-[#114026] hover:from-[#155132] hover:to-[#0C311D] text-white shadow-[0_4px_12px_rgba(21,81,50,0.25)] ring-1 ring-[#BD9342]/35 transition-all shrink-0"
            >
              <ShoppingBag className="w-5 h-5" aria-hidden="true" />
              <span
                data-testid="header-cart-count"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#E85D04] text-white text-[11px] font-bold flex items-center justify-center border-2 border-white shadow-2xs"
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
