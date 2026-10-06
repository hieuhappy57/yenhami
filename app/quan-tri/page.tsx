"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Lock,
  LogOut,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import type {
  DeliverySlotRecord,
  OrderStatus,
  PaymentStatus,
  ProductRecord,
  ProductStatus,
} from "@/db/schema";

interface StaffInfo {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface AdminOrderItem {
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
}

interface AdminOrderHistory {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  fromPaymentStatus: string | null;
  toPaymentStatus: string;
  changedByStaffUsername: string;
  changedByStaffName: string;
  note: string;
  createdAt: string;
}

interface AdminOrderRecord {
  id: string;
  referenceCode: string;
  orderPurpose: "SELF" | "GIFT";
  buyerName: string;
  buyerPhone: string;
  buyerNote: string | null;
  recipientName: string;
  recipientPhone: string;
  giftSenderName: string | null;
  giftMessage: string | null;
  hidePriceOnReceipt: boolean;
  zoneId: string;
  zoneNameSnapshot: string;
  addressDetail: string;
  requestedDate: string;
  slotId: string;
  slotLabelSnapshot: string;
  subtotalVnd: number;
  shippingFeeVnd: number | null;
  shippingFeeNote: string;
  totalVnd: number;
  isTotalFinal: boolean;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  isDemoOrder: boolean;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  history: AdminOrderHistory[];
}

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "PENDING_CONFIRMATION", label: "Chờ Hà Mi xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận lịch chưng" },
  { value: "PREPARING", label: "Bếp đang chưng nóng" },
  { value: "DELIVERING", label: "Đang giao nóng" },
  { value: "COMPLETED", label: "Đã giao hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy (Trả lại chỗ ca bếp)" },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Chưa thu tiền" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Đang phục vụ (AVAILABLE)" },
  { value: "OUT_OF_STOCK", label: "Tạm hết ca này (OUT_OF_STOCK)" },
  {
    value: "PENDING_DATA_APPROVAL",
    label: "Chờ duyệt giá/định lượng (PENDING_DATA_APPROVAL)",
  },
];

function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Chưa chốt";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export default function QuanTriPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [username, setUsername] = useState("hami_staff");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"orders" | "catalog">("orders");
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [slots, setSlots] = useState<DeliverySlotRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Per-order draft state for status updates
  const [draftOrderStatus, setDraftOrderStatus] = useState<
    Record<string, OrderStatus>
  >({});
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<
    Record<string, PaymentStatus>
  >({});
  const [draftShippingFee, setDraftShippingFee] = useState<
    Record<string, string>
  >({});
  const [draftNote, setDraftNote] = useState<Record<string, string>>({});

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [ordersRes, catalogRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/catalog"),
      ]);
      if (ordersRes.ok) {
        const ordersData = (await ordersRes.json()) as {
          orders?: AdminOrderRecord[];
        };
        const fetchedOrders = ordersData.orders || [];
        setOrders(fetchedOrders);
        const initOrdStatus: Record<string, OrderStatus> = {};
        const initPayStatus: Record<string, PaymentStatus> = {};
        const initFee: Record<string, string> = {};
        for (const o of fetchedOrders) {
          initOrdStatus[o.referenceCode] = o.orderStatus;
          initPayStatus[o.referenceCode] = o.paymentStatus;
          initFee[o.referenceCode] =
            o.shippingFeeVnd !== null ? String(o.shippingFeeVnd) : "";
        }
        setDraftOrderStatus(initOrdStatus);
        setDraftPaymentStatus(initPayStatus);
        setDraftShippingFee(initFee);
      }
      if (catalogRes.ok) {
        const catData = (await catalogRes.json()) as {
          products?: ProductRecord[];
          slots?: DeliverySlotRecord[];
        };
        setProducts(catData.products || []);
        setSlots(catData.slots || []);
      }
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data: { authenticated?: boolean; staff?: StaffInfo }) => {
        if (data.authenticated && data.staff) {
          setStaff(data.staff);
          loadDashboardData();
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => setCheckingAuth(false));
  }, [loadDashboardData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      staff?: StaffInfo;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok || !data.staff) {
      setAuthError(data.errorMessage || "Đăng nhập không thành công.");
      return;
    }
    setStaff(data.staff);
    setPassword("");
    loadDashboardData();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setStaff(null);
    setOrders([]);
  };

  const handleUpdateOrder = async (referenceCode: string) => {
    setFeedbackMsg(null);
    const newOrderStatus = draftOrderStatus[referenceCode];
    const newPaymentStatus = draftPaymentStatus[referenceCode];
    const feeStr = draftShippingFee[referenceCode];
    const note = draftNote[referenceCode] || "";

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceCode,
        newOrderStatus,
        newPaymentStatus,
        confirmedShippingFeeVnd: feeStr === "" ? undefined : Number(feeStr),
        note,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; errorMessage?: string };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Cập nhật đơn thất bại.");
      return;
    }
    setFeedbackMsg(`Đã cập nhật yêu cầu ${referenceCode} thành công.`);
    setDraftNote((prev) => ({ ...prev, [referenceCode]: "" }));
    loadDashboardData();
  };

  const handleUpdateProductStatus = async (
    product: ProductRecord,
    newStatus: ProductStatus
  ) => {
    setFeedbackMsg(null);
    const nextPrice =
      newStatus === "PENDING_DATA_APPROVAL"
        ? null
        : product.priceVnd ?? 145000;
    const res = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "product",
        productId: product.id,
        status: newStatus,
        priceVnd: nextPrice,
      }),
    });
    if (res.ok) {
      setFeedbackMsg(`Đã cập nhật trạng thái món "${product.name}".`);
      loadDashboardData();
    }
  };

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-[#2B433A]">
        Đang kiểm tra phiên đăng nhập nhân viên Hà Mi...
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 pr-16 md:pr-4">
        <div className="rounded-3xl border border-[#155132]/20 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#155132] text-[#FFFCF4]">
              <Lock className="h-5 w-5 text-[#BD9342]" />
            </div>
            <div>
              <h1 className="font-serif-display text-xl font-semibold text-[#155132]">
                Quản Trị Bếp & CSKH Hà Mi
              </h1>
              <p className="text-xs text-[#2B433A]/80">
                Đăng nhập nội bộ để xác nhận yêu cầu đặt yến & điều phối ca bếp
              </p>
            </div>
          </div>

          {authError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-[#155132]"
              >
                Tài khoản nhân viên
              </label>
              <input
                id="admin-username"
                data-testid="admin-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#155132]/25 px-3.5 py-2.5 text-sm text-[#2B433A]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#155132]"
              >
                Mật khẩu
              </label>
              <input
                id="admin-password"
                data-testid="admin-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu nhân viên..."
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#155132]/25 px-3.5 py-2.5 text-sm text-[#2B433A]"
              />
            </div>

            <button
              type="submit"
              data-testid="admin-login-btn"
              className="w-full min-h-[48px] rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-3 text-sm font-bold text-[#FFFCF4] hover:bg-[#0e3b23] cursor-pointer"
            >
              Đăng nhập Quản trị
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 pr-16 md:pr-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#155132]/15 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 text-xs font-semibold text-[#155132]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#BD9342]" />
            Nhân viên: {staff.displayName} ({staff.username})
          </span>
          <h1 className="mt-2 font-serif-display text-2xl font-semibold text-[#155132]">
            Điều Phối Yêu Cầu Đặt Yến & Năng Lực Ca Bếp
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#155132]/25 bg-white px-3.5 py-2 text-xs font-semibold text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới ({orders.length} đơn)
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-800 hover:bg-red-100 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Đăng xuất
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          role="status"
          data-testid="admin-feedback-banner"
          className="mt-4 flex items-center justify-between rounded-xl border border-[#155132]/25 bg-[#155132] px-4 py-3 text-xs font-semibold text-[#FFFCF4]"
        >
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mt-6 flex gap-2 border-b border-[#155132]/15 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <ClipboardList className="h-4 w-4 text-[#BD9342]" />
          Danh sách Yêu cầu đặt món ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <Package className="h-4 w-4 text-[#BD9342]" />
          Trạng thái Món & Ca bếp ({products.length} món)
        </button>
      </div>

      {loadingData && (
        <p className="mt-4 text-xs text-[#2B433A]">Đang tải dữ liệu...</p>
      )}

      {/* TAB 1: ORDERS */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#155132]/25 bg-white p-8 text-center text-sm text-[#2B433A]">
              Hiện chưa có yêu cầu đặt món nào trong hệ thống.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                data-testid={`admin-order-card-${order.referenceCode}`}
                className="rounded-2xl border border-[#155132]/20 bg-white p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#155132]/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-[#155132]">
                      {order.referenceCode}
                    </span>
                    <span className="rounded-full bg-[#FFFCF4] border border-[#BD9342]/45 px-2.5 py-0.5 text-[11px] font-semibold text-[#8A6632]">
                      {order.orderPurpose === "GIFT"
                        ? "Gửi quà biếu"
                        : "Mua dùng"}
                    </span>
                    <span className="text-xs text-[#2B433A]/75">
                      Ngày nhận: <strong>{order.requestedDate}</strong> •{" "}
                      {order.slotLabelSnapshot}
                    </span>
                  </div>
                  <div className="text-right text-xs font-bold text-[#155132]">
                    Tổng: {formatVnd(order.totalVnd)}{" "}
                    {!order.isTotalFinal && "(Chưa chốt phí giao)"}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                  <div>
                    <p className="font-bold text-[#155132]">
                      Người đặt & Liên hệ xác nhận:
                    </p>
                    <p className="mt-1 text-[#2B433A]">
                      {order.buyerName} — <strong>{order.buyerPhone}</strong>
                    </p>
                    <p className="mt-1 text-[#2B433A]">
                      Người nhận: {order.recipientName} ({order.recipientPhone})
                    </p>
                    <p className="mt-1 text-[#2B433A]">
                      Địa chỉ: {order.addressDetail} ({order.zoneNameSnapshot})
                    </p>
                    {order.giftMessage && (
                      <p className="mt-1 italic text-[#8A6632]">
                        Thiệp: “{order.giftMessage}”
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-[#155132]">Danh sách món yến:</p>
                    <ul className="mt-1 space-y-1 text-[#2B433A]">
                      {order.items.map((it) => (
                        <li key={it.id}>
                          • <strong>{it.productNameSnapshot}</strong> ×{" "}
                          {it.quantity} ({it.variantNameSnapshot},{" "}
                          {it.selectedOptionSnapshot}) —{" "}
                          {formatVnd(it.lineTotalSnapshot)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5 rounded-xl bg-[#FFFCF4] border border-[#BD9342]/35 p-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#155132]">
                        Trạng thái xử lý đơn:
                      </label>
                      <select
                        data-testid={`admin-status-select-${order.referenceCode}`}
                        value={
                          draftOrderStatus[order.referenceCode] ||
                          order.orderStatus
                        }
                        onChange={(e) =>
                          setDraftOrderStatus((prev) => ({
                            ...prev,
                            [order.referenceCode]: e.target
                              .value as OrderStatus,
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-[#155132]/25 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#155132]"
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#155132]">
                          Thanh toán:
                        </label>
                        <select
                          value={
                            draftPaymentStatus[order.referenceCode] ||
                            order.paymentStatus
                          }
                          onChange={(e) =>
                            setDraftPaymentStatus((prev) => ({
                              ...prev,
                              [order.referenceCode]: e.target
                                .value as PaymentStatus,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-[#155132]/25 bg-white px-2 py-1.5 text-xs text-[#2B433A]"
                        >
                          {PAYMENT_STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#155132]">
                          Phí giao (VNĐ):
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={5000}
                          value={draftShippingFee[order.referenceCode] ?? ""}
                          onChange={(e) =>
                            setDraftShippingFee((prev) => ({
                              ...prev,
                              [order.referenceCode]: e.target.value,
                            }))
                          }
                          placeholder="VD: 25000"
                          className="mt-1 w-full rounded-lg border border-[#155132]/25 bg-white px-2 py-1.5 text-xs text-[#2B433A]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={draftNote[order.referenceCode] || ""}
                        onChange={(e) =>
                          setDraftNote((prev) => ({
                            ...prev,
                            [order.referenceCode]: e.target.value,
                          }))
                        }
                        placeholder="Ghi chú xác nhận (VD: Đã gọi chốt giao 9h30)..."
                        className="w-full rounded-lg border border-[#155132]/25 bg-white px-2.5 py-1.5 text-xs text-[#2B433A]"
                      />
                    </div>

                    <button
                      type="button"
                      data-testid={`admin-save-order-${order.referenceCode}`}
                      onClick={() => handleUpdateOrder(order.referenceCode)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#155132] px-3 py-2 text-xs font-bold text-[#FFFCF4] hover:bg-[#0e3b23] cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#BD9342]" />
                      Lưu cập nhật đơn
                    </button>
                  </div>
                </div>

                {/* History Audit Log */}
                {order.history.length > 0 && (
                  <div className="mt-3 border-t border-[#155132]/10 pt-2.5 text-[11px] text-[#2B433A]/75">
                    <span className="font-semibold text-[#155132]">
                      Lịch sử trạng thái mới nhất:
                    </span>{" "}
                    {order.history[0].toStatus} ({order.history[0].toPaymentStatus}
                    ) — {order.history[0].note} (bởi{" "}
                    {order.history[0].changedByStaffName})
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: CATALOG & SLOTS */}
      {activeTab === "catalog" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <h2 className="font-serif-display text-lg font-semibold text-[#155132]">
              Danh mục Món Yến Tươi Chưng Nóng
            </h2>
            {products.map((prod) => (
              <div
                key={prod.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#155132]/15 bg-white p-3.5 text-xs"
              >
                <div>
                  <p className="font-bold text-[#155132]">{prod.name}</p>
                  <p className="text-[#2B433A]/80">
                    Thố {prod.volumeMl}ml • Giá mẫu: {formatVnd(prod.priceVnd)}
                  </p>
                </div>
                <select
                  value={prod.status}
                  onChange={(e) =>
                    handleUpdateProductStatus(
                      prod,
                      e.target.value as ProductStatus
                    )
                  }
                  className="rounded-lg border border-[#155132]/25 bg-[#FFFCF4] px-2.5 py-1.5 text-xs font-semibold text-[#155132]"
                >
                  {PRODUCT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-3 lg:col-span-5">
            <h2 className="font-serif-display text-lg font-semibold text-[#155132]">
              Khung giờ Ca bếp (Mặc định ngày mai)
            </h2>
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="rounded-xl border border-[#155132]/15 bg-white p-3.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-[#155132]">
                    <Clock className="h-3.5 w-3.5 text-[#BD9342]" />
                    {slot.label} ({slot.timeWindow})
                  </span>
                  <span className="rounded-full bg-[#FFFCF4] border border-[#BD9342]/40 px-2 py-0.5 text-[11px] font-semibold text-[#155132]">
                    Đã đặt {slot.reservedBowls}/{slot.maxCapacityBowls} thố
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
