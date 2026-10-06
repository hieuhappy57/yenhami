"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, PhoneCall, ShoppingBag, X } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { useCart } from "./CartProvider";

const LEFT_NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  {
    href: "/#menu-chu-luc",
    label: "Sản phẩm Hà Mi",
    children: [
      { href: "/#menu-chu-luc", label: "Yến Tươi Chưng Nóng (Thố sứ)" },
      { href: "/#danh-muc-yen-hu", label: "Yến Hũ Chưng Sẵn" },
      { href: "/#danh-muc-yen-tinh-che", label: "Yến Tổ Tinh Chế" },
      { href: "/#danh-muc-set-qua", label: "Set Quà Tặng Sức Khỏe" },
    ],
  },
  { href: "/gui-qua", label: "Set Quà Tặng" },
];

const RIGHT_NAV_LINKS = [
  { href: "/bai-viet", label: "Bài viết" },
  { href: "/tuyen-dung", label: "Tuyển dụng" },
  { href: "/ve-ha-mi", label: "Về Hà Mi" },
  { href: "/dat-hang", label: "Đặt món" },
];

const MOBILE_NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/#menu-chu-luc", label: "Yến Tươi Chưng Nóng (Thố sứ)" },
  { href: "/#danh-muc-yen-hu", label: "Yến Hũ Chưng Sẵn" },
  { href: "/#danh-muc-yen-tinh-che", label: "Yến Tổ Tinh Chế" },
  { href: "/gui-qua", label: "Set Quà Tặng Biếu Tặng" },
  { href: "/bai-viet", label: "Bài viết & Cẩm nang" },
  { href: "/tuyen-dung", label: "Tuyển dụng nhân sự" },
  { href: "/ve-ha-mi", label: "Câu chuyện Hà Mi" },
  { href: "/dat-hang", label: "Đặt món (2 thố Free Ship)" },
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

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur shadow-xs border-b border-[#155132]/12">
      {/* Top Bar */}
      <div
        data-testid="demo-mode-banner"
        className="bg-[#155132] text-[#FFFCF4] py-1.5 px-3 text-[11px] sm:text-xs"
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-center sm:justify-between gap-2">
          <div className="hidden sm:flex items-center gap-1.5 truncate">
            <PhoneCall
              className="w-3.5 h-3.5 text-[#BD9342] shrink-0"
              aria-hidden="true"
            />
            <span className="truncate">
              {BRAND_CONFIG.contact.hotlineDisplay ? (
                <>
                  Hotline: <strong>{BRAND_CONFIG.contact.hotlineDisplay}</strong>
                </>
              ) : (
                <>
                  Yến Sào Hà Mi • <strong>Miễn phí giao hàng cho đơn từ 2 thố</strong>
                </>
              )}
            </span>
          </div>

          {BRAND_CONFIG.isDemoMode && (
            <span className="shrink-0 text-[#FFFCF4]/95 font-medium">
              Bản thử nghiệm • Đặt từ 2 thố Free Ship
            </span>
          )}
        </div>
      </div>

      {/* Desktop Navigation Bar: Left Menu — Large Centered Logo — Right Menu + Circular Cart */}
      <nav aria-label="Điều hướng chính" className="hidden lg:block bg-white">
        <div className="max-w-[1200px] mx-auto px-4 h-24 xl:h-28 flex items-center justify-between gap-4">
          {/* First Half Menu Items (Left) */}
          <div className="flex items-center justify-end gap-x-6 xl:gap-x-9 w-[42%]">
            {LEFT_NAV_LINKS.map((item) => {
              const active = item.href === "/" && pathname === "/";

              if (item.children) {
                return (
                  <div key={item.label} className="relative group py-2">
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 font-serif-display text-[15px] xl:text-base whitespace-nowrap transition-colors ${
                        active
                          ? "text-[#155132] font-bold"
                          : "text-[#2B433A] font-semibold hover:text-[#155132]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className="w-3.5 h-3.5 text-[#8A6632] transition-transform duration-200 group-hover:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>

                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 transition-all duration-200 absolute left-0 top-full pt-1 z-30">
                      <ul className="w-60 rounded-lg bg-white shadow-lg border border-[#155132]/15 overflow-hidden py-1">
                        {item.children.map((sub) => (
                          <li key={sub.href}>
                            <Link
                              href={sub.href}
                              className="block px-4 py-2.5 text-sm font-medium text-[#2B433A] hover:bg-[#155132] hover:text-[#FFFCF4] transition-colors"
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
                  className={`font-serif-display text-[15px] xl:text-base whitespace-nowrap py-2 transition-colors ${
                    active
                      ? "text-[#155132] font-bold underline decoration-[#BD9342] decoration-2 underline-offset-8"
                      : "text-[#2B433A] font-semibold hover:text-[#155132]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Prominent Centered Brand Logo on Desktop */}
          <div className="w-[16%] flex justify-center shrink-0">
            <Link
              href="/"
              aria-label="Trang chủ Yến Sào Hà Mi"
              className="flex flex-col items-center justify-center py-1 group"
            >
              <img
                src="/brand/ha-mi-logo-web-640.png"
                alt="Logo Yến Sào Hà Mi"
                width={104}
                height={104}
                className="w-[88px] h-[88px] xl:w-[100px] xl:h-[100px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Second Half Menu Items + Circular Cart Icon (Right) */}
          <div className="flex items-center justify-between gap-x-5 xl:gap-x-8 w-[42%]">
            <div className="flex items-center gap-x-6 xl:gap-x-9">
              {RIGHT_NAV_LINKS.map((item) => {
                const active = pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-serif-display text-[15px] xl:text-base whitespace-nowrap py-2 transition-colors ${
                      active
                        ? "text-[#155132] font-bold underline decoration-[#BD9342] decoration-2 underline-offset-8"
                        : "text-[#2B433A] font-semibold hover:text-[#155132]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <Link
                href={cartHref}
                data-testid="header-cart-link"
                aria-label={`Giỏ hàng và gửi yêu cầu đặt món, hiện có ${totalBowls} thố`}
                title="Giỏ hàng & Đặt món"
                className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#155132]/8 text-[#155132] border border-[#BD9342]/45 hover:bg-[#155132] hover:text-[#FFFCF4] transition-colors shrink-0"
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span
                  data-testid="header-cart-count"
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#155132] text-[#FFFCF4] border border-[#BD9342] text-[11px] font-bold flex items-center justify-center"
                >
                  {totalBowls}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile & Tablet Header: Left Hamburger — Centered Logo — Right Circular Cart */}
      <div className="lg:hidden bg-white px-3 h-16 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => toggleMobileMenu(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={
            mobileMenuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
          }
          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[#155132] hover:bg-[#155132]/8 transition-colors cursor-pointer shrink-0"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        <Link
          href="/"
          aria-label="Trang chủ Yến Sào Hà Mi"
          className="flex items-center justify-center gap-2.5 mx-auto py-1"
        >
          <img
            src="/brand/ha-mi-logo-web-640.png"
            alt="Logo Yến Sào Hà Mi"
            width={48}
            height={48}
            className="w-12 h-12 object-contain shrink-0"
          />
          <div className="flex flex-col text-left">
            <span className="font-serif-display font-bold text-sm sm:text-base text-[#155132] tracking-wide leading-tight">
              YẾN SÀO HÀ MI
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#8A6632] font-semibold tracking-wider uppercase">
              Yến Tươi Chưng Nóng
            </span>
          </div>
        </Link>

        <Link
          href={cartHref}
          aria-label={`Giỏ hàng và gửi yêu cầu đặt món, hiện có ${totalBowls} thố`}
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#155132]/8 text-[#155132] border border-[#BD9342]/45 hover:bg-[#155132] hover:text-[#FFFCF4] transition-colors shrink-0"
        >
          <ShoppingBag className="w-5 h-5" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#155132] text-[#FFFCF4] border border-[#BD9342] text-[10px] font-bold flex items-center justify-center">
            {totalBowls}
          </span>
        </Link>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-[#FFFCF4] border-t border-[#BD9342]/30 px-4 py-3 shadow-lg"
        >
          <div className="flex flex-col divide-y divide-[#155132]/10">
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
                  className={`min-h-[42px] flex items-center px-2 py-2 font-serif-display text-sm sm:text-base transition-colors ${
                    active
                      ? "font-bold text-[#155132]"
                      : "font-semibold text-[#2B433A] hover:text-[#155132]"
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
