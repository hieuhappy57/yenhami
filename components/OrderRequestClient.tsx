"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  Minus,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "./CartProvider";
import type {
  DeliverySlotRecord,
  ProductRecord,
  ServiceZoneRecord,
} from "@/db/schema";
import type { ServerQuoteResult, SubmitOrderRequestOutput } from "@/db";

interface OrderRequestClientProps {
  initialProducts: ProductRecord[];
  initialZones: ServiceZoneRecord[];
  initialSlots: DeliverySlotRecord[];
  defaultDate: string;
}

function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "0đ";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function OrderRequestClient({
  initialProducts,
  initialSlots,
  defaultDate,
}: OrderRequestClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    items,
    totalBowls,
    estimatedSubtotalVnd,
    orderPurpose,
    setOrderPurpose,
    updateQuantity,
    updateOption,
    removeItem,
    clearCart,
  } = useCart();

  // Initialize gift mode if query param ?gift=1 is passed
  useEffect(() => {
    if (searchParams.get("gift") === "1") {
      setOrderPurpose("GIFT");
    }
  }, [searchParams, setOrderPurpose]);

  // Date & Slot state
  const [requestedDate, setRequestedDate] = useState<string>(defaultDate);
  const [slots, setSlots] = useState<DeliverySlotRecord[]>(initialSlots);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotId, setSlotId] = useState<string>(() => {
    const firstAvailable = initialSlots.find(
      (s) => s.isActive && s.remainingBowls > 0 && !s.isPastOrInsufficientLead
    );
    return firstAvailable?.id ?? initialSlots[0]?.id ?? "";
  });

  // Delivery & Gift state (preserved across SELF/GIFT toggles)
  const isGift = orderPurpose === "GIFT";
  const [buyerName, setBuyerName] = useState<string>("");
  const [buyerPhone, setBuyerPhone] = useState<string>("");
  const [buyerNote, setBuyerNote] = useState<string>("");
  const [recipientName, setRecipientName] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [giftSenderName, setGiftSenderName] = useState<string>("");
  const [giftMessage, setGiftMessage] = useState<string>("");
  const [hidePriceOnReceipt, setHidePriceOnReceipt] = useState<boolean>(true);
  const [addressDetail, setAddressDetail] = useState<string>("");

  // Quote & Submit states
  const [serverQuote, setServerQuote] = useState<ServerQuoteResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // Regenerate idempotency key when relevant order inputs change
  useEffect(() => {
    const randomKey = `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setIdempotencyKey(randomKey);
  }, [
    items,
    requestedDate,
    slotId,
    orderPurpose,
    buyerName,
    buyerPhone,
    recipientName,
    recipientPhone,
    addressDetail,
  ]);

  // Fetch slots when date changes
  useEffect(() => {
    if (!requestedDate) return;
    let active = true;
    setLoadingSlots(true);
    fetch(`/api/catalog?date=${encodeURIComponent(requestedDate)}`)
      .then((res) => res.json())
      .then((data: { slots?: DeliverySlotRecord[] }) => {
        if (!active) return;
        if (Array.isArray(data.slots)) {
          const nextSlots = data.slots;
          setSlots(nextSlots);
          setSlotId((prevSlotId) => {
            const currentStillValid = nextSlots.find(
              (s) =>
                s.id === prevSlotId &&
                s.isActive &&
                s.remainingBowls > 0 &&
                !s.isPastOrInsufficientLead
            );
            if (currentStillValid) return prevSlotId;
            const firstAvail = nextSlots.find(
              (s) =>
                s.isActive &&
                s.remainingBowls > 0 &&
                !s.isPastOrInsufficientLead
            );
            return firstAvail?.id ?? prevSlotId;
          });
        }
      })
      .catch(() => {
        // Fallback silently
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [requestedDate]);

  // Fetch authoritative server quote whenever items, date, or slot change
  useEffect(() => {
    if (items.length === 0) {
      setServerQuote(null);
      return;
    }
    let active = true;
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestedDate,
        slotId,
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          selectedOption: item.selectedOption,
        })),
      }),
    })
      .then((res) => res.json())
      .then((quote: ServerQuoteResult) => {
        if (active) setServerQuote(quote);
      })
      .catch(() => {
        // Ignore transient network errors
      });
    return () => {
      active = false;
    };
  }, [items, requestedDate, slotId]);

  const productMap = useMemo(() => {
    const map = new Map<string, ProductRecord>();
    for (const p of initialProducts) {
      map.set(p.id, p);
    }
    return map;
  }, [initialProducts]);

  const hasAvailableSlot = useMemo(
    () =>
      slots.some(
        (s) => s.isActive && s.remainingBowls > 0 && !s.isPastOrInsufficientLead
      ),
    [slots]
  );

  // 1-click auto set 2 bowls to unlock Free Ship
  const handleAutoSetTwoBowlsFreeShip = () => {
    if (items.length === 0) return;
    const first = items[0];
    const needed = Math.max(1, 2 - totalBowls);
    updateQuantity(
      first.productId,
      first.variantId,
      first.selectedOption,
      first.quantity + needed
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    if (items.length === 0) {
      setSubmitError("Vui lòng chọn ít nhất 1 món yến trước khi gửi yêu cầu.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey:
            idempotencyKey ||
            `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          orderPurpose: isGift ? "GIFT" : "SELF",
          buyerName,
          buyerPhone,
          buyerNote,
          recipientName: isGift ? recipientName : buyerName,
          recipientPhone: isGift ? recipientPhone : buyerPhone,
          giftSenderName: isGift ? giftSenderName || buyerName : undefined,
          giftMessage: isGift ? giftMessage : undefined,
          hidePriceOnReceipt: isGift ? hidePriceOnReceipt : false,
          addressDetail,
          requestedDate,
          slotId,
          clientExpectedTotalVnd: serverQuote?.totalVnd,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            selectedOption: item.selectedOption,
          })),
        }),
      });

      const data = (await response.json()) as SubmitOrderRequestOutput;
      if (!response.ok || !data.ok || !data.order) {
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        setSubmitError(
          data.errorMessage ||
            "Không thể gửi yêu cầu lúc này. Vui lòng kiểm tra lại."
        );
        setSubmitting(false);
        return;
      }

      clearCart();
      const refCode = data.order.referenceCode;
      const token = data.order.lookupToken;
      try {
        const storageKey = `hami_order_${refCode.trim().toUpperCase()}`;
        const serialized = JSON.stringify(data.order);
        window.sessionStorage.setItem(storageKey, serialized);
        window.localStorage.setItem(storageKey, serialized);
      } catch {
        // ignore storage quota errors
      }
      router.push(
        `/yeu-cau-da-nhan?ref=${encodeURIComponent(refCode)}&token=${encodeURIComponent(token)}`
      );
    } catch {
      setSubmitError("Lỗi kết nối máy chủ. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[820px] px-4 py-6 lg:py-10">
      {/* Compact Page Title */}
      <div className="mb-5 flex items-baseline justify-between gap-2">
        <div>
          <span className="inline-block rounded-full bg-[#FFE9DD] px-3 py-0.5 text-[11px] font-bold text-[#7C4D2B]">
            Nóng Thơm Trọn Vị • Giao Ngay 2H
          </span>
          <h1 className="mt-1 font-serif-display text-2xl font-bold text-[#1B1B1B] sm:text-3xl">
            Giỏ Hàng & Đặt Món Yến Sào Hà Mi
          </h1>
        </div>
        {items.length > 0 && (
          <Link
            href="/#menu-chu-luc"
            className="rounded-full bg-[#FAF4EB] px-3.5 py-1.5 text-xs font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
          >
            + Chọn thêm món
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div
          data-testid="empty-cart-box"
          className="rounded-3xl bg-white p-8 text-center shadow-2xs"
        >
          <p className="font-serif-display text-lg font-bold text-[#1B1B1B]">
            Chưa có món trong giỏ hàng
          </p>
          <p className="mt-1.5 text-xs sm:text-sm text-[#4A4A4A]">
            Vui lòng chọn món yến từ thực đơn để gửi yêu cầu chưng nóng giao ngay trong 2 giờ.
          </p>
          <Link
            href="/#menu-chu-luc"
            data-testid="empty-cart-menu-cta"
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D78A] to-[#D4AF37] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#1B1B1B] shadow-xs hover:brightness-105 transition"
          >
            Xem thực đơn chọn món →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Compact Selected Dishes Summary + Auto 2-Bowl Free Ship Feature */}
          <section
            aria-label="Món đã chọn"
            className="rounded-3xl bg-white p-4 sm:p-6 space-y-3 shadow-2xs"
          >
            <div className="divide-y divide-[#F0E9DC]">
              {items.map((item) => {
                const product = productMap.get(item.productId);
                const supportedOptions = product?.supportedOptions ?? [];

                return (
                  <div
                    key={`${item.productId}-${item.variantId}-${item.selectedOption}`}
                    data-testid={`checkout-item-${item.slug}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        width={52}
                        height={52}
                        className="h-13 w-13 shrink-0 rounded-2xl bg-[#F8F5EC] object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="block truncate text-xs sm:text-sm font-bold text-[#1B1B1B] hover:text-[#1B4332]"
                        >
                          {item.productName}
                        </Link>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {supportedOptions.length > 1 ? (
                            <select
                              aria-label={`Khẩu vị ${item.productName}`}
                              data-testid={`item-option-${item.slug}`}
                              value={item.selectedOption}
                              onChange={(e) =>
                                updateOption(
                                  item.productId,
                                  item.variantId,
                                  item.selectedOption,
                                  e.target.value
                                )
                              }
                              className="max-w-[160px] sm:max-w-[220px] truncate rounded-full bg-[#FAF4EB] px-2.5 py-0.5 text-base sm:text-xs font-medium text-[#2B433A] focus:outline-none"
                            >
                              {supportedOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] text-[#4A4A4A] truncate">
                              {item.selectedOption}
                            </span>
                          )}

                          <span className="text-xs sm:text-sm font-extrabold text-[#1B1B1B]">
                            {formatVnd(item.unitPriceVnd)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity +/- and Remove */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="inline-flex items-center rounded-full bg-[#FAF4EB] p-0.5">
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${item.productName}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.selectedOption,
                              item.quantity - 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1B4332] hover:bg-white cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="min-w-6 text-center text-xs font-bold text-[#1B1B1B]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Tăng số lượng ${item.productName}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.variantId,
                              item.selectedOption,
                              item.quantity + 1
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1B4332] hover:bg-white cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label={`Xóa ${item.productName}`}
                        onClick={() =>
                          removeItem(
                            item.productId,
                            item.variantId,
                            item.selectedOption
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#2B433A]/70 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Auto 2-Bowl Free Ship Banner / Quick Action */}
            <div
              className={`rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 ${
                totalBowls < 2 ? "bg-[#FFE9DD]" : "bg-[#E2FCF3]"
              }`}
            >
              {totalBowls < 2 ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C4D2B]">
                    <Truck className="h-4 w-4 text-[#7C4D2B] shrink-0" aria-hidden="true" />
                    <span>Đặt từ 2 thố được Miễn phí giao hàng (5km)</span>
                  </span>
                  <button
                    type="button"
                    data-testid="auto-two-bowls-freeship-btn"
                    onClick={handleAutoSetTwoBowlsFreeShip}
                    className="inline-flex items-center gap-1 min-h-[36px] rounded-full bg-[#1B4332] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#133023] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-[#F3D78A]" aria-hidden="true" />
                    <span>Đặt 2 thố • Free Ship</span>
                  </button>
                </>
              ) : (
                <span
                  data-testid="freeship-active-badge"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B4332]"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#1B4332] shrink-0" aria-hidden="true" />
                  <span>
                    Đã áp dụng Free Ship tự động ({totalBowls} thố)
                  </span>
                </span>
              )}
            </div>
          </section>

          {/* 2. Delivery Information & Gift Toggle (Address Only — No Fixed Zone Dropdown) */}
          <section
            aria-label="Thông tin giao hàng"
            className="rounded-3xl bg-white p-4 sm:p-6 space-y-3.5 shadow-2xs"
          >
            {/* Contact Name & Phone */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="buyerName"
                  className="block text-xs font-semibold text-[#155132]"
                >
                  {isGift ? "Họ tên người mua (người tặng) *" : "Họ tên người nhận *"}
                </label>
                <input
                  id="buyerName"
                  name="buyerName"
                  autoComplete="name"
                  data-testid="buyer-name-input"
                  type="text"
                  required
                  aria-invalid={Boolean(fieldErrors.buyerName)}
                  aria-describedby={fieldErrors.buyerName ? "buyerName-error" : undefined}
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Ví dụ: Chị Minh Anh"
                  className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                />
                {fieldErrors.buyerName && (
                  <p id="buyerName-error" role="alert" className="mt-1 text-xs text-red-700">
                    {fieldErrors.buyerName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="buyerPhone"
                  className="block text-xs font-semibold text-[#155132]"
                >
                  {isGift ? "Điện thoại người mua *" : "Điện thoại liên hệ *"}
                </label>
                <input
                  id="buyerPhone"
                  name="buyerPhone"
                  autoComplete="tel"
                  inputMode="tel"
                  data-testid="buyer-phone-input"
                  type="tel"
                  required
                  aria-invalid={Boolean(fieldErrors.buyerPhone)}
                  aria-describedby={fieldErrors.buyerPhone ? "buyerPhone-error" : undefined}
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="Ví dụ: 0905123456"
                  className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                />
                {fieldErrors.buyerPhone && (
                  <p id="buyerPhone-error" role="alert" className="mt-1 text-xs text-red-700">
                    {fieldErrors.buyerPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Full Delivery Address Only */}
            <div>
              <label
                htmlFor="addressDetail"
                className="block text-xs font-semibold text-[#155132]"
              >
                {isGift ? "Địa chỉ nhận quà *" : "Địa chỉ giao hàng *"}
              </label>
              <input
                id="addressDetail"
                name="addressDetail"
                autoComplete="street-address"
                data-testid="address-detail-input"
                type="text"
                required
                aria-invalid={Boolean(fieldErrors.addressDetail)}
                aria-describedby={fieldErrors.addressDetail ? "addressDetail-error" : undefined}
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                placeholder="Số nhà, tên đường, phường/quận tại Đà Nẵng..."
                className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
              />
              {fieldErrors.addressDetail && (
                <p id="addressDetail-error" role="alert" className="mt-1 text-xs text-red-700">
                  {fieldErrors.addressDetail}
                </p>
              )}
            </div>

            {/* Date & Delivery Slot (2 compact inputs) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="requestedDate"
                  className="block text-xs font-semibold text-[#155132]"
                >
                  Ngày giao *
                </label>
                <input
                  id="requestedDate"
                  name="requestedDate"
                  data-testid="requested-date-input"
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.requestedDate)}
                  aria-describedby={fieldErrors.requestedDate ? "requestedDate-error" : undefined}
                  className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-[#FFFCF4] px-3 py-2 text-base sm:text-sm font-medium text-[#2B433A] focus:border-[#155132] focus:bg-white focus:outline-none"
                />
                {fieldErrors.requestedDate && (
                  <p id="requestedDate-error" role="alert" className="mt-1 text-xs text-red-700">
                    {fieldErrors.requestedDate}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slotSelect"
                  className="block text-xs font-semibold text-[#155132]"
                >
                  Khung giờ giao (08:00 – 21:00) {loadingSlots ? "(Đang tải...)" : "*"}
                </label>
                <select
                  id="slotSelect"
                  name="slotSelect"
                  data-testid="slot-select"
                  value={slotId}
                  onChange={(e) => setSlotId(e.target.value)}
                  required
                  className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-[#FFFCF4] px-2.5 py-2 text-base sm:text-sm font-medium text-[#2B433A] focus:border-[#155132] focus:bg-white focus:outline-none"
                >
                  {slots.map((slot) => {
                    const isAvailable =
                      slot.isActive &&
                      slot.remainingBowls > 0 &&
                      !slot.isPastOrInsufficientLead;
                    return (
                      <option
                        key={slot.id}
                        value={slot.id}
                        disabled={!isAvailable}
                      >
                        {slot.timeWindow} —{" "}
                        {isAvailable
                          ? `Còn nhận (${slot.remainingBowls} thố)`
                          : slot.unavailableReason || "Đã đầy"}
                      </option>
                    );
                  })}
                </select>
                {!hasAvailableSlot && !loadingSlots && (
                  <p className="mt-1 text-[11px] text-amber-800">
                    Các khung giờ ngày {requestedDate} đã qua hoặc đủ thố, vui lòng đổi ngày giao.
                  </p>
                )}
              </div>
            </div>

            {/* Additional Note */}
            <div>
              <label
                htmlFor="buyerNote"
                className="block text-xs font-semibold text-[#155132]"
              >
                Yêu cầu thêm (tùy chọn)
              </label>
              <input
                id="buyerNote"
                name="buyerNote"
                data-testid="buyer-note-input"
                type="text"
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                placeholder="Ít gừng, gọi trước khi giao..."
                className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
              />
            </div>

            {/* Single Gift Checkbox */}
            <div className="pt-1 border-t border-[#155132]/10">
              <label className="inline-flex cursor-pointer items-center gap-2 py-1 text-xs sm:text-sm font-semibold text-[#155132]">
                <input
                  type="checkbox"
                  data-testid="gift-toggle-checkbox"
                  checked={isGift}
                  onChange={(e) =>
                    setOrderPurpose(e.target.checked ? "GIFT" : "SELF")
                  }
                  className="h-4 w-4 rounded border-[#155132]/35 text-[#155132] focus:ring-[#155132]"
                />
                <Gift className="h-4 w-4 text-[#BD9342]" aria-hidden="true" />
                <span>Quà tặng</span>
              </label>

              {isGift && (
                <div
                  data-testid="gift-fields-section"
                  className="mt-2.5 space-y-3 pt-2.5 border-t border-dashed border-[#BD9342]/45"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="recipientName"
                        className="block text-xs font-semibold text-[#155132]"
                      >
                        Họ tên người nhận quà *
                      </label>
                      <input
                        id="recipientName"
                        name="recipientName"
                        data-testid="recipient-name-input"
                        type="text"
                        required={isGift}
                        aria-invalid={Boolean(fieldErrors.recipientName)}
                        aria-describedby={fieldErrors.recipientName ? "recipientName-error" : undefined}
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Ví dụ: Cô Thu Hà"
                        className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                      />
                      {fieldErrors.recipientName && (
                        <p id="recipientName-error" role="alert" className="mt-1 text-xs text-red-700">
                          {fieldErrors.recipientName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="recipientPhone"
                        className="block text-xs font-semibold text-[#155132]"
                      >
                        Điện thoại người nhận quà *
                      </label>
                      <input
                        id="recipientPhone"
                        name="recipientPhone"
                        inputMode="tel"
                        data-testid="recipient-phone-input"
                        type="tel"
                        required={isGift}
                        aria-invalid={Boolean(fieldErrors.recipientPhone)}
                        aria-describedby={fieldErrors.recipientPhone ? "recipientPhone-error" : undefined}
                        value={recipientPhone}
                        onChange={(e) => setRecipientPhone(e.target.value)}
                        placeholder="Ví dụ: 0914123456"
                        className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                      />
                      {fieldErrors.recipientPhone && (
                        <p id="recipientPhone-error" role="alert" className="mt-1 text-xs text-red-700">
                          {fieldErrors.recipientPhone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="giftMessage"
                        className="block text-xs font-semibold text-[#155132]"
                      >
                        Lời chúc trên thiệp (tùy chọn)
                      </label>
                      <input
                        id="giftMessage"
                        name="giftMessage"
                        data-testid="gift-message-input"
                        type="text"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Chúc Mẹ nhiều sức khỏe..."
                        className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="giftSenderName"
                        className="block text-xs font-semibold text-[#155132]"
                      >
                        Tên trên thiệp (tùy chọn)
                      </label>
                      <input
                        id="giftSenderName"
                        name="giftSenderName"
                        data-testid="gift-sender-input"
                        type="text"
                        value={giftSenderName}
                        onChange={(e) => setGiftSenderName(e.target.value)}
                        placeholder="Mặc định dùng tên người mua"
                        className="mt-1 w-full min-h-[42px] rounded-md border border-[#155132]/25 bg-white px-3 py-2 text-base sm:text-sm text-[#2B433A] focus:border-[#155132] focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#2B433A]">
                    <input
                      type="checkbox"
                      data-testid="hide-price-checkbox"
                      checked={hidePriceOnReceipt}
                      onChange={(e) => setHidePriceOnReceipt(e.target.checked)}
                      className="h-4 w-4 rounded border-[#155132]/30 text-[#155132] focus:ring-[#155132]"
                    />
                    Ẩn giá tiền trên phiếu giao hàng
                  </label>
                </div>
              )}
            </div>
          </section>

          {/* 3. Compact Total Summary & Submit Button */}
          <section
            aria-label="Tổng tạm tính và gửi yêu cầu"
            className="rounded-3xl bg-[#FAF4EB] p-5 sm:p-6"
          >
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-[#2B433A]">
                <span>Tạm tính ({serverQuote?.totalBowls ?? totalBowls} thố):</span>
                <span className="font-bold text-[#1B1B1B]">
                  {formatVnd(serverQuote?.subtotalVnd ?? estimatedSubtotalVnd)}
                </span>
              </div>
              <div className="flex justify-between gap-2 text-[#2B433A]">
                <span>Giao hàng:</span>
                <span className="text-right font-semibold text-[#1B4332]">
                  {totalBowls >= 2
                    ? "Miễn phí (Đơn từ 2 thố)"
                    : "Theo địa chỉ (Đặt 2 thố Free Ship)"}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[#E6DAC6] pt-3">
                <span className="text-sm font-bold text-[#1B1B1B]">
                  {totalBowls >= 2
                    ? "Tổng cộng (Đã Free Ship):"
                    : "Tổng tạm tính (chưa gồm phí ship):"}
                </span>
                <span
                  data-testid="quote-total-vnd"
                  className="font-serif-display text-xl sm:text-2xl font-extrabold text-[#1B1B1B]"
                >
                  {formatVnd(serverQuote?.totalVnd ?? estimatedSubtotalVnd)}
                </span>
              </div>
            </div>

            {(submitError || (serverQuote && !serverQuote.ok)) && (
              <div
                role="alert"
                tabIndex={-1}
                data-testid="checkout-error-alert"
                className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-900 space-y-1.5"
              >
                <div className="flex items-start gap-2 font-semibold">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
                  <span>{submitError || serverQuote?.errorMessage}</span>
                </div>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="pl-6 list-disc space-y-1">
                    {Object.entries(fieldErrors).map(([fieldKey, errText]) => (
                      <li key={fieldKey}>
                        <a
                          href={`#${fieldKey}`}
                          className="underline font-medium hover:text-red-950"
                        >
                          {errText}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              data-testid="submit-order-btn"
              disabled={submitting || items.length === 0}
              className="mt-4 flex w-full min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F3D78A] to-[#D4AF37] px-6 py-3 text-sm font-bold text-[#1B1B1B] shadow-xs transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt món →"}
            </button>

            <p className="mt-2.5 text-center text-xs text-[#4A4A4A]">
              Chưa thu tiền online • Hà Mi sẽ liên hệ xác nhận đơn trước khi chưng.
            </p>
          </section>
        </form>
      )}
    </div>
  );
}
