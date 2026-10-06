"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "./CartProvider";

export function MobileStickyCartBar() {
  const pathname = usePathname();
  const { totalBowls, estimatedSubtotalVnd } = useCart();

  if (
    totalBowls === 0 ||
    pathname === "/dat-hang" ||
    pathname === "/gio-hang" ||
    pathname?.startsWith("/quan-tri")
  ) {
    return null;
  }

  return (
    <div
      data-testid="mobile-sticky-cart-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#155132] text-[#FFFCF4] border-t-2 border-[#BD9342] px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom,0px))] shadow-2xl"
    >
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#FFFCF4]/15 border border-[#BD9342] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 text-[#BD9342]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-[#FFFCF4]/90">
              Đã chọn <strong>{totalBowls} thố</strong>{" "}
              {totalBowls >= 2 ? "• Miễn phí giao hàng" : "• Đặt 2 thố Free Ship"}
            </p>
            <p className="text-sm font-bold text-[#FFFCF4]">
              Tạm tính: {estimatedSubtotalVnd.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>
        <Link
          href="/dat-hang"
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-md bg-[#FFFCF4] text-[#155132] font-semibold text-sm shadow hover:bg-[#DBF1EE] transition-colors shrink-0"
        >
          <span>Gửi yêu cầu</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
