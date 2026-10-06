import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getOrderRequestByReference, syncDbFromCloud } from "@/db";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { OrderConfirmationClientFallback } from "@/components/OrderConfirmationClientFallback";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đã Nhận Yêu Cầu Đặt Yến | Yến Sào Hà Mi",
  description:
    "Yêu cầu đặt Yến Tươi Chưng Nóng của bạn đã được hệ thống Hà Mi ghi nhận và đang chờ nhân viên liên hệ xác nhận.",
};

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
  REFUNDED: "Đã hoàn tiền",
};

function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0đ";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

interface YeuCauDaNhanProps {
  searchParams: Promise<{ ref?: string; token?: string }>;
}

export default async function YeuCauDaNhanPage({
  searchParams,
}: YeuCauDaNhanProps) {
  const params = await searchParams;
  const refCode = (params.ref || "").trim().toUpperCase();
  const token = (params.token || "").trim();

  if (refCode && token) {
    await syncDbFromCloud(true);
  }

  const order =
    refCode && token
      ? getOrderRequestByReference({
          referenceCode: refCode,
          lookupToken: token,
          isStaff: false,
        })
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:py-14">
      {order ? (
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
                  {ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}
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
                {order.referenceCode}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#BD9342]/45 bg-[#FFFCF4] p-4 text-xs leading-relaxed text-[#2B433A]">
            <p className="font-bold text-[#155132]">
              Quy trình xác nhận đơn tại Yến Sào Hà Mi:
            </p>
            <p className="mt-1">
              Yêu cầu của bạn đang ở trạng thái{" "}
              <strong className="text-[#155132]">Chờ Hà Mi xác nhận</strong>. Bếp Hà
              Mi chỉ bắt đầu chưng yến và hẹn giờ giao chính thức sau khi nhân viên
              liên hệ qua số điện thoại{" "}
              <strong className="text-[#155132]">{order.buyerPhone}</strong>.
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
                Ngày: {order.requestedDate}
              </p>
              <p className="mt-0.5 text-xs text-[#2B433A]">
                Khung giờ: {order.slotLabelSnapshot}
              </p>
              <p className="mt-2 text-xs text-[#2B433A]">
                Thanh toán:{" "}
                <strong className="text-[#155132]">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus] ??
                    order.paymentStatus}
                </strong>
              </p>
            </div>

            <div className="rounded-2xl border border-[#155132]/15 p-4">
              <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#155132]">
                <MapPin className="h-4 w-4 text-[#BD9342]" />
                Thông tin người nhận
              </h2>
              <p className="mt-2 text-sm font-bold text-[#155132]">
                {order.recipientName} ({order.recipientPhone})
              </p>
              <p className="mt-0.5 text-xs text-[#2B433A]">
                {order.addressDetail} ({order.zoneNameSnapshot})
              </p>
              {order.orderPurpose === "GIFT" && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#FFFCF4] border border-[#BD9342]/45 px-2 py-0.5 text-[11px] font-semibold text-[#155132]">
                  <Gift className="h-3 w-3 text-[#BD9342]" />
                  Đơn quà biếu • Người tặng:{" "}
                  {order.giftSenderName || order.buyerName}
                </p>
              )}
            </div>
          </div>

          {order.orderPurpose === "GIFT" && order.giftMessage && (
            <div className="mt-4 rounded-2xl border border-[#BD9342]/40 bg-[#FFFCF4] p-4">
              <span className="text-xs font-bold text-[#155132]">
                Lời nhắn trên thiệp quà Hà Mi:
              </span>
              <p className="mt-1 font-serif-display text-sm italic text-[#2B433A]">
                “{order.giftMessage}”
              </p>
            </div>
          )}

          {/* Items list */}
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#155132]">
              Chi tiết món yến đã yêu cầu
            </h2>
            <div className="mt-3 divide-y divide-[#155132]/10 rounded-2xl border border-[#155132]/15 px-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 text-xs sm:text-sm"
                >
                  <div>
                    <p className="font-bold text-[#155132]">
                      {item.productNameSnapshot} × {item.quantity}
                    </p>
                    <p className="text-xs text-[#2B433A]/85">
                      Thố {item.volumeMlSnapshot}ml • {item.variantNameSnapshot}{" "}
                      • {item.selectedOptionSnapshot}
                    </p>
                  </div>
                  <span className="font-bold text-[#155132]">
                    {formatVnd(item.lineTotalSnapshot)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div className="mt-6 rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/35 p-4 text-sm">
            <div className="flex justify-between text-xs text-[#2B433A]">
              <span>Tạm tính món yến:</span>
              <span className="font-semibold text-[#155132]">
                {formatVnd(order.subtotalVnd)}
              </span>
            </div>
            <div className="mt-1.5 flex justify-between gap-2 text-xs text-[#2B433A]">
              <span className="shrink-0">Phí giao dự kiến:</span>
              <span className="text-right font-semibold text-[#155132]">
                {order.shippingFeeVnd !== null
                  ? formatVnd(order.shippingFeeVnd)
                  : order.shippingFeeNote}
              </span>
            </div>
            <div className="mt-3 flex items-baseline justify-between border-t border-[#155132]/15 pt-3">
              <span className="font-bold text-[#155132]">
                {!order.isTotalFinal
                  ? "Tổng tạm tính (chưa gồm phí giao):"
                  : "Tổng tạm tính (Giá mẫu):"}
              </span>
              <span className="font-serif-display text-lg font-bold text-[#155132]">
                {formatVnd(order.totalVnd)}
              </span>
            </div>
          </div>

          {/* Token reminder for safe self-lookup */}
          <div className="mt-5 rounded-xl border border-[#155132]/15 bg-white p-3.5 text-xs text-[#2B433A]">
            <span className="font-semibold text-[#155132]">
              Mã bảo mật tra cứu đơn của bạn:
            </span>{" "}
            <code className="rounded bg-[#FFFCF4] border border-[#BD9342]/30 px-1.5 py-0.5 font-mono text-[#155132]">
              {token}
            </code>{" "}
            (Lưu lại đường dẫn này nếu bạn muốn xem lại tiến độ xác nhận đơn).
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
      ) : (
        <OrderConfirmationClientFallback refCode={refCode} token={token} />
      )}
    </div>
  );
}
