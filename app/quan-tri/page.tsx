"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import type {
  DeliverySlotRecord,
  JobPostingRecord,
  NotificationLogRecord,
  NotificationSettings,
  OrderStatus,
  PaymentStatus,
  PostRecord,
  ProductCategory,
  ProductRecord,
  ProductStatus,
  SiteContentSettings,
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

type AdminTab =
  | "orders"
  | "catalog"
  | "site"
  | "posts"
  | "jobs"
  | "notifications";

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

const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "nguyen-ban", label: "Nguyên bản thanh khiết (nguyen-ban)" },
  { value: "ngot-diu", label: "Ngọt dịu thảo mộc (ngot-diu)" },
  { value: "nhieu-tang", label: "Bồi bổ nhiều tầng vị (nhieu-tang)" },
];

function formatVnd(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Chưa chốt";
  return `${amount.toLocaleString("vi-VN")}đ`;
}

/**
 * Resize & compress an uploaded image file in browser to a clean Data URL
 * so it can be saved directly into SQLite and rendered anywhere.
 */
async function readAndCompressImageFile(
  file: File,
  maxWidth = 1000
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không đọc được file ảnh."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Định dạng ảnh không hợp lệ."));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function QuanTriPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [username, setUsername] = useState("hami_staff");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [slots, setSlots] = useState<DeliverySlotRecord[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteContentSettings | null>(
    null
  );
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [jobs, setJobs] = useState<JobPostingRecord[]>([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [notificationLogs, setNotificationLogs] = useState<
    NotificationLogRecord[]
  >([]);

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

  // Product Editor state
  const [editingProduct, setEditingProduct] = useState<{
    id?: string;
    slug: string;
    name: string;
    category: ProductCategory;
    volumeMl: number;
    ingredientsText: string;
    shortDescription: string;
    imageUrl: string;
    priceVnd: string;
    status: ProductStatus;
  } | null>(null);

  // Post Editor state
  const [editingPost, setEditingPost] = useState<{
    id?: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    coverImageUrl: string;
    isPublished: boolean;
  } | null>(null);

  // Job Editor state
  const [editingJob, setEditingJob] = useState<{
    id?: string;
    title: string;
    department: string;
    location: string;
    employmentType: string;
    salaryRange: string;
    description: string;
    requirements: string;
    contactInfo: string;
    isOpen: boolean;
  } | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [ordersRes, catalogRes, cmsRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/catalog"),
        fetch("/api/admin/cms"),
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
      if (cmsRes.ok) {
        const cmsData = (await cmsRes.json()) as {
          siteSettings?: SiteContentSettings;
          posts?: PostRecord[];
          jobs?: JobPostingRecord[];
          notificationSettings?: NotificationSettings;
          notificationLogs?: NotificationLogRecord[];
        };
        if (cmsData.siteSettings) setSiteSettings(cmsData.siteSettings);
        if (cmsData.posts) setPosts(cmsData.posts);
        if (cmsData.jobs) setJobs(cmsData.jobs);
        if (cmsData.notificationSettings) {
          setNotificationSettings(cmsData.notificationSettings);
        }
        if (cmsData.notificationLogs) {
          setNotificationLogs(cmsData.notificationLogs);
        }
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

  const handleSaveProductFull = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setFeedbackMsg(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_product",
        product: {
          ...editingProduct,
          priceVnd:
            editingProduct.priceVnd.trim() === ""
              ? null
              : Number(editingProduct.priceVnd),
        },
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Không thể lưu món.");
      return;
    }
    setFeedbackMsg(data.message || "Đã lưu thông tin món thành công.");
    setEditingProduct(null);
    loadDashboardData();
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa món "${name}"?`)) return;
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_product", productId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (res.ok && data.ok) {
      setFeedbackMsg(data.message || "Đã xóa món.");
      loadDashboardData();
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    setFeedbackMsg(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_site_settings",
        settings: siteSettings,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Lưu nội dung trang thất bại.");
      return;
    }
    setFeedbackMsg(
      data.message || "Đã lưu nội dung Trang chủ & Thông tin Web thành công."
    );
    loadDashboardData();
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    setFeedbackMsg(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_post",
        post: editingPost,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Lưu bài viết thất bại.");
      return;
    }
    setFeedbackMsg(data.message || "Đã lưu bài viết thành công.");
    setEditingPost(null);
    loadDashboardData();
  };

  const handleDeletePost = async (postId: string, title: string) => {
    if (!window.confirm(`Xóa bài viết "${title}"?`)) return;
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_post", postId }),
    });
    if (res.ok) {
      setFeedbackMsg("Đã xóa bài viết.");
      loadDashboardData();
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setFeedbackMsg(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "upsert_job",
        job: editingJob,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Lưu tin tuyển dụng thất bại.");
      return;
    }
    setFeedbackMsg(data.message || "Đã lưu tin tuyển dụng thành công.");
    setEditingJob(null);
    loadDashboardData();
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (!window.confirm(`Xóa tin tuyển dụng "${title}"?`)) return;
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_job", jobId }),
    });
    if (res.ok) {
      setFeedbackMsg("Đã xóa tin tuyển dụng.");
      loadDashboardData();
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationSettings) return;
    setFeedbackMsg(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_notification_settings",
        settings: notificationSettings,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    if (!res.ok || !data.ok) {
      setFeedbackMsg(data.errorMessage || "Lưu cấu hình thông báo thất bại.");
      return;
    }
    setFeedbackMsg(
      data.message || "Đã lưu cấu hình thông báo Email & Zalo thành công."
    );
    loadDashboardData();
  };

  const handleTestNotification = async () => {
    setFeedbackMsg("Đang gửi thông báo thử nghiệm qua Email & Zalo...");
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test_notification" }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      errorMessage?: string;
    };
    setFeedbackMsg(
      data.message ||
        data.errorMessage ||
        "Đã kích hoạt thông báo thử nghiệm thành công."
    );
    loadDashboardData();
  };

  const buildOrderSummaryText = (order: AdminOrderRecord) => {
    const itemsText = order.items
      .map(
        (it) =>
          `- ${it.productNameSnapshot} x${it.quantity} (${it.selectedOptionSnapshot}): ${formatVnd(
            it.lineTotalSnapshot
          )}`
      )
      .join("\n");
    return `[YẾN SÀO HÀ MI - ĐƠN MỚI ${order.referenceCode}]\nKhách đặt: ${order.buyerName} (${order.buyerPhone})\nNgười nhận: ${order.recipientName} (${order.recipientPhone})\nĐịa chỉ: ${order.addressDetail}\nLịch giao: ${order.requestedDate} (${order.slotLabelSnapshot})\nMón đặt:\n${itemsText}\nTổng cộng: ${formatVnd(order.totalVnd)}`;
  };

  const handleQuickShareZalo = async (order: AdminOrderRecord) => {
    const summary = buildOrderSummaryText(order);
    try {
      await navigator.clipboard.writeText(summary);
      setFeedbackMsg(
        `Đã sao chép nội dung đơn ${order.referenceCode}. Đang mở Zalo...`
      );
    } catch {
      // ignore clipboard error
    }
    const targetPhone =
      notificationSettings?.zaloRecipientPhone?.replace(/\D/g, "") ||
      "0909123456";
    window.open(`https://zalo.me/${targetPhone}`, "_blank", "noopener");
  };

  const handleQuickShareEmail = (order: AdminOrderRecord) => {
    const targetEmail =
      notificationSettings?.notificationEmailTo || "cskh@yenhami.vn";
    const subject = encodeURIComponent(
      `[Yến Sào Hà Mi] Đơn đặt món mới ${order.referenceCode} - ${order.buyerName}`
    );
    const body = encodeURIComponent(buildOrderSummaryText(order));
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
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
                Quản Trị Website & Bếp Hà Mi
              </h1>
              <p className="text-xs text-[#2B433A]/80">
                Đăng nhập để quản lý đơn hàng, món ăn, trang chủ, bài viết, tuyển dụng & thông báo Zalo/Email
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
                Tài khoản quản trị
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
                placeholder="Nhập mật khẩu (mặc định: hami2026)..."
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
    <div className="mx-auto max-w-[1240px] px-4 py-8 pr-16 md:pr-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#155132]/15 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 text-xs font-semibold text-[#155132]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#BD9342]" />
            Quản trị viên: {staff.displayName} ({staff.username})
          </span>
          <h1 className="mt-2 font-serif-display text-2xl font-semibold text-[#155132]">
            Hệ Thống Quản Trị Nội Dung (CMS) & Điều Phối Đơn Yến Sào Hà Mi
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#155132]/25 bg-white px-3.5 py-2 text-xs font-semibold text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới dữ liệu
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
            className="underline ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-[#155132]/15 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <ClipboardList className="h-4 w-4 text-[#BD9342]" />
          1. Đơn đặt món ({orders.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "catalog"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <Package className="h-4 w-4 text-[#BD9342]" />
          2. Cập nhật Món & Hình ảnh ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("site")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "site"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <Globe className="h-4 w-4 text-[#BD9342]" />
          3. Nội dung Trang chủ & Web
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "posts"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <FileText className="h-4 w-4 text-[#BD9342]" />
          4. Bài viết / Cẩm nang ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "jobs"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <Briefcase className="h-4 w-4 text-[#BD9342]" />
          5. Tuyển dụng ({jobs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
            activeTab === "notifications"
              ? "bg-[#155132] text-[#FFFCF4]"
              : "bg-white text-[#2B433A] border border-[#155132]/20"
          }`}
        >
          <Bell className="h-4 w-4 text-[#BD9342]" />
          6. Thông báo Email & Zalo
        </button>
      </div>

      {loadingData && (
        <p className="mt-4 text-xs text-[#2B433A]">Đang tải dữ liệu...</p>
      )}

      {/* ================================================================= */}
      {/* TAB 1: ORDERS */}
      {/* ================================================================= */}
      {activeTab === "orders" && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#BD9342]/35 bg-[#FFFCF4] p-4 text-xs text-[#2B433A]">
            <div>
              <strong className="text-[#155132]">
                Cơ chế thông báo tự động khi có khách đặt món:
              </strong>{" "}
              Mỗi khi khách gửi đơn mới, hệ thống tự động kích hoạt thông báo
              về Email ({notificationSettings?.notificationEmailTo || "chưa cấu hình"}) và
              Zalo ({notificationSettings?.zaloRecipientPhone || "chưa cấu hình"}). Bạn
              cũng có thể bấm nút <strong>Báo qua Zalo</strong> hoặc{" "}
              <strong>Gửi Email</strong> trực tiếp trên từng đơn bên dưới.
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className="rounded-xl bg-[#155132] px-3 py-2 font-bold text-[#FFFCF4] cursor-pointer"
            >
              Cài đặt Email & Zalo nhận đơn →
            </button>
          </div>

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
                  <div className="flex flex-wrap items-center gap-2.5">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickShareZalo(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#155132]/25 bg-[#FFFCF4] px-2.5 py-1 text-[11px] font-bold text-[#155132] hover:bg-[#155132] hover:text-white cursor-pointer"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-[#BD9342]" />
                      Báo qua Zalo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickShareEmail(order)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#155132]/25 bg-[#FFFCF4] px-2.5 py-1 text-[11px] font-bold text-[#155132] hover:bg-[#155132] hover:text-white cursor-pointer"
                    >
                      <Mail className="h-3.5 w-3.5 text-[#BD9342]" />
                      Gửi Email
                    </button>
                    <span className="text-right text-xs font-bold text-[#155132]">
                      Tổng: {formatVnd(order.totalVnd)}{" "}
                      {!order.isTotalFinal && "(Chưa chốt phí giao)"}
                    </span>
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

      {/* ================================================================= */}
      {/* TAB 2: CATALOG, DISHES & IMAGES */}
      {/* ================================================================= */}
      {activeTab === "catalog" && (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
                Đăng tải & Cập nhật Món, Giá bán, Hình ảnh món
              </h2>
              <p className="text-xs text-[#2B433A]/80">
                Bấm “Thêm món mới” hoặc “Sửa món & Ảnh” để thay đổi tên, giá, thành phần hoặc tải hình ảnh món trực tiếp từ máy tính.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingProduct({
                  slug: "",
                  name: "",
                  category: "nguyen-ban",
                  volumeMl: 100,
                  ingredientsText: "Tổ yến nguyên chất, đường phèn kết tinh",
                  shortDescription: "",
                  imageUrl: "/brand/catalog/yen-hu-75ml-100ml-cam-tay.jpg",
                  priceVnd: "145000",
                  status: "AVAILABLE",
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-2.5 text-xs font-bold text-[#FFFCF4] hover:bg-[#0e3b23] cursor-pointer"
            >
              <Plus className="h-4 w-4 text-[#BD9342]" />
              Thêm món / sản phẩm mới
            </button>
          </div>

          {editingProduct && (
            <form
              onSubmit={handleSaveProductFull}
              className="rounded-2xl border-2 border-[#BD9342] bg-[#FFFCF4] p-5 shadow-md space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#155132]/15 pb-3">
                <h3 className="font-serif-display text-lg font-bold text-[#155132]">
                  {editingProduct.id
                    ? `Chỉnh sửa món: ${editingProduct.name}`
                    : "Thêm món / sản phẩm mới lên Website"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Đóng form
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Tên món / sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                    placeholder="VD: Yến chưng Đông Trùng Hạ Thảo"
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Nhóm hương vị / Danh mục *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        category: e.target.value as ProductCategory,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs font-semibold text-[#155132]"
                  >
                    {PRODUCT_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#155132]">
                      Giá bán (VNĐ)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={editingProduct.priceVnd}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceVnd: e.target.value,
                        })
                      }
                      placeholder="VD: 145000"
                      className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#155132]">
                      Dung tích (ml)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={editingProduct.volumeMl}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          volumeMl: Number(e.target.value) || 100,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Nguyên liệu chưng cùng (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.ingredientsText}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        ingredientsText: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Trạng thái phục vụ
                  </label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        status: e.target.value as ProductStatus,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs font-semibold text-[#155132]"
                  >
                    {PRODUCT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Mô tả chi tiết món / công dụng
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      shortDescription: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              {/* Image URL + Direct File Upload */}
              <div className="rounded-xl border border-[#155132]/20 bg-white p-3.5">
                <label className="block text-xs font-bold text-[#155132]">
                  Hình ảnh món (Nhập đường dẫn ảnh hoặc tải ảnh trực tiếp từ máy tính)
                </label>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      editingProduct.imageUrl ||
                      "/brand/catalog/yen-hu-75ml-100ml-cam-tay.jpg"
                    }
                    alt={editingProduct.name || "Preview"}
                    className="h-20 w-20 rounded-xl object-cover border border-[#BD9342]/50"
                  />
                  <div className="flex-1 min-w-[240px] space-y-2">
                    <input
                      type="text"
                      value={editingProduct.imageUrl}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          imageUrl: e.target.value,
                        })
                      }
                      placeholder="/brand/catalog/... hoặc https://..."
                      className="w-full rounded-lg border border-[#155132]/25 px-3 py-1.5 text-xs"
                    />
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-[#155132]/10 px-3 py-1.5 text-xs font-bold text-[#155132] hover:bg-[#155132]/20 cursor-pointer">
                      <Upload className="h-3.5 w-3.5 text-[#155132]" />
                      Chọn tải ảnh từ máy tính
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const dataUrl = await readAndCompressImageFile(
                              file,
                              900
                            );
                            setEditingProduct((prev) =>
                              prev ? { ...prev, imageUrl: dataUrl } : prev
                            );
                          } catch (err) {
                            alert(
                              err instanceof Error
                                ? err.message
                                : "Lỗi đọc ảnh"
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="rounded-xl border border-[#155132]/25 bg-white px-4 py-2 text-xs font-semibold text-[#2B433A]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2 text-xs font-bold text-[#FFFCF4] cursor-pointer"
                >
                  Lưu thông tin món & hình ảnh
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-8">
              <h3 className="font-serif-display text-base font-semibold text-[#155132]">
                Danh sách tất cả món & sản phẩm trên Web ({products.length} món)
              </h3>
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#155132]/15 bg-white p-3.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="h-14 w-14 rounded-xl object-cover border border-[#155132]/15 shrink-0"
                    />
                    <div>
                      <span className="inline-block rounded-md bg-[#FFFCF4] border border-[#BD9342]/40 px-2 py-0.5 text-[10px] font-semibold text-[#8A6632]">
                        {prod.categoryLabel}
                      </span>
                      <p className="mt-0.5 font-bold text-[#155132] text-sm">
                        {prod.name}
                      </p>
                      <p className="text-[#2B433A]/80">
                        Dung tích {prod.volumeMl}ml • Giá:{" "}
                        <strong className="text-[#155132]">
                          {formatVnd(prod.priceVnd)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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

                    <button
                      type="button"
                      onClick={() =>
                        setEditingProduct({
                          id: prod.id,
                          slug: prod.slug,
                          name: prod.name,
                          category: prod.category,
                          volumeMl: prod.volumeMl,
                          ingredientsText: prod.ingredients.join(", "),
                          shortDescription: prod.shortDescription,
                          imageUrl: prod.imageUrl,
                          priceVnd:
                            prod.priceVnd !== null ? String(prod.priceVnd) : "",
                          status: prod.status,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-[#155132]/25 bg-white px-2.5 py-1.5 text-xs font-bold text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-[#BD9342]" />
                      Sửa món & Ảnh
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 lg:col-span-4">
              <h3 className="font-serif-display text-base font-semibold text-[#155132]">
                Khung giờ Ca bếp (08:00 - 21:00)
              </h3>
              <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-[#155132]/15 bg-white p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-bold text-[#155132]">
                        <Clock className="h-3.5 w-3.5 text-[#BD9342]" />
                        {slot.label} ({slot.timeWindow})
                      </span>
                      <span className="rounded-full bg-[#FFFCF4] border border-[#BD9342]/40 px-2 py-0.5 text-[11px] font-semibold text-[#155132]">
                        {slot.reservedBowls}/{slot.maxCapacityBowls} thố
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: SITE CONTENT SETTINGS (TRANG CHỦ, VỀ HÀ MI, LIÊN HỆ) */}
      {/* ================================================================= */}
      {activeTab === "site" && siteSettings && (
        <form
          onSubmit={handleSaveSiteSettings}
          className="mt-6 space-y-6 rounded-2xl border border-[#155132]/20 bg-white p-6 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#155132]/15 pb-4">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
                Cập nhật Nội dung Trang Chủ, Quà Biếu, Về Hà Mi & Liên Hệ
              </h2>
              <p className="text-xs text-[#2B433A]/80">
                Mọi thay đổi tại đây sẽ cập nhật trực tiếp lên giao diện Trang chủ và các trang thông tin.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2.5 text-xs font-bold text-[#FFFCF4] hover:bg-[#0e3b23] cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4 text-[#BD9342]" />
              Lưu toàn bộ nội dung Website
            </button>
          </div>

          {/* Section 1: Hero Trang Chủ */}
          <div className="space-y-4 rounded-xl bg-[#FFFCF4] p-4 border border-[#BD9342]/30">
            <h3 className="font-serif-display text-base font-bold text-[#155132]">
              1. Banner Đầu Trang Chủ (Hero Section)
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Dòng nhãn nhỏ (Hero Badge)
                </label>
                <input
                  type="text"
                  value={siteSettings.heroBadge}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      heroBadge: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Chữ trên nút bấm chính (CTA)
                </label>
                <input
                  type="text"
                  value={siteSettings.heroCta}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      heroCta: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#155132]">
                Tiêu đề lớn Trang Chủ (H1)
              </label>
              <input
                type="text"
                value={siteSettings.heroTitle}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    heroTitle: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#155132]">
                Đoạn mô tả mở đầu Trang Chủ
              </label>
              <textarea
                rows={3}
                value={siteSettings.heroLead}
                onChange={(e) =>
                  setSiteSettings({
                    ...siteSettings,
                    heroLead: e.target.value,
                  })
                }
                className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#155132]/15 bg-white p-3">
                <label className="block text-xs font-bold text-[#155132]">
                  Ảnh Hero Desktop Trang Chủ
                </label>
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteSettings.heroDesktopImage}
                    alt="Hero desktop"
                    className="h-16 w-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={siteSettings.heroDesktopImage}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          heroDesktopImage: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#155132]/25 px-2.5 py-1 text-xs"
                    />
                    <label className="inline-flex items-center gap-1 rounded-lg bg-[#155132]/10 px-2.5 py-1 text-[11px] font-bold text-[#155132] cursor-pointer">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Tải ảnh mới từ máy
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const dataUrl = await readAndCompressImageFile(file);
                          setSiteSettings({
                            ...siteSettings,
                            heroDesktopImage: dataUrl,
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#155132]/15 bg-white p-3">
                <label className="block text-xs font-bold text-[#155132]">
                  Ảnh Hero Mobile Trang Chủ
                </label>
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteSettings.heroMobileImage}
                    alt="Hero mobile"
                    className="h-16 w-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={siteSettings.heroMobileImage}
                      onChange={(e) =>
                        setSiteSettings({
                          ...siteSettings,
                          heroMobileImage: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-[#155132]/25 px-2.5 py-1 text-xs"
                    />
                    <label className="inline-flex items-center gap-1 rounded-lg bg-[#155132]/10 px-2.5 py-1 text-[11px] font-bold text-[#155132] cursor-pointer">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Tải ảnh mới từ máy
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const dataUrl = await readAndCompressImageFile(file);
                          setSiteSettings({
                            ...siteSettings,
                            heroMobileImage: dataUrl,
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Gifting & About */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl bg-[#FFFCF4] p-4 border border-[#BD9342]/30">
              <h3 className="font-serif-display text-base font-bold text-[#155132]">
                2. Khối Quà Biếu Sức Khỏe
              </h3>
              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Tiêu đề khối Quà Biếu
                </label>
                <input
                  type="text"
                  value={siteSettings.giftingTitle}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      giftingTitle: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Mô tả khối Quà Biếu
                </label>
                <textarea
                  rows={3}
                  value={siteSettings.giftingDescription}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      giftingDescription: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Ảnh đại diện khối Quà Biếu
                </label>
                <div className="mt-1 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={siteSettings.giftingImage}
                    alt="Gift section"
                    className="h-14 w-14 rounded-lg object-cover border"
                  />
                  <input
                    type="text"
                    value={siteSettings.giftingImage}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        giftingImage: e.target.value,
                      })
                    }
                    className="flex-1 rounded-lg border border-[#155132]/25 bg-white px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl bg-[#FFFCF4] p-4 border border-[#BD9342]/30">
              <h3 className="font-serif-display text-base font-bold text-[#155132]">
                3. Thông tin Liên Hệ, Hotline, Zalo & Về Hà Mi
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Hotline hiển thị
                  </label>
                  <input
                    type="text"
                    value={siteSettings.hotlineDisplay}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        hotlineDisplay: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Link Zalo CSKH
                  </label>
                  <input
                    type="text"
                    value={siteSettings.zaloUrl}
                    onChange={(e) =>
                      setSiteSettings({
                        ...siteSettings,
                        zaloUrl: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Địa chỉ bếp / Showroom
                </label>
                <input
                  type="text"
                  value={siteSettings.addressDisplay}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      addressDisplay: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Khung giờ phục vụ
                </label>
                <input
                  type="text"
                  value={siteSettings.serviceHoursDisplay}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      serviceHoursDisplay: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Giới thiệu ngắn Về Hà Mi
                </label>
                <textarea
                  rows={2}
                  value={siteSettings.aboutLead}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      aboutLead: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ================================================================= */}
      {/* TAB 4: BLOG POSTS / ARTICLES */}
      {/* ================================================================= */}
      {activeTab === "posts" && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
                Quản lý Bài viết & Cẩm nang Yến Sào
              </h2>
              <p className="text-xs text-[#2B433A]/80">
                Đăng bài chia sẻ kiến thức yến sào, quà biếu sức khỏe và tin tức thương hiệu (hiển thị tại trang /bai-viet).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/bai-viet"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#155132]/25 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#155132]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Xem trang Bài viết
              </a>
              <button
                type="button"
                onClick={() =>
                  setEditingPost({
                    slug: "",
                    title: "",
                    excerpt: "",
                    content: "",
                    category: "Cẩm nang yến sào",
                    coverImageUrl: "/brand/catalog/set-qua-hop-sen-en.jpg",
                    isPublished: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-2.5 text-xs font-bold text-[#FFFCF4] cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#BD9342]" />
                Đăng bài viết mới
              </button>
            </div>
          </div>

          {editingPost && (
            <form
              onSubmit={handleSavePost}
              className="rounded-2xl border-2 border-[#BD9342] bg-[#FFFCF4] p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#155132]/15 pb-3">
                <h3 className="font-serif-display text-lg font-bold text-[#155132]">
                  {editingPost.id ? "Chỉnh sửa bài viết" : "Đăng bài viết mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#155132]">
                    Tiêu đề bài viết *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, title: e.target.value })
                    }
                    placeholder="VD: Thời điểm vàng thưởng thức yến chưng nóng..."
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Chuyên mục
                  </label>
                  <input
                    type="text"
                    value={editingPost.category}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        category: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Tóm tắt ngắn (hiển thị ở danh sách bài viết)
                </label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, excerpt: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Nội dung chi tiết bài viết *
                </label>
                <textarea
                  rows={6}
                  required
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost({ ...editingPost, content: e.target.value })
                  }
                  placeholder="Nhập nội dung bài viết (các đoạn văn cách nhau bằng dòng trống)..."
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[#155132]/20 bg-white p-3">
                  <label className="block text-xs font-bold text-[#155132]">
                    Ảnh bìa bài viết
                  </label>
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingPost.coverImageUrl}
                      alt="Cover"
                      className="h-16 w-20 rounded-lg object-cover border"
                    />
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={editingPost.coverImageUrl}
                        onChange={(e) =>
                          setEditingPost({
                            ...editingPost,
                            coverImageUrl: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-[#155132]/25 px-2.5 py-1 text-xs"
                      />
                      <label className="inline-flex items-center gap-1 rounded-lg bg-[#155132]/10 px-2.5 py-1 text-[11px] font-bold text-[#155132] cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        Tải ảnh bìa từ máy tính
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const dataUrl =
                              await readAndCompressImageFile(file);
                            setEditingPost({
                              ...editingPost,
                              coverImageUrl: dataUrl,
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={editingPost.isPublished ? "PUBLISHED" : "DRAFT"}
                    onChange={(e) =>
                      setEditingPost({
                        ...editingPost,
                        isPublished: e.target.value === "PUBLISHED",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs font-semibold text-[#155132]"
                  >
                    <option value="PUBLISHED">Công khai trên Web</option>
                    <option value="DRAFT">Bản nháp ẩn</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-xl border border-[#155132]/25 bg-white px-4 py-2 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2 text-xs font-bold text-[#FFFCF4] cursor-pointer"
                >
                  Lưu & Đăng bài viết
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex gap-3.5 rounded-2xl border border-[#155132]/15 bg-white p-4 text-xs shadow-2xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-24 w-28 rounded-xl object-cover border shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#FFFCF4] border border-[#BD9342]/40 px-2 py-0.5 text-[10px] font-semibold text-[#8A6632]">
                        {post.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          post.isPublished
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}
                      >
                        {post.isPublished ? "Đang hiển thị" : "Bản nháp"}
                      </span>
                    </div>
                    <h3 className="mt-1 font-bold text-[#155132] text-sm line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-[#2B433A]/80 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingPost({
                          id: post.id,
                          slug: post.slug,
                          title: post.title,
                          excerpt: post.excerpt,
                          content: post.content,
                          category: post.category,
                          coverImageUrl: post.coverImageUrl,
                          isPublished: post.isPublished,
                        })
                      }
                      className="inline-flex items-center gap-1 rounded-lg border border-[#155132]/25 px-2.5 py-1 font-bold text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
                    >
                      <Edit3 className="h-3 w-3 text-[#BD9342]" />
                      Sửa bài
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 font-semibold text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: RECRUITMENT / JOB POSTINGS */}
      {/* ================================================================= */}
      {activeTab === "jobs" && (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
                Đăng thông tin Tuyển dụng Nhân sự Hà Mi
              </h2>
              <p className="text-xs text-[#2B433A]/80">
                Quản lý các vị trí đang tuyển dụng và hiển thị công khai tại trang /tuyen-dung.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/tuyen-dung"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#155132]/25 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#155132]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Xem trang Tuyển dụng
              </a>
              <button
                type="button"
                onClick={() =>
                  setEditingJob({
                    title: "",
                    department: "Bếp Chưng Thủ Công",
                    location: "Đà Nẵng / TP.HCM",
                    employmentType: "Toàn thời gian",
                    salaryRange: "8.000.000đ - 12.000.000đ/tháng",
                    description: "",
                    requirements: "",
                    contactInfo: "Hotline/Zalo: 0935 052 959",
                    isOpen: true,
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-2.5 text-xs font-bold text-[#FFFCF4] cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#BD9342]" />
                Đăng tin tuyển dụng mới
              </button>
            </div>
          </div>

          {editingJob && (
            <form
              onSubmit={handleSaveJob}
              className="rounded-2xl border-2 border-[#BD9342] bg-[#FFFCF4] p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#155132]/15 pb-3">
                <h3 className="font-serif-display text-lg font-bold text-[#155132]">
                  {editingJob.id
                    ? "Cập nhật vị trí tuyển dụng"
                    : "Đăng vị trí tuyển dụng mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="text-xs font-semibold text-red-700 underline"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Vị trí tuyển dụng *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, title: e.target.value })
                    }
                    placeholder="VD: Nghệ Nhân Sơ Chế & Chưng Yến"
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Bộ phận / Phòng ban
                  </label>
                  <input
                    type="text"
                    value={editingJob.department}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        department: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Mức lương & Đãi ngộ
                  </label>
                  <input
                    type="text"
                    value={editingJob.salaryRange}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        salaryRange: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Địa điểm làm việc
                  </label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, location: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Hình thức làm việc
                  </label>
                  <input
                    type="text"
                    value={editingJob.employmentType}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        employmentType: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#155132]">
                    Trạng thái nhận hồ sơ
                  </label>
                  <select
                    value={editingJob.isOpen ? "OPEN" : "CLOSED"}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        isOpen: e.target.value === "OPEN",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs font-semibold text-[#155132]"
                  >
                    <option value="OPEN">Đang tuyển dụng</option>
                    <option value="CLOSED">Đã đóng nhận hồ sơ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Mô tả công việc *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingJob.description}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Yêu cầu ứng viên
                </label>
                <textarea
                  rows={3}
                  value={editingJob.requirements}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      requirements: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="rounded-xl border border-[#155132]/25 bg-white px-4 py-2 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2 text-xs font-bold text-[#FFFCF4] cursor-pointer"
                >
                  Lưu tin tuyển dụng
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#155132]/15 bg-white p-4 text-xs"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        job.isOpen
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {job.isOpen ? "Đang tuyển" : "Đã đóng"}
                    </span>
                    <span className="font-semibold text-[#8A6632]">
                      {job.department} • {job.employmentType} • {job.location}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#155132]">
                    {job.title} —{" "}
                    <span className="text-[#8A6632]">{job.salaryRange}</span>
                  </h3>
                  <p className="text-[#2B433A]/85">{job.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingJob({
                        id: job.id,
                        title: job.title,
                        department: job.department,
                        location: job.location,
                        employmentType: job.employmentType,
                        salaryRange: job.salaryRange,
                        description: job.description,
                        requirements: job.requirements,
                        contactInfo: job.contactInfo,
                        isOpen: job.isOpen,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-[#155132]/25 px-3 py-1.5 font-bold text-[#155132] hover:bg-[#FFFCF4] cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-[#BD9342]" />
                    Sửa tin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 6: ORDER NOTIFICATIONS (EMAIL & ZALO) */}
      {/* ================================================================= */}
      {activeTab === "notifications" && notificationSettings && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSaveNotificationSettings}
            className="space-y-5 rounded-2xl border border-[#155132]/20 bg-white p-5 lg:col-span-7"
          >
            <div>
              <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
                Cơ Chế Gửi Thông Báo Đơn Hàng Về Email & Zalo
              </h2>
              <p className="mt-1 text-xs text-[#2B433A]/80">
                Ngay khi khách hàng bấm “Gửi yêu cầu” tại trang Đặt hàng, hệ thống sẽ tự động gửi thông tin chi tiết đơn hàng về Email và Zalo của chủ thương hiệu.
              </p>
            </div>

            {/* Email Config */}
            <div className="space-y-3 rounded-xl bg-[#FFFCF4] p-4 border border-[#BD9342]/35">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-sm text-[#155132]">
                  <Mail className="h-4 w-4 text-[#BD9342]" />
                  1. Kênh Thông Báo Qua Email
                </span>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#155132] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.enableEmail}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        enableEmail: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#155132]"
                  />
                  Bật gửi thông báo Email
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Địa chỉ Email nhận thông báo đơn mới *
                </label>
                <input
                  type="email"
                  required
                  value={notificationSettings.notificationEmailTo}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      notificationEmailTo: e.target.value,
                    })
                  }
                  placeholder="VD: anhchu@yenhami.vn hoặc gmail của anh..."
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#155132]">
                    Resend API Key (Gửi email tự động trực tiếp)
                  </label>
                  <input
                    type="password"
                    value={notificationSettings.resendApiKey}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        resendApiKey: e.target.value,
                      })
                    }
                    placeholder="re_xxxxxxxxx (Tùy chọn)"
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#155132]">
                    Email Webhook URL (Google Script / Make / Zapier)
                  </label>
                  <input
                    type="text"
                    value={notificationSettings.emailWebhookUrl}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailWebhookUrl: e.target.value,
                      })
                    }
                    placeholder="https://script.google.com/macros/s/..."
                    className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Zalo Config */}
            <div className="space-y-3 rounded-xl bg-[#FFFCF4] p-4 border border-[#BD9342]/35">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-sm text-[#155132]">
                  <MessageCircle className="h-4 w-4 text-[#BD9342]" />
                  2. Kênh Thông Báo Qua Zalo
                </span>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-[#155132] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.enableZalo}
                    onChange={(e) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        enableZalo: e.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-[#155132]"
                  />
                  Bật gửi thông báo Zalo
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#155132]">
                  Số điện thoại Zalo của Chủ thương hiệu / Quản lý *
                </label>
                <input
                  type="text"
                  required
                  value={notificationSettings.zaloRecipientPhone}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      zaloRecipientPhone: e.target.value,
                    })
                  }
                  placeholder="VD: 0935052959"
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#155132]">
                  Zalo OA / ZNS / Webhook URL (Tự động bắn tin nhắn Zalo khi có đơn)
                </label>
                <input
                  type="text"
                  value={notificationSettings.zaloWebhookUrl}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      zaloWebhookUrl: e.target.value,
                    })
                  }
                  placeholder="https://hooks.zapier.com/... hoặc Zalo OA Webhook"
                  className="mt-1 w-full rounded-xl border border-[#155132]/25 bg-white px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2.5 text-xs font-bold text-[#FFFCF4] hover:bg-[#0e3b23] cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#BD9342]" />
                Lưu cấu hình thông báo
              </button>

              <button
                type="button"
                onClick={handleTestNotification}
                className="inline-flex items-center gap-2 rounded-xl border border-[#155132] bg-[#FFFCF4] px-4 py-2.5 text-xs font-bold text-[#155132] hover:bg-[#155132]/10 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-[#BD9342]" />
                Gửi thử thông báo ngay
              </button>
            </div>
          </form>

          {/* Notification Logs */}
          <div className="space-y-3 rounded-2xl border border-[#155132]/20 bg-white p-5 lg:col-span-5">
            <h3 className="font-serif-display text-lg font-semibold text-[#155132]">
              Nhật Ký Gửi Thông Báo Đơn Hàng ({notificationLogs.length})
            </h3>
            <p className="text-xs text-[#2B433A]/75">
              Ghi nhận toàn bộ lịch sử thông báo Email & Zalo mỗi khi có khách đặt món.
            </p>
            <div className="max-h-[460px] space-y-2.5 overflow-y-auto pr-1">
              {notificationLogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#155132]/20 p-6 text-center text-xs text-[#2B433A]/70">
                  Chưa có nhật ký thông báo nào. Hãy bấm “Gửi thử thông báo ngay” hoặc đặt thử 1 đơn hàng.
                </div>
              ) : (
                notificationLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-[#155132]/15 bg-[#FFFCF4] p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#155132]">
                        <span className="rounded-md bg-[#155132] px-2 py-0.5 text-[10px] text-[#FFFCF4]">
                          {log.channel}
                        </span>
                        Đơn: {log.orderReferenceCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          log.status === "SENT"
                            ? "text-emerald-700"
                            : log.status === "CONFIG_READY"
                              ? "text-[#8A6632]"
                              : "text-red-700"
                        }`}
                      >
                        {log.status === "SENT"
                          ? "Đã gửi thành công"
                          : log.status === "CONFIG_READY"
                            ? "Đã ghi nhận & sẵn sàng"
                            : "Lỗi gửi"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2B433A]">
                      Tới: <strong>{log.recipient}</strong>
                    </p>
                    <p className="text-[11px] text-[#2B433A]/85">
                      {log.messageSummary}
                    </p>
                    <p className="text-[10px] text-[#2B433A]/60">
                      {log.detail} •{" "}
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
