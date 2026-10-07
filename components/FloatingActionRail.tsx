"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, X, Info } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { useCart } from "./CartProvider";

export function FloatingActionRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalBowls, isInputFocused, isModalOpen } = useCart();
  const [unconfiguredChannel, setUnconfiguredChannel] = useState<"Zalo" | "Messenger" | null>(null);

  // Do not show customer floating rail inside staff admin dashboard
  if (pathname?.startsWith("/quan-tri")) {
    return null;
  }

  const handleOrderClick = () => {
    setUnconfiguredChannel(null);
    if (totalBowls > 0) {
      router.push("/dat-hang");
      return;
    }
    if (pathname === "/") {
      const menuEl = document.getElementById("menu-chu-luc");
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push("/yen-tuoi-chung-nong");
  };

  const handleZaloClick = () => {
    if (BRAND_CONFIG.contact.zaloUrl) {
      window.open(BRAND_CONFIG.contact.zaloUrl, "_blank", "noopener,noreferrer");
    } else {
      setUnconfiguredChannel((prev) => (prev === "Zalo" ? null : "Zalo"));
    }
  };

  const handleMessengerClick = () => {
    if (BRAND_CONFIG.contact.messengerUrl) {
      window.open(BRAND_CONFIG.contact.messengerUrl, "_blank", "noopener,noreferrer");
    } else {
      setUnconfiguredChannel((prev) => (prev === "Messenger" ? null : "Messenger"));
    }
  };

  const hasStickyCartBar = totalBowls > 0 && pathname !== "/dat-hang" && pathname !== "/gio-hang";

  // Adaptive bottom offset so rail never overlaps mobile sticky cart bar, form inputs, or modals
  const bottomClass = hasStickyCartBar
    ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-8"
    : "bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] md:bottom-8";

  // When a modal is open or user is typing in form inputs on mobile, tuck nicely to top-right or reduce visual footprint
  const mobileInputAdjustClass =
    isModalOpen
      ? "opacity-0 pointer-events-none"
      : isInputFocused
        ? "max-md:top-20 max-md:bottom-auto max-md:scale-90 origin-top-right"
        : "";

  const orderTooltip =
    totalBowls > 0
      ? `Đặt hàng (${totalBowls} thố trong giỏ — Tới bước gửi yêu cầu)`
      : "Đặt hàng (Giỏ đang trống — Tới Menu chọn món)";

  const zaloConfigured = Boolean(BRAND_CONFIG.contact.zaloUrl);
  const messengerConfigured = Boolean(BRAND_CONFIG.contact.messengerUrl);

  return (
    <aside
      aria-label="Thanh đặt hàng và liên hệ nhanh"
      data-testid="floating-action-rail"
      className={`fixed right-[calc(0.625rem+env(safe-area-inset-right,0px))] md:right-5 ${bottomClass} ${mobileInputAdjustClass} z-40 flex flex-col items-end gap-2.5 transition-all duration-200`}
    >
      {unconfiguredChannel && (
        <div
          role="dialog"
          aria-label={`Thông báo cấu hình kênh ${unconfiguredChannel}`}
          data-testid="unconfigured-channel-notice"
          className="mb-1 w-72 sm:w-80 rounded-lg bg-[#FFFCF4] border border-[#BD9342] p-3.5 shadow-xl text-xs text-[#2B433A]"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-semibold text-[#155132] flex items-center gap-1.5 text-sm">
              <Info className="w-4 h-4 text-[#8A6632] shrink-0" aria-hidden="true" />
              Kênh {unconfiguredChannel} chưa cấu hình URL
            </span>
            <button
              type="button"
              onClick={() => setUnconfiguredChannel(null)}
              aria-label="Đóng thông báo kênh liên hệ"
              className="p-1.5 rounded hover:bg-[#DBF1EE]/60 text-[#2B433A] cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          <p className="leading-relaxed text-[#2B433A]/90">
            Bản MVP đang ở chế độ kiểm thử. Đường dẫn{" "}
            <strong>{unconfiguredChannel} chính thức của Yến Sào Hà Mi</strong> sẽ được kích hoạt
            ngay khi Chủ thương hiệu cung cấp (hệ thống không tự đoán số điện thoại hay dùng link
            giả).
          </p>
          <div className="mt-2.5 pt-2 border-t border-[#BD9342]/30 flex justify-between items-center">
            <span className="text-[11px] text-[#8A6632] font-medium">
              Trạng thái: UNCONFIGURED
            </span>
            <button
              type="button"
              onClick={handleOrderClick}
              className="text-xs font-semibold text-[#155132] underline cursor-pointer"
            >
              {totalBowls > 0 ? "Gửi yêu cầu trên web →" : "Chọn món trên web →"}
            </button>
          </div>
        </div>
      )}

      {/* Badge Giao Nóng 2H */}
      <div className="inline-flex items-center gap-1 rounded-full bg-[#155132] text-[#FFFCF4] border border-[#BD9342] px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-md">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#BD9342] animate-pulse" aria-hidden="true" />
        <span>Giao Nóng 2H</span>
      </div>

      {/* 1. Nút Đặt hàng (Chỉ hiện trên Desktop vì Mobile đã có Giỏ hàng Header + Thanh nổi dưới đáy) */}
      <div className="group relative hidden md:flex items-center">
        <span
          role="tooltip"
          className="pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity mr-2.5 whitespace-nowrap rounded bg-[#155132] px-3 py-1.5 text-xs font-medium text-[#FFFCF4] shadow-md border border-[#BD9342]/60"
        >
          {orderTooltip}
        </span>
        <button
          type="button"
          onClick={handleOrderClick}
          data-testid="rail-btn-order"
          aria-label={orderTooltip}
          title={orderTooltip}
          className="relative flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#155132] text-[#FFFCF4] border-2 border-[#BD9342] shadow-lg hover:bg-[#0e3b23] transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-5 h-5" aria-hidden="true" />
          {totalBowls > 0 && (
            <span
              data-testid="rail-order-badge"
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#BD9342] text-[#155132] font-bold text-[11px] flex items-center justify-center border border-white"
            >
              {totalBowls}
            </span>
          )}
        </button>
      </div>

      {/* 1B. Nút Gọi Hotline 0935 052 959 (Mobile & Desktop) */}
      <div className="group relative flex items-center">
        <span
          role="tooltip"
          className="pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity mr-2.5 whitespace-nowrap rounded bg-[#155132] px-3 py-1.5 text-xs font-semibold text-[#FFFCF4] shadow-md border border-[#BD9342]"
        >
          Hotline Giao Nóng 2H: {BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}
        </span>
        <a
          href={`tel:${BRAND_CONFIG.contact.hotlineTel || "0935052959"}`}
          data-testid="rail-btn-hotline"
          aria-label={`Gọi Hotline Giao Nóng 2H ${BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}`}
          title={`Hotline Giao Nóng 2H: ${BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}`}
          className="relative flex items-center gap-1.5 min-h-[44px] px-3 md:px-3.5 py-2 rounded-full bg-[#155132] text-[#FFFCF4] border-2 border-[#BD9342] shadow-lg hover:bg-[#0e3b23] transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 md:w-5 md:h-5 text-[#BD9342] shrink-0 fill-current"
            aria-hidden="true"
          >
            <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z" />
          </svg>
          <span className="text-[11px] sm:text-xs font-bold tracking-tight whitespace-nowrap">
            {BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959"}
          </span>
        </a>
      </div>

      {/* 2. Nút Nhắn tin Zalo OA */}
      <div className="group relative flex items-center">
        <span
          role="tooltip"
          className="pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity mr-2.5 whitespace-nowrap rounded bg-[#2B433A] px-3 py-1.5 text-xs font-medium text-white shadow-md"
        >
          Zalo OA Yến Sào Hà Mi • Giao Nóng 2H
        </span>
        <button
          type="button"
          onClick={handleZaloClick}
          data-testid="rail-btn-zalo"
          aria-label="Nhắn tin Zalo OA Yến Sào Hà Mi - Giao Nóng 2H"
          title="Nhắn tin Zalo OA Yến Sào Hà Mi - Giao Nóng 2H"
          className="relative flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-[#0068FF] border-2 border-[#0068FF]/60 shadow-md hover:border-[#0068FF] transition-colors cursor-pointer"
        >
          <svg
            viewBox="0 0 40 40"
            className="w-6 h-6 md:w-7 md:h-7"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="20" cy="20" r="18" fill="#0068FF" />
            <text
              x="20"
              y="24"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="700"
              fontFamily="Arial, sans-serif"
            >
              Zalo
            </text>
          </svg>
        </button>
      </div>

      {/* 3. Nút Chat Messenger (Chỉ hiển thị khi đã cấu hình URL chính thức) */}
      {messengerConfigured && (
        <div className="group relative flex items-center">
          <span
            role="tooltip"
            className="pointer-events-none hidden md:block opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity mr-2.5 whitespace-nowrap rounded bg-[#2B433A] px-3 py-1.5 text-xs font-medium text-white shadow-md"
          >
            Chat Messenger Yến Sào Hà Mi
          </span>
          <button
            type="button"
            onClick={handleMessengerClick}
            data-testid="rail-btn-messenger"
            aria-label="Chat Messenger Yến Sào Hà Mi"
            title="Chat Messenger Yến Sào Hà Mi"
            className="relative flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 md:w-12 md:h-12 rounded-full bg-white text-[#0084FF] border border-[#155132]/25 shadow-md hover:border-[#0084FF] transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 36 36"
              className="w-6 h-6"
              aria-hidden="true"
              focusable="false"
            >
              <path
                fill="#0084FF"
                d="M18 3C9.716 3 3 9.216 3 16.884c0 4.37 2.183 8.268 5.596 10.816.29.217.466.56.476.925l.097 2.893a1.2 1.2 0 0 0 1.683 1.06l3.228-1.425a1.2 1.2 0 0 1 .802-.063c1.002.275 2.059.424 3.118.424 8.284 0 15-6.216 15-13.884S26.284 3 18 3z"
              />
              <path
                fill="#FFFFFF"
                d="m10.65 21.02 4.41-7.01a2.25 2.25 0 0 1 3.255-.6l3.505 2.628a.9.9 0 0 0 1.085-.004l4.735-3.595c.632-.48 1.458.277 1.033.95l-4.41 7.01a2.25 2.25 0 0 1-3.255.6l-3.505-2.628a.9.9 0 0 0-1.085.004l-4.735 3.595c-.632.48-1.458-.277-1.033-.95z"
              />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
