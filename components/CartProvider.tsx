"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";

export interface CartItem {
  productId: string;
  slug: string;
  productName: string;
  variantId: string;
  variantName: string;
  unitPriceVnd: number;
  volumeMl: number;
  selectedOption: string;
  quantity: number;
  imageUrl: string;
}

interface CartContextValue {
  items: CartItem[];
  totalBowls: number;
  estimatedSubtotalVnd: number;
  selectedZoneId: string;
  setSelectedZoneId: (zoneId: string) => void;
  orderPurpose: "SELF" | "GIFT";
  setOrderPurpose: (purpose: "SELF" | "GIFT") => void;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: string, variantId: string, selectedOption: string, quantity: number) => void;
  updateOption: (productId: string, variantId: string, oldOption: string, newOption: string) => void;
  removeItem: (productId: string, variantId: string, selectedOption: string) => void;
  clearCart: () => void;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "hami_mvp_cart_v2";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("zone-hai-chau");
  const [orderPurpose, setOrderPurpose] = useState<"SELF" | "GIFT">("SELF");
  const [hydrated, setHydrated] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items)) {
          const normalized = (parsed.items as CartItem[]).map((it) =>
            it.productId?.startsWith("prod-") && it.unitPriceVnd < 295000
              ? { ...it, unitPriceVnd: 295000 }
              : it
          );
          setItems(normalized);
        }
        if (typeof parsed.selectedZoneId === "string") setSelectedZoneId(parsed.selectedZoneId);
        if (parsed.orderPurpose === "GIFT" || parsed.orderPurpose === "SELF") {
          setOrderPurpose(parsed.orderPurpose);
        }
      }
    } catch {
      // ignore localStorage read errors
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items, selectedZoneId, orderPurpose })
      );
    } catch {
      // ignore
    }
  }, [items, selectedZoneId, orderPurpose, hydrated]);

  // Listen to input/textarea/select focus on mobile to avoid FloatingActionRail overlapping virtual keyboard
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        setIsInputFocused(true);
      }
    };
    const onFocusOut = () => {
      setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName.toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") {
          setIsInputFocused(false);
        }
      }, 100);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const addItem: CartContextValue["addItem"] = (incoming) => {
    const qtyToAdd = incoming.quantity ?? 1;
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === incoming.productId &&
          i.variantId === incoming.variantId &&
          i.selectedOption === incoming.selectedOption
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(50, updated[idx].quantity + qtyToAdd),
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...incoming,
          quantity: Math.min(50, Math.max(1, qtyToAdd)),
        },
      ];
    });
    showToast(`Đã thêm "${incoming.productName}" vào danh sách chọn món.`);
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (
    productId,
    variantId,
    selectedOption,
    quantity
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variantId, selectedOption);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId &&
        i.variantId === variantId &&
        i.selectedOption === selectedOption
          ? { ...i, quantity: Math.min(50, quantity) }
          : i
      )
    );
  };

  const updateOption: CartContextValue["updateOption"] = (
    productId,
    variantId,
    oldOption,
    newOption
  ) => {
    if (oldOption === newOption) return;
    setItems((prev) => {
      const sourceIdx = prev.findIndex(
        (i) =>
          i.productId === productId &&
          i.variantId === variantId &&
          i.selectedOption === oldOption
      );
      if (sourceIdx === -1) return prev;
      const sourceItem = prev[sourceIdx];

      const targetIdx = prev.findIndex(
        (i) =>
          i.productId === productId &&
          i.variantId === variantId &&
          i.selectedOption === newOption
      );

      if (targetIdx > -1) {
        const updated = [...prev];
        updated[targetIdx] = {
          ...updated[targetIdx],
          quantity: Math.min(50, updated[targetIdx].quantity + sourceItem.quantity),
        };
        return updated.filter((_, idx) => idx !== sourceIdx);
      }

      const updated = [...prev];
      updated[sourceIdx] = {
        ...sourceItem,
        selectedOption: newOption,
      };
      return updated;
    });
  };

  const removeItem: CartContextValue["removeItem"] = (productId, variantId, selectedOption) => {
    setItems((prev) =>
      prev.filter(
        (i) =>
          !(
            i.productId === productId &&
            i.variantId === variantId &&
            i.selectedOption === selectedOption
          )
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalBowls = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const estimatedSubtotalVnd = useMemo(
    () => items.reduce((acc, item) => acc + item.unitPriceVnd * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalBowls,
        estimatedSubtotalVnd,
        selectedZoneId,
        setSelectedZoneId,
        orderPurpose,
        setOrderPurpose,
        addItem,
        updateQuantity,
        updateOption,
        removeItem,
        clearCart,
        isInputFocused,
        setIsInputFocused,
        isModalOpen,
        setIsModalOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          data-testid="cart-toast-notification"
          className="fixed top-28 sm:top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-1.5rem)] bg-[#155132]/95 backdrop-blur-md text-[#FFFCF4] border border-[#BD9342] px-3.5 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm flex items-center justify-between gap-2.5 transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2
              className="w-4 h-4 text-[#BD9342] shrink-0"
              aria-hidden="true"
            />
            <span className="truncate font-medium">{toastMessage}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/dat-hang"
              onClick={() => setToastMessage(null)}
              className="inline-flex items-center justify-center min-h-[34px] px-2.5 py-1 rounded-md bg-[#FFFCF4] text-[#155132] font-bold text-xs hover:bg-[#DBF1EE] transition-colors"
            >
              Đặt món →
            </Link>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              aria-label="Đóng thông báo"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#FFFCF4]/85 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
