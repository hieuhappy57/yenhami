"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/db/schema";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: "Chờ Hà Mi xác nhận",
  CONFIRMED: "Đã xác nhận lịch chưng",
  PREPARING: "Bếp đang chưng nóng",
  DELIVERING: "Đang giao nóng",
  COMPLETED: "Đã giao hoàn tất",
  CANCELLED: "Đã hủy yêu cầu",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Chưa thu tiền (Xác nhận trước khi thanh toán)",
  PAID: "Đã thanh toán",
  PARTIALLY_PAID: "Đã thu một phần",
  PARTIALLY_REFUNDED: "Đã hoàn một phần",
  REFUNDED: "Đã hoàn tiền",
};

function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0đ";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export interface OrderConfirmationSnapshot {
  id: string;
  referenceCode: string;
  lookupToken?: string;
  orderPurpose?: "SELF" | "GIFT";
  buyerName?: string;
  buyerPhone?: string;
  buyerNote?: string | null;
  recipientName?: string;
  recipientPhone?: string;
  giftSenderName?: string | null;
  giftMessage?: string | null;
  hidePriceOnReceipt?: boolean;
  addressDetail?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalVnd: number;
  shippingFeeVnd: number | null;
  shippingFeeNote: string;
  totalVnd: number;
  isTotalFinal: boolean;
  requestedDate: string;
  slotLabelSnapshot: string;
  zoneNameSnapshot: string;
  createdAt: string;
  items?: {
    id: string;
    productId: string;
    variantId: string;
    productNameSnapshot: string;
    variantNameSnapshot: string;
    volumeMlSnapshot: number;
    ingredientsSnapshot: string;
    selectedOptionSnapshot: string;
    unitPriceSnapshot: number;
    quantity: number;
    lineTotalSnapshot: number;
  }[];
}

export function OrderConfirmationClientFallback({
  refCode,
  token,
}: {
  refCode: string;
  token: string;
}) {
  const [cachedOrder, setCachedOrder] =
    useState<OrderConfirmationSnapshot | null>(null);
  const [checkedStorage, setCheckedStorage] = useState(false);

  useEffect(() => {
    const normalizedRef = (refCode || "").trim().toUpperCase();
    const normalizedToken = (token || "").trim();

    if (!normalizedRef || !normalizedToken) {
      setCheckedStorage(true);
      return;
    }

    try {
      const storageKey = `hami_order_${normalizedRef}`;
      const raw =
        window.sessionStorage.getItem(storageKey) ||
        window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as OrderConfirmationSnapshot;
        if (
          parsed &&
          parsed.referenceCode?.toUpperCase() === normalizedRef &&
          (!parsed.lookupToken || parsed.lookupToken === normalizedToken)
        ) {
          setCachedOrder(parsed);
          setCheckedStorage(true);
          return;
        }
      }
    } catch {
      // ignore storage errors
    }

    // Also try fetching from /api/orders in case the API lambda has it
    fetch(
      `/api/orders?ref=${encodeURIComponent(normalizedRef)}&token=${encodeURIComponent(normalizedToken)}`
    )
      .then((res) => res.json())
      .then((data: { ok?: boolean; order?: OrderConfirmationSnapshot }) => {
        if (data?.ok && data.order) {
          setCachedOrder(data.order);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setCheckedStorage(true);
      });
  }, [refCode, token]);

  const [recentOrders, setRecentOrders] = useState<OrderConfirmationSnapshot[]>([]);

  useEffect(() => {
    try {
      const found: OrderConfirmationSnapshot[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("hami_order_")) {
          const val = window.localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val) as OrderConfirmationSnapshot;
            if (parsed && parsed.referenceCode) {
              found.push(parsed);
            }
          }
        }
      }
      found.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      setRecentOrders(found.slice(0, 5));
    } catch {
      // ignore
    }
  }, []);

  if (cachedOrder) {
    return (
      <div
        data-testid="order-confirmation-card"
        className="rounded-3xl border border-[#155132]/20 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#155132]/12 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#155132] text-white">
              <CheckCircle2 className="h-6 w-6 text-[#BD9342]" />
            </div>
            <div>
              <span
                data-testid="order-status-badge"
                className="inline-block rounded-full bg-[#FFFCF4] border border-[#BD9342]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#8A6632]"
              >
                {ORDER_STATUS_LABELS[cachedOrder.orderStatus] ??
                  cachedOrder.orderStatus}
              </span>
              <h1 className="mt-1 font-serif-display text-xl font-semibold text-[#155132] sm:text-2xl">
                Đã nhận yêu cầu, Hà Mi sẽ xác nhận đơn
              </h1>
            </div>
          </div>
          <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/35 px-3.5 py-2 text-right">
            <span className="block text-[11px] text-[#2B433A]/80">
              Mã yêu cầu
            </span>
            <span
              data-testid="order-reference-code"
              className="font-mono text-sm font-bold text-[#155132]"
            >
              {cachedOrder.referenceCode}
            </span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#BD9342]/45 bg-[#FFFCF4] p-4 text-xs leading-relaxed text-[#2B433A]">
          <p className="font-bold text-[#155132]">
            Quy trình xác nhận đơn tại Yến Sào Hà Mi:
          </p>
          <p className="mt-1">
            Yêu cầu của bạn đang ở trạng thái{" "}
            <strong className="text-[#155132]">Chờ Hà Mi xác nhận</strong>. Bếp
            Hà Mi chỉ bắt đầu chưng yến và hẹn giờ giao chính thức sau khi nhân
            viên liên hệ qua số điện thoại{" "}
            <strong className="text-[#155132]">
              {cachedOrder.buyerPhone || "của bạn"}
            </strong>
            .
          </p>
        </div>

        {/* Order Details */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#155132]/15 p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#155132]">
              <Clock className="h-4 w-4 text-[#BD9342]" />
              Lịch chưng & Giao dự kiến
            </h2>
            <p className="mt-2 text-sm font-bold text-[#155132]">
              Ngày: {cachedOrder.requestedDate}
            </p>
            <p className="mt-0.5 text-xs text-[#2B433A]">
              Khung giờ: {cachedOrder.slotLabelSnapshot}
            </p>
            <p className="mt-2 text-xs text-[#2B433A]">
              Thanh toán:{" "}
              <strong className="text-[#155132]">
                {PAYMENT_STATUS_LABELS[cachedOrder.paymentStatus] ??
                  cachedOrder.paymentStatus}
              </strong>
            </p>
          </div>

          <div className="rounded-2xl border border-[#155132]/15 p-4">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#155132]">
              <MapPin className="h-4 w-4 text-[#BD9342]" />
              Thông tin người nhận
            </h2>
            <p className="mt-2 text-sm font-bold text-[#155132]">
              {cachedOrder.recipientName || cachedOrder.buyerName || "Quý khách"}
              {cachedOrder.recipientPhone || cachedOrder.buyerPhone
                ? ` (${cachedOrder.recipientPhone || cachedOrder.buyerPhone})`
                : ""}
            </p>
            <p className="mt-0.5 text-xs text-[#2B433A]">
              {cachedOrder.addressDetail
                ? `${cachedOrder.addressDetail} (${cachedOrder.zoneNameSnapshot})`
                : cachedOrder.zoneNameSnapshot}
            </p>
            {cachedOrder.orderPurpose === "GIFT" && (
              <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#FFFCF4] border border-[#BD9342]/45 px-2 py-0.5 text-[11px] font-semibold text-[#155132]">
                <Gift className="h-3 w-3 text-[#BD9342]" />
                Đơn quà biếu • Người tặng:{" "}
                {cachedOrder.giftSenderName || cachedOrder.buyerName}
              </p>
            )}
          </div>
        </div>

        {cachedOrder.orderPurpose === "GIFT" && cachedOrder.giftMessage && (
          <div className="mt-4 rounded-2xl border border-[#BD9342]/40 bg-[#FFFCF4] p-4">
            <span className="text-xs font-bold text-[#155132]">
              Lời nhắn trên thiệp quà Hà Mi:
            </span>
            <p className="mt-1 font-serif-display text-sm italic text-[#2B433A]">
              “{cachedOrder.giftMessage}”
            </p>
          </div>
        )}

        {/* Items list */}
        {cachedOrder.items && cachedOrder.items.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#155132]">
              Chi tiết món yến đã yêu cầu
            </h2>
            <div className="mt-3 divide-y divide-[#155132]/10 rounded-2xl border border-[#155132]/15 px-4">
              {cachedOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-bold text-[#155132]">
                      {item.productNameSnapshot} × {item.quantity}
                    </p>
                    <p className="text-xs text-[#2B433A]/85">
                      {item.volumeMlSnapshot <= 100 ? "Hũ" : "Thố"}{" "}
                      {item.volumeMlSnapshot}ml • {item.variantNameSnapshot} •{" "}
                      {item.selectedOptionSnapshot}
                    </p>
                  </div>
                  <span className="font-bold text-[#155132]">
                    {formatVnd(item.lineTotalSnapshot)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total summary */}
        <div className="mt-6 rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/35 p-4 text-sm">
          <div className="flex justify-between text-xs text-[#2B433A]">
            <span>Tạm tính món yến:</span>
            <span className="font-semibold text-[#155132]">
              {formatVnd(cachedOrder.subtotalVnd)}
            </span>
          </div>
          <div className="mt-1.5 flex justify-between gap-2 text-xs text-[#2B433A]">
            <span className="shrink-0">Phí giao dự kiến:</span>
            <span className="text-right font-semibold text-[#155132]">
              {cachedOrder.shippingFeeVnd !== null
                ? formatVnd(cachedOrder.shippingFeeVnd)
                : cachedOrder.shippingFeeNote}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between border-t border-[#155132]/15 pt-3">
            <span className="font-bold text-[#155132]">
              {!cachedOrder.isTotalFinal
                ? "Tổng tạm tính (chưa gồm phí giao):"
                : "Tổng cộng:"}
            </span>
            <span className="font-serif-display text-lg font-bold text-[#155132]">
              {formatVnd(cachedOrder.totalVnd)}
            </span>
          </div>
        </div>

        {/* Token reminder for safe self-lookup */}
        <div className="mt-5 rounded-xl border border-[#155132]/15 bg-white p-3.5 text-xs text-[#2B433A]">
          <span className="font-semibold text-[#155132]">
            Tra cứu lại đơn hàng bất cứ lúc nào:
          </span>{" "}
          Nhập Mã đơn{" "}
          <code className="rounded bg-[#FFFCF4] border border-[#BD9342]/30 px-1.5 py-0.5 font-mono font-bold text-[#155132]">
            {cachedOrder.referenceCode}
          </code>{" "}
          kèm Số điện thoại đặt hàng của bạn tại mục Tra cứu đơn.
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/#menu-chu-luc"
            className="rounded-xl border border-[#155132]/25 px-4 py-2.5 text-xs font-bold text-[#155132] hover:bg-[#FFFCF4]"
          >
            ← Quay về Thực đơn Hà Mi
          </Link>
          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-2.5 text-xs font-bold text-[#FFFCF4] hover:bg-[#0e3b23]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#BD9342]" />
            <span>Tạo yêu cầu đặt món mới</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#155132]/20 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/40 text-[#155132]">
          <Search className="h-5 w-5 text-[#BD9342]" />
        </div>
        <div>
          <h1 className="font-serif-display text-xl font-semibold text-[#155132]">
            Tra cứu Yêu Cầu Đặt Yến Hà Mi
          </h1>
          <p className="text-xs text-[#2B433A]/85">
            Nhập Mã đơn hàng và Số điện thoại đặt hàng (hoặc mã bảo mật) để xem trạng thái đơn.
          </p>
        </div>
      </div>

      {/* 1-Click Recent Orders on this device */}
      {recentOrders.length > 0 && (
        <div className="mt-5 rounded-2xl border border-[#BD9342]/45 bg-[#FFFCF4] p-4">
          <p className="text-xs font-bold text-[#155132]">
            Đơn hàng bạn vừa đặt gần đây trên thiết bị này (Bấm để xem ngay):
          </p>
          <div className="mt-2.5 space-y-2">
            {recentOrders.map((ord) => (
              <button
                key={ord.referenceCode}
                type="button"
                onClick={() => setCachedOrder(ord)}
                className="flex w-full items-center justify-between rounded-xl border border-[#155132]/15 bg-white px-3.5 py-2.5 text-left text-xs transition hover:border-[#155132] cursor-pointer"
              >
                <div>
                  <span className="font-mono font-bold text-[#155132]">
                    {ord.referenceCode}
                  </span>
                  <span className="ml-2 text-[#2B433A]/80">
                    • Giao ngày {ord.requestedDate}
                  </span>
                </div>
                <span className="font-bold text-[#8A6632] underline">
                  {formatVnd(ord.totalVnd)} →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {checkedStorage && (refCode || token) && (
        <div
          role="alert"
          data-testid="lookup-denied-alert"
          className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950"
        >
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p>
            Không tìm thấy yêu cầu hoặc số điện thoại / mã tra cứu không khớp. Vui lòng
            kiểm tra lại hai thông tin bên dưới.
          </p>
        </div>
      )}

      <form method="GET" action="/yeu-cau-da-nhan" className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="lookup-ref"
            className="block text-xs font-semibold text-[#155132]"
          >
            Mã yêu cầu (Ví dụ: HM-261006-A1B2C3D4) *
          </label>
          <input
            id="lookup-ref"
            name="ref"
            type="text"
            required
            defaultValue={refCode}
            placeholder="HM-..."
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#155132]/25 px-3.5 py-2.5 text-base sm:text-sm font-mono text-[#2B433A] focus:border-[#155132] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="lookup-token"
            className="block text-xs font-semibold text-[#155132]"
          >
            Số điện thoại đặt hàng (hoặc Mã bảo mật tra cứu) *
          </label>
          <input
            id="lookup-token"
            name="token"
            type="text"
            autoComplete="tel"
            required
            defaultValue={token}
            placeholder="Nhập số điện thoại đặt đơn (VD: 0905123456)..."
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#155132]/25 px-3.5 py-2.5 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-3 text-sm font-bold text-[#FFFCF4] transition hover:bg-[#0e3b23] cursor-pointer"
        >
          Xem trạng thái yêu cầu
        </button>
      </form>
    </div>
  );
}
