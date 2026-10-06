"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Upload,
  X,
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

type AdminSection =
  | "dashboard"
  | "orders"
  | "catalog"
  | "slots"
  | "posts"
  | "jobs"
  | "site"
  | "notifications";

const ORDER_STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
  badgeClass: string;
}[] = [
  {
    value: "PENDING_CONFIRMATION",
    label: "Chờ Hà Mi xác nhận",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
  },
  {
    value: "CONFIRMED",
    label: "Đã xác nhận lịch chưng",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-300",
  },
  {
    value: "PREPARING",
    label: "Bếp đang chưng nóng",
    badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300",
  },
  {
    value: "DELIVERING",
    label: "Đang giao nóng",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300",
  },
  {
    value: "COMPLETED",
    label: "Đã giao hoàn tất",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    value: "CANCELLED",
    label: "Đã hủy (Trả chỗ ca bếp)",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-300",
  },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "UNPAID", label: "Chưa thu tiền" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
];

const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Đang bán (AVAILABLE)" },
  { value: "OUT_OF_STOCK", label: "Tạm hết hàng (OUT_OF_STOCK)" },
  {
    value: "PENDING_DATA_APPROVAL",
    label: "Bản nháp / Chờ duyệt giá",
  },
];

const PRODUCT_CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "nguyen-ban", label: "Nguyên bản thanh khiết" },
  { value: "ngot-diu", label: "Ngọt dịu thảo mộc" },
  { value: "nhieu-tang", label: "Bồi bổ nhiều tầng vị / Set quà" },
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

  // WordPress-style navigation state
  const [activeSection, setActiveSection] = useState<AdminSection>("orders");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data state
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

  // Filters & Search (WP List Table style)
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] =
    useState<string>("ALL");

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

  // WordPress 2-Column Editor states
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
    setFeedbackMsg(data.message || "Đã lưu thông tin sản phẩm thành công.");
    setEditingProduct(null);
    loadDashboardData();
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_product", productId }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    if (res.ok && data.ok) {
      setFeedbackMsg(data.message || "Đã xóa sản phẩm.");
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
      data.message || "Đã cập nhật Giao diện & Nội dung Trang chủ thành công."
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
    setFeedbackMsg(data.message || "Đã xuất bản / lưu bài viết thành công.");
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
      "0935052959";
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

  // Computed stats & filtered lists
  const pendingOrdersCount = useMemo(
    () =>
      orders.filter((o) => o.orderStatus === "PENDING_CONFIRMATION").length,
    [orders]
  );

  const totalRevenueVnd = useMemo(
    () =>
      orders
        .filter((o) => o.orderStatus !== "CANCELLED")
        .reduce((acc, o) => acc + (o.totalVnd || 0), 0),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilterStatus !== "ALL" && o.orderStatus !== orderFilterStatus) {
        return false;
      }
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchCode = o.referenceCode.toLowerCase().includes(q);
        const matchBuyer = o.buyerName.toLowerCase().includes(q);
        const matchPhone =
          o.buyerPhone.includes(q) || o.recipientPhone.includes(q);
        return matchCode || matchBuyer || matchPhone;
      }
      return true;
    });
  }, [orders, orderFilterStatus, orderSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (
        productCategoryFilter !== "ALL" &&
        p.category !== productCategoryFilter
      ) {
        return false;
      }
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, productCategoryFilter, productSearch]);

  const openNewProductForm = () => {
    setActiveSection("catalog");
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
    });
  };

  const openNewPostForm = () => {
    setActiveSection("posts");
    setEditingPost({
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      category: "Cẩm nang yến sào",
      coverImageUrl: "/brand/catalog/set-qua-hop-sen-en.jpg",
      isPublished: true,
    });
  };

  const openNewJobForm = () => {
    setActiveSection("jobs");
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
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] flex items-center justify-center p-4 text-sm text-[#1d2327]">
        Đang tải trình quản trị Yến Sào Hà Mi...
      </div>
    );
  }

  // WordPress-style Login Screen (wp-login.php look & feel)
  if (!staff) {
    return (
      <div className="min-h-screen bg-[#f0f0f1] flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-5 flex flex-col items-center text-center">
          <Link href="/" className="group flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/ha-mi-logo-web-640.png"
              alt="Yến Sào Hà Mi"
              className="h-20 w-20 object-contain drop-shadow-xs"
            />
            <span className="mt-2 font-serif-display text-xl font-bold text-[#155132]">
              YẾN SÀO HÀ MI — WP ADMIN
            </span>
          </Link>
        </div>

        <div className="w-full max-w-[380px] rounded-md border border-[#c3c4c7] bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-[#dcdcde] pb-3 mb-4">
            <Lock className="h-4 w-4 text-[#155132]" />
            <h1 className="text-sm font-bold text-[#1d2327]">
              Đăng nhập Quản trị Website
            </h1>
          </div>

          {authError && (
            <div
              role="alert"
              className="mb-4 border-l-4 border-red-600 bg-red-50 p-3 text-xs text-red-900"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-semibold text-[#1d2327] mb-1"
              >
                Tên người dùng hoặc Địa chỉ Email
              </label>
              <input
                id="admin-username"
                data-testid="admin-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full min-h-[40px] rounded-xs border border-[#8c8f94] px-3 py-2 text-sm text-[#1d2327] focus:border-[#155132] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#1d2327] mb-1"
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
                placeholder="Mặc định: hami2026"
                className="w-full min-h-[40px] rounded-xs border border-[#8c8f94] px-3 py-2 text-sm text-[#1d2327] focus:border-[#155132] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              data-testid="admin-login-btn"
              className="w-full min-h-[40px] rounded-xs bg-[#155132] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e3b23] transition cursor-pointer"
            >
              Đăng nhập
            </button>
          </form>
        </div>

        <p className="mt-4 text-xs text-[#50575e]">
          <Link href="/" className="hover:text-[#155132] hover:underline">
            ← Quay lại trang chủ Yến Sào Hà Mi
          </Link>
        </p>
      </div>
    );
  }

  // Sidebar Menu Definition (WordPress wp-admin style)
  const navGroups: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    subItems?: { label: string; onClick: () => void; active?: boolean }[];
  }[] = [
    {
      id: "dashboard",
      label: "Bảng tin (Dashboard)",
      icon: LayoutDashboard,
    },
    {
      id: "orders",
      label: "Đơn đặt hàng",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : orders.length,
    },
    {
      id: "catalog",
      label: "Sản phẩm / Món ăn",
      icon: Package,
      subItems: [
        {
          label: `Tất cả sản phẩm (${products.length})`,
          onClick: () => {
            setActiveSection("catalog");
            setEditingProduct(null);
          },
          active: activeSection === "catalog" && !editingProduct,
        },
        {
          label: "+ Thêm sản phẩm mới",
          onClick: openNewProductForm,
          active: activeSection === "catalog" && Boolean(editingProduct),
        },
        {
          label: "Khung giờ Ca bếp",
          onClick: () => setActiveSection("slots"),
          active: activeSection === "slots",
        },
      ],
    },
    {
      id: "posts",
      label: "Bài viết (Blog)",
      icon: FileText,
      subItems: [
        {
          label: `Tất cả bài viết (${posts.length})`,
          onClick: () => {
            setActiveSection("posts");
            setEditingPost(null);
          },
          active: activeSection === "posts" && !editingPost,
        },
        {
          label: "+ Viết bài mới",
          onClick: openNewPostForm,
          active: activeSection === "posts" && Boolean(editingPost),
        },
      ],
    },
    {
      id: "jobs",
      label: "Tuyển dụng",
      icon: Briefcase,
      subItems: [
        {
          label: `Vị trí tuyển dụng (${jobs.length})`,
          onClick: () => {
            setActiveSection("jobs");
            setEditingJob(null);
          },
          active: activeSection === "jobs" && !editingJob,
        },
        {
          label: "+ Đăng tin mới",
          onClick: openNewJobForm,
          active: activeSection === "jobs" && Boolean(editingJob),
        },
      ],
    },
    {
      id: "site",
      label: "Giao diện & Trang chủ",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Cài đặt Email & Zalo",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#1d2327] flex flex-col">
      {/* ===================================================================== */}
      {/* 1. WORDPRESS TOP ADMIN BAR (#wpadminbar)                              */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-50 h-11 bg-[#1d2327] text-[#f0f0f1] px-3 flex items-center justify-between text-xs select-none shadow-xs">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 rounded hover:bg-[#2c3338] text-white cursor-pointer"
            aria-label="Mở menu quản trị"
          >
            {mobileSidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[#2c3338] hover:text-[#72aee6] transition"
            title="Mở trang chủ Yến Sào Hà Mi trong tab mới"
          >
            <Home className="h-4 w-4 text-[#BD9342]" />
            <span className="font-semibold tracking-wide">Yến Sào Hà Mi</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#a7aaad]">
              (Xem trang web <ExternalLink className="h-3 w-3" />)
            </span>
          </Link>

          {/* Quick "+ Tạo mới (New)" actions like WordPress */}
          <div className="hidden md:flex items-center gap-1 border-l border-[#3c434a] pl-3">
            <button
              type="button"
              onClick={openNewProductForm}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[#2c3338] text-[#f0f0f1] hover:text-[#BD9342] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#BD9342]" />
              <span>Thêm Món</span>
            </button>
            <button
              type="button"
              onClick={openNewPostForm}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[#2c3338] text-[#f0f0f1] hover:text-[#BD9342] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#BD9342]" />
              <span>Viết Bài</span>
            </button>
            <button
              type="button"
              onClick={openNewJobForm}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-[#2c3338] text-[#f0f0f1] hover:text-[#BD9342] cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#BD9342]" />
              <span>Tuyển Dụng</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex items-center gap-1.5 rounded bg-[#2c3338] px-2.5 py-1 text-[11px] font-medium text-[#f0f0f1] hover:bg-[#3c434a] cursor-pointer"
          >
            <RefreshCw
              className={`h-3 w-3 ${loadingData ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#c3c4c7]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#BD9342]" />
            <span>
              Xin chào, <strong className="text-white">{staff.displayName}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1 rounded bg-rose-700/80 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-600 cursor-pointer"
          >
            <LogOut className="h-3 w-3" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. BODY: LEFT SIDEBAR (#adminmenuwrap) + MAIN WORKSPACE (#wpbody)     */}
      {/* ===================================================================== */}
      <div className="flex flex-1 relative">
        {/* Left Sidebar Navigation */}
        <aside
          className={`${
            mobileSidebarOpen ? "fixed inset-y-11 left-0 z-40 flex" : "hidden"
          } lg:flex w-60 shrink-0 flex-col bg-[#1d2327] text-[#f0f0f1] border-r border-[#2c3338] select-none`}
        >
          <div className="p-3 border-b border-[#2c3338] flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/ha-mi-logo-web-640.png"
              alt="Logo Hà Mi"
              className="h-9 w-9 rounded bg-white p-0.5 object-contain"
            />
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                QUẢN TRỊ HÀ MI
              </p>
              <p className="text-[10px] text-[#a7aaad]">
                CMS & Điều phối Đơn hàng
              </p>
            </div>
          </div>

          <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
            {navGroups.map((group) => {
              const Icon = group.icon;
              const isGroupActive =
                activeSection === group.id ||
                (group.id === "catalog" && activeSection === "slots");

              return (
                <div key={group.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSection(group.id);
                      setMobileSidebarOpen(false);
                      if (group.id === "catalog") setEditingProduct(null);
                      if (group.id === "posts") setEditingPost(null);
                      if (group.id === "jobs") setEditingJob(null);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium transition cursor-pointer border-l-4 ${
                      isGroupActive
                        ? "bg-[#155132] text-white border-[#BD9342] font-semibold"
                        : "border-transparent text-[#c3c4c7] hover:bg-[#2c3338] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 ${
                          isGroupActive ? "text-[#BD9342]" : "text-[#a7aaad]"
                        }`}
                      />
                      <span>{group.label}</span>
                    </span>
                    {group.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          pendingOrdersCount > 0 && group.id === "orders"
                            ? "bg-[#d63638] text-white"
                            : "bg-[#2c3338] text-[#f0f0f1]"
                        }`}
                      >
                        {group.badge}
                      </span>
                    )}
                  </button>

                  {/* WordPress-style Submenu */}
                  {group.subItems && isGroupActive && (
                    <div className="bg-[#2c3338] py-1.5 space-y-0.5">
                      {group.subItems.map((sub) => (
                        <button
                          key={sub.label}
                          type="button"
                          onClick={() => {
                            sub.onClick();
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full text-left pl-10 pr-3 py-1.5 text-[11px] transition cursor-pointer flex items-center gap-1.5 ${
                            sub.active
                              ? "text-white font-bold"
                              : "text-[#c3c4c7] hover:text-white"
                          }`}
                        >
                          <ChevronRight className="h-3 w-3 text-[#BD9342]" />
                          <span>{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-[#2c3338] text-[11px] text-[#a7aaad] space-y-1">
            <p className="flex items-center justify-between">
              <span>Trạng thái Email:</span>
              <span
                className={
                  notificationSettings?.enableEmail
                    ? "text-emerald-400 font-semibold"
                    : "text-amber-400"
                }
              >
                {notificationSettings?.enableEmail ? "Đang bật" : "Đang tắt"}
              </span>
            </p>
            <p className="flex items-center justify-between">
              <span>Trạng thái Zalo:</span>
              <span
                className={
                  notificationSettings?.enableZalo
                    ? "text-emerald-400 font-semibold"
                    : "text-amber-400"
                }
              >
                {notificationSettings?.enableZalo ? "Đang bật" : "Đang tắt"}
              </span>
            </p>
          </div>
        </aside>

        {/* Main Content Area (#wpbody-content) */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1440px]">
          {/* WordPress Notice Banner */}
          {feedbackMsg && (
            <div
              role="status"
              data-testid="admin-feedback-banner"
              className="mb-5 flex items-center justify-between rounded-xs border border-[#c3c4c7] border-l-4 border-l-[#155132] bg-white px-4 py-3 text-xs font-medium text-[#1d2327] shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#155132] shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-xs font-semibold text-[#50575e] hover:text-[#1d2327] underline ml-4 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 0: BẢNG TIN (WORDPRESS DASHBOARD AT A GLANCE)             */}
          {/* ================================================================= */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    Bảng tin Quản trị (Dashboard)
                  </h1>
                  <p className="text-xs text-[#50575e] mt-0.5">
                    Tổng quan hoạt động kinh doanh, đơn hàng, món ăn, bài viết và thông báo tự động.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openNewProductForm}
                    className="inline-flex items-center gap-1.5 rounded-xs bg-[#155132] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0e3b23] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-[#BD9342]" />
                    Thêm sản phẩm mới
                  </button>
                  <button
                    type="button"
                    onClick={openNewPostForm}
                    className="inline-flex items-center gap-1.5 rounded-xs border border-[#155132] bg-white px-3.5 py-2 text-xs font-semibold text-[#155132] hover:bg-[#f6f7f7] cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Viết bài mới
                  </button>
                </div>
              </div>

              {/* KPI Metaboxes */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setActiveSection("orders")}
                  className="text-left rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs hover:border-[#155132] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#50575e]">
                      Tổng đơn đặt hàng
                    </span>
                    <ShoppingBag className="h-4 w-4 text-[#155132]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#1d2327]">
                    {orders.length} đơn
                  </p>
                  <p className="mt-1 text-[11px] text-[#50575e]">
                    Doanh thu tạm tính:{" "}
                    <strong className="text-[#155132]">
                      {formatVnd(totalRevenueVnd)}
                    </strong>
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("catalog")}
                  className="text-left rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs hover:border-[#155132] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#50575e]">
                      Sản phẩm & Món ăn
                    </span>
                    <Package className="h-4 w-4 text-[#155132]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#1d2327]">
                    {products.length} món
                  </p>
                  <p className="mt-1 text-[11px] text-[#50575e]">
                    Đang mở bán:{" "}
                    <strong className="text-emerald-700">
                      {products.filter((p) => p.status === "AVAILABLE").length}{" "}
                      món
                    </strong>
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("posts")}
                  className="text-left rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs hover:border-[#155132] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#50575e]">
                      Bài viết & Cẩm nang
                    </span>
                    <FileText className="h-4 w-4 text-[#155132]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#1d2327]">
                    {posts.length} bài
                  </p>
                  <p className="mt-1 text-[11px] text-[#50575e]">
                    Đã xuất bản:{" "}
                    <strong className="text-[#155132]">
                      {posts.filter((p) => p.isPublished).length} bài viết
                    </strong>
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection("jobs")}
                  className="text-left rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs hover:border-[#155132] transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#50575e]">
                      Tin tuyển dụng
                    </span>
                    <Briefcase className="h-4 w-4 text-[#155132]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[#1d2327]">
                    {jobs.length} vị trí
                  </p>
                  <p className="mt-1 text-[11px] text-[#50575e]">
                    Đang nhận hồ sơ:{" "}
                    <strong className="text-emerald-700">
                      {jobs.filter((j) => j.isOpen).length} vị trí
                    </strong>
                  </p>
                </button>
              </div>

              {/* 2-Column WordPress Dashboard Metaboxes */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Recent Orders Metabox */}
                <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs lg:col-span-7">
                  <div className="flex items-center justify-between border-b border-[#c3c4c7] px-4 py-3">
                    <h2 className="text-sm font-bold text-[#1d2327]">
                      Đơn đặt hàng gần đây
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("orders")}
                      className="text-xs font-semibold text-[#155132] hover:underline cursor-pointer"
                    >
                      Xem tất cả ({orders.length}) →
                    </button>
                  </div>
                  <div className="divide-y divide-[#f0f0f1]">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-[#155132]">
                            {ord.referenceCode}
                          </span>{" "}
                          — <strong>{ord.buyerName}</strong> ({ord.buyerPhone})
                          <p className="text-[11px] text-[#50575e] mt-0.5">
                            Giao: {ord.requestedDate} • {ord.slotLabelSnapshot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-[#1d2327]">
                            {formatVnd(ord.totalVnd)}
                          </span>
                          <span className="block text-[10px] text-[#50575e]">
                            {ord.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Notification Status & Shortcuts Metabox */}
                <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs lg:col-span-5">
                  <div className="flex items-center justify-between border-b border-[#c3c4c7] px-4 py-3">
                    <h2 className="text-sm font-bold text-[#1d2327]">
                      Trạng thái Thông báo Đơn hàng (Email & Zalo)
                    </h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection("notifications")}
                      className="text-xs font-semibold text-[#155132] hover:underline cursor-pointer"
                    >
                      Cấu hình →
                    </button>
                  </div>
                  <div className="p-4 space-y-3 text-xs">
                    <div className="rounded-xs border border-[#dcdcde] bg-[#f6f7f7] p-3 space-y-1.5">
                      <p className="flex items-center justify-between">
                        <span className="font-semibold">Email nhận đơn:</span>
                        <span className="font-mono text-[#155132]">
                          {notificationSettings?.notificationEmailTo ||
                            "Chưa cài đặt"}
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="font-semibold">Zalo nhận đơn:</span>
                        <span className="font-mono text-[#155132]">
                          {notificationSettings?.zaloRecipientPhone ||
                            "Chưa cài đặt"}
                        </span>
                      </p>
                    </div>

                    <p className="font-semibold text-[#1d2327]">
                      Nhật ký gửi thông báo gần nhất:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {notificationLogs.slice(0, 4).map((log) => (
                        <div
                          key={log.id}
                          className="border-l-2 border-[#155132] pl-2.5 py-1 text-[11px]"
                        >
                          <strong>
                            [{log.channel}] Đơn {log.orderReferenceCode}
                          </strong>{" "}
                          → {log.recipient} ({log.status})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 1: ĐƠN ĐẶT HÀNG (WOOCOMMERCE ORDERS LAYOUT)               */}
          {/* ================================================================= */}
          {activeSection === "orders" && (
            <div className="space-y-5">
              {/* WP Page Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    Quản lý Đơn đặt hàng
                  </h1>
                  <p className="text-xs text-[#50575e] mt-0.5">
                    Xác nhận lịch chưng yến, cập nhật trạng thái thanh toán và gửi thông báo nhanh qua Zalo / Email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection("notifications")}
                  className="inline-flex items-center gap-1.5 rounded-xs border border-[#155132] bg-white px-3 py-1.5 text-xs font-semibold text-[#155132] hover:bg-[#f6f7f7] cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5 text-[#BD9342]" />
                  Cài đặt tự động báo Email ({notificationSettings?.notificationEmailTo}) & Zalo ({notificationSettings?.zaloRecipientPhone})
                </button>
              </div>

              {/* WP Subsubsub Filter Bar + Search Box */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xs border border-[#c3c4c7]">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {[
                    { code: "ALL", label: `Tất cả (${orders.length})` },
                    {
                      code: "PENDING_CONFIRMATION",
                      label: `Chờ xác nhận (${
                        orders.filter(
                          (o) => o.orderStatus === "PENDING_CONFIRMATION"
                        ).length
                      })`,
                    },
                    {
                      code: "CONFIRMED",
                      label: `Đã xác nhận (${
                        orders.filter((o) => o.orderStatus === "CONFIRMED")
                          .length
                      })`,
                    },
                    {
                      code: "PREPARING",
                      label: `Đang chưng (${
                        orders.filter((o) => o.orderStatus === "PREPARING")
                          .length
                      })`,
                    },
                    {
                      code: "COMPLETED",
                      label: `Hoàn tất (${
                        orders.filter((o) => o.orderStatus === "COMPLETED")
                          .length
                      })`,
                    },
                    {
                      code: "CANCELLED",
                      label: `Đã hủy (${
                        orders.filter((o) => o.orderStatus === "CANCELLED")
                          .length
                      })`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.code}
                      type="button"
                      onClick={() => setOrderFilterStatus(tab.code)}
                      className={`px-2.5 py-1 rounded-xs font-medium cursor-pointer ${
                        orderFilterStatus === tab.code
                          ? "bg-[#155132] text-white font-semibold"
                          : "text-[#2271b1] hover:bg-[#f0f0f1]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[240px]">
                  <Search className="h-3.5 w-3.5 text-[#50575e] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm mã đơn, tên khách, SĐT..."
                    className="w-full rounded-xs border border-[#8c8f94] bg-white pl-8 pr-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-xs border border-[#c3c4c7] bg-white p-10 text-center text-sm text-[#50575e]">
                  Không tìm thấy đơn hàng nào khớp bộ lọc.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const statusMeta =
                      ORDER_STATUS_OPTIONS.find(
                        (s) => s.value === order.orderStatus
                      ) || ORDER_STATUS_OPTIONS[0];

                    return (
                      <div
                        key={order.id}
                        data-testid={`admin-order-card-${order.referenceCode}`}
                        className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs overflow-hidden"
                      >
                        {/* Order Card Header Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-2.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-[#155132]">
                              #{order.referenceCode}
                            </span>
                            <span
                              className={`rounded-xs border px-2 py-0.5 text-[11px] font-semibold ${statusMeta.badgeClass}`}
                            >
                              {statusMeta.label}
                            </span>
                            <span className="rounded-xs bg-[#FFFCF4] border border-[#BD9342]/50 px-2 py-0.5 text-[11px] font-semibold text-[#8A6632]">
                              {order.orderPurpose === "GIFT"
                                ? "Quà biếu tặng"
                                : "Mua dùng"}
                            </span>
                            <span className="text-xs text-[#50575e]">
                              Lịch giao:{" "}
                              <strong className="text-[#1d2327]">
                                {order.requestedDate}
                              </strong>{" "}
                              ({order.slotLabelSnapshot})
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleQuickShareZalo(order)}
                              className="inline-flex items-center gap-1 rounded-xs border border-[#155132]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#155132] hover:bg-[#155132] hover:text-white cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5 text-[#BD9342]" />
                              Báo qua Zalo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickShareEmail(order)}
                              className="inline-flex items-center gap-1 rounded-xs border border-[#155132]/30 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#155132] hover:bg-[#155132] hover:text-white cursor-pointer"
                            >
                              <Mail className="h-3.5 w-3.5 text-[#BD9342]" />
                              Gửi Email
                            </button>
                            <span className="text-xs font-bold text-[#155132] pl-1">
                              Tổng: {formatVnd(order.totalVnd)}
                            </span>
                          </div>
                        </div>

                        {/* Order Card 3-Column Body */}
                        <div className="p-4 grid grid-cols-1 gap-4 text-xs md:grid-cols-12">
                          <div className="md:col-span-4 space-y-1">
                            <p className="font-bold text-[#1d2327] uppercase text-[11px] tracking-wider text-[#50575e]">
                              Thông tin khách & Địa chỉ giao
                            </p>
                            <p className="text-[#1d2327]">
                              Người đặt: <strong>{order.buyerName}</strong> —{" "}
                              <a
                                href={`tel:${order.buyerPhone}`}
                                className="font-bold text-[#155132] underline"
                              >
                                {order.buyerPhone}
                              </a>
                            </p>
                            <p className="text-[#1d2327]">
                              Người nhận: <strong>{order.recipientName}</strong>{" "}
                              ({order.recipientPhone})
                            </p>
                            <p className="text-[#50575e]">
                              Địa chỉ: {order.addressDetail}
                            </p>
                            {order.buyerNote && (
                              <p className="text-[#8A6632]">
                                Ghi chú khách: “{order.buyerNote}”
                              </p>
                            )}
                            {order.giftMessage && (
                              <p className="italic text-[#8A6632] bg-[#FFFCF4] p-2 rounded border border-[#BD9342]/30 mt-1">
                                Thiệp quà tặng: “{order.giftMessage}”
                              </p>
                            )}
                          </div>

                          <div className="md:col-span-4 space-y-1">
                            <p className="font-bold uppercase text-[11px] tracking-wider text-[#50575e]">
                              Chi tiết món đặt ({order.items.length} dòng)
                            </p>
                            <ul className="space-y-1.5 text-[#1d2327]">
                              {order.items.map((it) => (
                                <li
                                  key={it.id}
                                  className="flex items-start justify-between gap-2 border-b border-dashed border-[#dcdcde] pb-1"
                                >
                                  <span>
                                    <strong>{it.productNameSnapshot}</strong> ×{" "}
                                    {it.quantity}
                                    <span className="block text-[11px] text-[#50575e]">
                                      {it.variantNameSnapshot} •{" "}
                                      {it.selectedOptionSnapshot}
                                    </span>
                                  </span>
                                  <span className="font-semibold shrink-0">
                                    {formatVnd(it.lineTotalSnapshot)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Order Action Metabox */}
                          <div className="md:col-span-4 space-y-2.5 rounded-xs bg-[#f6f7f7] border border-[#dcdcde] p-3">
                            <div>
                              <label className="block text-[11px] font-bold text-[#1d2327]">
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
                                className="mt-1 w-full rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1d2327]"
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
                                <label className="block text-[11px] font-bold text-[#1d2327]">
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
                                  className="mt-1 w-full rounded-xs border border-[#8c8f94] bg-white px-2 py-1.5 text-xs"
                                >
                                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#1d2327]">
                                  Phí giao (VNĐ):
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step={5000}
                                  value={
                                    draftShippingFee[order.referenceCode] ?? ""
                                  }
                                  onChange={(e) =>
                                    setDraftShippingFee((prev) => ({
                                      ...prev,
                                      [order.referenceCode]: e.target.value,
                                    }))
                                  }
                                  placeholder="0 (Free Ship)"
                                  className="mt-1 w-full rounded-xs border border-[#8c8f94] bg-white px-2 py-1.5 text-xs"
                                />
                              </div>
                            </div>

                            <input
                              type="text"
                              value={draftNote[order.referenceCode] || ""}
                              onChange={(e) =>
                                setDraftNote((prev) => ({
                                  ...prev,
                                  [order.referenceCode]: e.target.value,
                                }))
                              }
                              placeholder="Ghi chú nội bộ (VD: Đã gọi xác nhận giao 9h)..."
                              className="w-full rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 text-xs"
                            />

                            <button
                              type="button"
                              data-testid={`admin-save-order-${order.referenceCode}`}
                              onClick={() =>
                                handleUpdateOrder(order.referenceCode)
                              }
                              className="flex w-full items-center justify-center gap-1.5 rounded-xs bg-[#155132] px-3 py-2 text-xs font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#BD9342]" />
                              Lưu cập nhật đơn
                            </button>
                          </div>
                        </div>

                        {order.history.length > 0 && (
                          <div className="bg-[#f6f7f7] border-t border-[#dcdcde] px-4 py-2 text-[11px] text-[#50575e]">
                            <strong>Lịch sử mới nhất:</strong>{" "}
                            {order.history[0].toStatus} (
                            {order.history[0].toPaymentStatus}) —{" "}
                            {order.history[0].note} (bởi{" "}
                            {order.history[0].changedByStaffName})
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 2: SẢN PHẨM / MÓN ĂN (WP LIST TABLE + 2-COL EDITOR)       */}
          {/* ================================================================= */}
          {activeSection === "catalog" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    {editingProduct
                      ? editingProduct.id
                        ? "Chỉnh sửa Sản phẩm / Món ăn"
                        : "Thêm Sản phẩm / Món mới"
                      : "Sản phẩm & Thực đơn Yến Sào"}
                  </h1>
                  {!editingProduct && (
                    <button
                      type="button"
                      onClick={openNewProductForm}
                      className="rounded-xs border border-[#155132] bg-white px-3 py-1 text-xs font-semibold text-[#155132] hover:bg-[#155132] hover:text-white transition cursor-pointer"
                    >
                      + Thêm sản phẩm mới
                    </button>
                  )}
                </div>

                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="rounded-xs border border-[#8c8f94] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d2327] hover:bg-[#f6f7f7] cursor-pointer"
                  >
                    ← Quay lại danh sách sản phẩm
                  </button>
                )}
              </div>

              {/* WORDPRESS 2-COLUMN PRODUCT EDITOR */}
              {editingProduct ? (
                <form
                  onSubmit={handleSaveProductFull}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
                >
                  {/* Left Column (8/12): Title, Description, Product Data Metabox */}
                  <div className="space-y-5 lg:col-span-8">
                    <div className="rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1d2327] mb-1">
                          Tên món / Tên sản phẩm *
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
                          placeholder="Nhập tên món yến hoặc set quà tặng..."
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-base font-semibold text-[#1d2327]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1d2327] mb-1">
                          Mô tả ngắn & Công dụng sản phẩm
                        </label>
                        <textarea
                          rows={4}
                          value={editingProduct.shortDescription}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              shortDescription: e.target.value,
                            })
                          }
                          placeholder="Mô tả hương vị, định lượng tổ yến và công dụng bồi bổ..."
                          className="w-full rounded-xs border border-[#8c8f94] p-3 text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* WooCommerce-style Product Data Metabox */}
                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">
                          Dữ liệu Sản phẩm (Giá bán, Dung tích & Thành phần)
                        </h2>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-xs font-bold text-[#1d2327]">
                              Giá bán niêm yết (VNĐ)
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
                              className="mt-1 w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1d2327]">
                              Dung tích / Định lượng (ml hoặc gram)
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
                              className="mt-1 w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#1d2327]">
                            Nguyên liệu chưng cùng (cách nhau bằng dấu phẩy)
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
                            placeholder="VD: Tổ yến nguyên chất, táo đỏ, hạt sen, đường phèn"
                            className="mt-1 w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (4/12): Publish Box, Category Box, Featured Image Box */}
                  <div className="space-y-5 lg:col-span-4">
                    {/* Publish Metabox */}
                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h3 className="text-xs font-bold text-[#1d2327]">
                          Đăng / Cập nhật sản phẩm
                        </h3>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold text-[#1d2327] mb-1">
                            Trạng thái hiển thị:
                          </label>
                          <select
                            value={editingProduct.status}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                status: e.target.value as ProductStatus,
                              })
                            }
                            className="w-full rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 text-xs font-semibold"
                          >
                            {PRODUCT_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#dcdcde]">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="text-xs text-rose-700 hover:underline cursor-pointer"
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            className="rounded-xs bg-[#155132] px-4 py-2 text-xs font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                          >
                            {editingProduct.id
                              ? "Cập nhật sản phẩm"
                              : "Đăng sản phẩm mới"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Category Metabox */}
                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h3 className="text-xs font-bold text-[#1d2327]">
                          Danh mục sản phẩm
                        </h3>
                      </div>
                      <div className="p-4 space-y-2 text-xs">
                        {PRODUCT_CATEGORY_OPTIONS.map((cat) => (
                          <label
                            key={cat.value}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="product-category"
                              checked={editingProduct.category === cat.value}
                              onChange={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  category: cat.value,
                                })
                              }
                              className="accent-[#155132]"
                            />
                            <span>{cat.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Featured Image Metabox */}
                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h3 className="text-xs font-bold text-[#1d2327]">
                          Ảnh đại diện sản phẩm (Product Image)
                        </h3>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="aspect-square w-full overflow-hidden rounded-xs border border-[#dcdcde] bg-[#f6f7f7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              editingProduct.imageUrl ||
                              "/brand/catalog/yen-hu-75ml-100ml-cam-tay.jpg"
                            }
                            alt={editingProduct.name || "Product preview"}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <label className="flex w-full items-center justify-center gap-1.5 rounded-xs border border-[#155132] bg-[#f6f7f7] px-3 py-2 text-xs font-bold text-[#155132] hover:bg-[#155132] hover:text-white transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          Tải ảnh mới từ máy tính
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const dataUrl = await readAndCompressImageFile(
                                file,
                                900
                              );
                              setEditingProduct((prev) =>
                                prev ? { ...prev, imageUrl: dataUrl } : prev
                              );
                            }}
                          />
                        </label>

                        <div>
                          <label className="block text-[11px] text-[#50575e] mb-1">
                            Hoặc nhập URL ảnh:
                          </label>
                          <input
                            type="text"
                            value={editingProduct.imageUrl}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                imageUrl: e.target.value,
                              })
                            }
                            className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* WORDPRESS WP_LIST_TABLE FOR PRODUCTS */
                <div className="space-y-3">
                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xs border border-[#c3c4c7]">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Filter className="h-3.5 w-3.5 text-[#50575e]" />
                      <select
                        value={productCategoryFilter}
                        onChange={(e) =>
                          setProductCategoryFilter(e.target.value)
                        }
                        className="rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 text-xs"
                      >
                        <option value="ALL">
                          Tất cả danh mục ({products.length})
                        </option>
                        {PRODUCT_CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="relative min-w-[240px]">
                      <Search className="h-3.5 w-3.5 text-[#50575e] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="search"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Tìm kiếm tên món..."
                        className="w-full rounded-xs border border-[#8c8f94] bg-white pl-8 pr-3 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  {/* WP Table */}
                  <div className="overflow-x-auto rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] text-[#1d2327] font-bold">
                          <th className="py-2.5 px-3 w-16">Ảnh</th>
                          <th className="py-2.5 px-3">Tên món / Sản phẩm</th>
                          <th className="py-2.5 px-3">Danh mục</th>
                          <th className="py-2.5 px-3">Định lượng</th>
                          <th className="py-2.5 px-3">Giá bán</th>
                          <th className="py-2.5 px-3">Trạng thái</th>
                          <th className="py-2.5 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#dcdcde]">
                        {filteredProducts.map((prod) => (
                          <tr
                            key={prod.id}
                            className="hover:bg-[#f6f7f7] transition"
                          >
                            <td className="py-2.5 px-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="h-12 w-12 rounded-xs object-cover border border-[#c3c4c7]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    id: prod.id,
                                    slug: prod.slug,
                                    name: prod.name,
                                    category: prod.category,
                                    volumeMl: prod.volumeMl,
                                    ingredientsText:
                                      prod.ingredients.join(", "),
                                    shortDescription: prod.shortDescription,
                                    imageUrl: prod.imageUrl,
                                    priceVnd:
                                      prod.priceVnd !== null
                                        ? String(prod.priceVnd)
                                        : "",
                                    status: prod.status,
                                  })
                                }
                                className="font-bold text-sm text-[#155132] hover:underline text-left cursor-pointer"
                              >
                                {prod.name}
                              </button>
                              <p className="text-[11px] text-[#50575e] line-clamp-1 mt-0.5">
                                {prod.ingredients.join(", ")}
                              </p>
                            </td>
                            <td className="py-2.5 px-3 text-[#50575e]">
                              {prod.categoryLabel}
                            </td>
                            <td className="py-2.5 px-3 font-medium">
                              {prod.volumeMl}ml
                            </td>
                            <td className="py-2.5 px-3 font-bold text-[#155132]">
                              {formatVnd(prod.priceVnd)}
                            </td>
                            <td className="py-2.5 px-3">
                              <select
                                value={prod.status}
                                onChange={(e) =>
                                  handleUpdateProductStatus(
                                    prod,
                                    e.target.value as ProductStatus
                                  )
                                }
                                className="rounded-xs border border-[#8c8f94] bg-white px-2 py-1 text-[11px] font-semibold text-[#1d2327]"
                              >
                                {PRODUCT_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingProduct({
                                    id: prod.id,
                                    slug: prod.slug,
                                    name: prod.name,
                                    category: prod.category,
                                    volumeMl: prod.volumeMl,
                                    ingredientsText:
                                      prod.ingredients.join(", "),
                                    shortDescription: prod.shortDescription,
                                    imageUrl: prod.imageUrl,
                                    priceVnd:
                                      prod.priceVnd !== null
                                        ? String(prod.priceVnd)
                                        : "",
                                    status: prod.status,
                                  })
                                }
                                className="inline-flex items-center gap-1 rounded-xs border border-[#155132] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#155132] hover:bg-[#155132] hover:text-white mr-1.5 cursor-pointer"
                              >
                                <Edit3 className="h-3 w-3" />
                                Sửa & Ảnh
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteProduct(prod.id, prod.name)
                                }
                                className="inline-flex items-center gap-1 rounded-xs border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 2B: KHUNG GIỜ CA BẾP (08:00 - 21:00)                      */}
          {/* ================================================================= */}
          {activeSection === "slots" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    Năng lực Khung giờ Giao hàng (08:00 – 21:00)
                  </h1>
                  <p className="text-xs text-[#50575e] mt-0.5">
                    Theo dõi số lượng thố yến đã đặt theo từng khung giờ trong ngày.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xs border border-[#c3c4c7] bg-white p-4 flex items-center justify-between text-xs shadow-2xs"
                  >
                    <span className="flex items-center gap-2 font-bold text-[#1d2327]">
                      <Clock className="h-4 w-4 text-[#155132]" />
                      {slot.label} ({slot.timeWindow})
                    </span>
                    <span className="rounded-full bg-[#f0f0f1] px-2.5 py-1 font-semibold text-[#155132]">
                      {slot.reservedBowls}/{slot.maxCapacityBowls} thố
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 3: BÀI VIẾT / TIN TỨC (WP POSTS TABLE + 2-COL EDITOR)     */}
          {/* ================================================================= */}
          {activeSection === "posts" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    {editingPost
                      ? editingPost.id
                        ? "Chỉnh sửa Bài viết"
                        : "Viết Bài mới"
                      : "Bài viết & Cẩm nang Yến Sào"}
                  </h1>
                  {!editingPost && (
                    <button
                      type="button"
                      onClick={openNewPostForm}
                      className="rounded-xs border border-[#155132] bg-white px-3 py-1 text-xs font-semibold text-[#155132] hover:bg-[#155132] hover:text-white transition cursor-pointer"
                    >
                      + Viết bài mới
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/bai-viet"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xs border border-[#8c8f94] bg-white px-3 py-1.5 text-xs font-medium text-[#1d2327] hover:bg-[#f6f7f7]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Xem trang /bai-viet
                  </a>
                  {editingPost && (
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="rounded-xs border border-[#8c8f94] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d2327] cursor-pointer"
                    >
                      ← Quay lại danh sách bài viết
                    </button>
                  )}
                </div>
              </div>

              {editingPost ? (
                <form
                  onSubmit={handleSavePost}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
                >
                  {/* Left Column (8/12): Title, Excerpt, Content */}
                  <div className="space-y-4 lg:col-span-8">
                    <div className="rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#1d2327] mb-1">
                          Tiêu đề bài viết *
                        </label>
                        <input
                          type="text"
                          required
                          value={editingPost.title}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              title: e.target.value,
                            })
                          }
                          placeholder="Nhập tiêu đề bài viết tại đây..."
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-base font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1d2327] mb-1">
                          Tóm tắt ngắn (Excerpt)
                        </label>
                        <textarea
                          rows={2}
                          value={editingPost.excerpt}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              excerpt: e.target.value,
                            })
                          }
                          placeholder="Đoạn tóm tắt hiển thị ngoài danh sách bài viết..."
                          className="w-full rounded-xs border border-[#8c8f94] p-2.5 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1d2327] mb-1">
                          Nội dung bài viết *
                        </label>
                        <textarea
                          rows={12}
                          required
                          value={editingPost.content}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              content: e.target.value,
                            })
                          }
                          placeholder="Soạn thảo nội dung chi tiết bài viết..."
                          className="w-full rounded-xs border border-[#8c8f94] p-3 text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column (4/12): Publish, Category, Featured Image */}
                  <div className="space-y-4 lg:col-span-4">
                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h3 className="text-xs font-bold text-[#1d2327]">
                          Đăng bài viết (Publish)
                        </h3>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">
                            Trạng thái:
                          </label>
                          <select
                            value={
                              editingPost.isPublished ? "PUBLISHED" : "DRAFT"
                            }
                            onChange={(e) =>
                              setEditingPost({
                                ...editingPost,
                                isPublished: e.target.value === "PUBLISHED",
                              })
                            }
                            className="w-full rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 text-xs font-semibold"
                          >
                            <option value="PUBLISHED">
                              Đã xuất bản (Công khai)
                            </option>
                            <option value="DRAFT">Bản nháp (Ẩn)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">
                            Chuyên mục:
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
                            className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#dcdcde]">
                          <button
                            type="button"
                            onClick={() => setEditingPost(null)}
                            className="text-rose-700 hover:underline cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="rounded-xs bg-[#155132] px-4 py-2 font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                          >
                            {editingPost.id ? "Cập nhật bài viết" : "Đăng bài"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                      <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-2.5">
                        <h3 className="text-xs font-bold text-[#1d2327]">
                          Ảnh đại diện bài viết (Featured Image)
                        </h3>
                      </div>
                      <div className="p-4 space-y-3 text-xs">
                        <div className="aspect-[16/10] w-full overflow-hidden rounded-xs border border-[#dcdcde] bg-[#f6f7f7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingPost.coverImageUrl}
                            alt="Cover"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <label className="flex w-full items-center justify-center gap-1.5 rounded-xs border border-[#155132] bg-[#f6f7f7] px-3 py-2 font-bold text-[#155132] hover:bg-[#155132] hover:text-white transition cursor-pointer">
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
                        <input
                          type="text"
                          value={editingPost.coverImageUrl}
                          onChange={(e) =>
                            setEditingPost({
                              ...editingPost,
                              coverImageUrl: e.target.value,
                            })
                          }
                          placeholder="Hoặc dán link ảnh bìa..."
                          className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="overflow-x-auto rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] font-bold text-[#1d2327]">
                        <th className="py-2.5 px-3 w-20">Ảnh bìa</th>
                        <th className="py-2.5 px-3">Tiêu đề bài viết</th>
                        <th className="py-2.5 px-3">Chuyên mục</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                        <th className="py-2.5 px-3">Cập nhật</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdcde]">
                      {posts.map((post) => (
                        <tr
                          key={post.id}
                          className="hover:bg-[#f6f7f7] transition"
                        >
                          <td className="py-2.5 px-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className="h-11 w-16 rounded-xs object-cover border border-[#c3c4c7]"
                            />
                          </td>
                          <td className="py-2.5 px-3">
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
                              className="font-bold text-sm text-[#155132] hover:underline text-left cursor-pointer"
                            >
                              {post.title}
                            </button>
                            <p className="text-[11px] text-[#50575e] line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          </td>
                          <td className="py-2.5 px-3">{post.category}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`rounded-xs px-2 py-0.5 text-[10px] font-bold ${
                                post.isPublished
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {post.isPublished ? "Đã xuất bản" : "Bản nháp"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#50575e]">
                            {new Date(post.updatedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
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
                              className="inline-flex items-center gap-1 rounded-xs border border-[#155132] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#155132] hover:bg-[#155132] hover:text-white mr-1.5 cursor-pointer"
                            >
                              <Edit3 className="h-3 w-3" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePost(post.id, post.title)
                              }
                              className="inline-flex items-center gap-1 rounded-xs border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 4: TUYỂN DỤNG (WP JOBS TABLE + EDITOR)                     */}
          {/* ================================================================= */}
          {activeSection === "jobs" && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    {editingJob
                      ? editingJob.id
                        ? "Chỉnh sửa Tin tuyển dụng"
                        : "Đăng Tin tuyển dụng mới"
                      : "Quản lý Tuyển dụng Nhân sự"}
                  </h1>
                  {!editingJob && (
                    <button
                      type="button"
                      onClick={openNewJobForm}
                      className="rounded-xs border border-[#155132] bg-white px-3 py-1 text-xs font-semibold text-[#155132] hover:bg-[#155132] hover:text-white transition cursor-pointer"
                    >
                      + Đăng tin tuyển dụng
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/tuyen-dung"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-xs border border-[#8c8f94] bg-white px-3 py-1.5 text-xs font-medium text-[#1d2327]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Xem trang /tuyen-dung
                  </a>
                  {editingJob && (
                    <button
                      type="button"
                      onClick={() => setEditingJob(null)}
                      className="rounded-xs border border-[#8c8f94] bg-white px-3 py-1.5 text-xs font-semibold text-[#1d2327] cursor-pointer"
                    >
                      ← Quay lại danh sách
                    </button>
                  )}
                </div>
              </div>

              {editingJob ? (
                <form
                  onSubmit={handleSaveJob}
                  className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start"
                >
                  <div className="space-y-4 lg:col-span-8 rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs">
                    <div>
                      <label className="block text-xs font-bold text-[#1d2327] mb-1">
                        Vị trí tuyển dụng *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingJob.title}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            title: e.target.value,
                          })
                        }
                        placeholder="VD: Nghệ Nhân Sơ Chế & Chưng Yến"
                        className="w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-base font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1d2327] mb-1">
                        Mô tả công việc *
                      </label>
                      <textarea
                        rows={5}
                        required
                        value={editingJob.description}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            description: e.target.value,
                          })
                        }
                        className="w-full rounded-xs border border-[#8c8f94] p-3 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1d2327] mb-1">
                        Yêu cầu ứng viên
                      </label>
                      <textarea
                        rows={4}
                        value={editingJob.requirements}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            requirements: e.target.value,
                          })
                        }
                        className="w-full rounded-xs border border-[#8c8f94] p-3 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 lg:col-span-4 rounded-xs border border-[#c3c4c7] bg-white p-4 shadow-2xs text-xs">
                    <h3 className="font-bold text-[#1d2327] border-b border-[#dcdcde] pb-2">
                      Thông tin & Chế độ đãi ngộ
                    </h3>

                    <div>
                      <label className="block font-semibold mb-1">
                        Trạng thái:
                      </label>
                      <select
                        value={editingJob.isOpen ? "OPEN" : "CLOSED"}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            isOpen: e.target.value === "OPEN",
                          })
                        }
                        className="w-full rounded-xs border border-[#8c8f94] bg-white px-2.5 py-1.5 font-semibold"
                      >
                        <option value="OPEN">Đang nhận hồ sơ</option>
                        <option value="CLOSED">Đã đóng tuyển dụng</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        Phòng ban / Bộ phận:
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
                        className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        Mức lương:
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
                        className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        Địa điểm làm việc:
                      </label>
                      <input
                        type="text"
                        value={editingJob.location}
                        onChange={(e) =>
                          setEditingJob({
                            ...editingJob,
                            location: e.target.value,
                          })
                        }
                        className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">
                        Hình thức:
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
                        className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#dcdcde]">
                      <button
                        type="button"
                        onClick={() => setEditingJob(null)}
                        className="text-rose-700 hover:underline cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="rounded-xs bg-[#155132] px-4 py-2 font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                      >
                        Lưu tin tuyển dụng
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="overflow-x-auto rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#c3c4c7] bg-[#f6f7f7] font-bold text-[#1d2327]">
                        <th className="py-2.5 px-3">Vị trí tuyển dụng</th>
                        <th className="py-2.5 px-3">Bộ phận</th>
                        <th className="py-2.5 px-3">Địa điểm & Hình thức</th>
                        <th className="py-2.5 px-3">Mức lương</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dcdcde]">
                      {jobs.map((job) => (
                        <tr
                          key={job.id}
                          className="hover:bg-[#f6f7f7] transition"
                        >
                          <td className="py-2.5 px-3 font-bold text-sm text-[#155132]">
                            {job.title}
                          </td>
                          <td className="py-2.5 px-3">{job.department}</td>
                          <td className="py-2.5 px-3 text-[#50575e]">
                            {job.location} • {job.employmentType}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#8A6632]">
                            {job.salaryRange}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`rounded-xs px-2 py-0.5 text-[10px] font-bold ${
                                job.isOpen
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {job.isOpen ? "Đang tuyển" : "Đã đóng"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
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
                              className="inline-flex items-center gap-1 rounded-xs border border-[#155132] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#155132] hover:bg-[#155132] hover:text-white mr-1.5 cursor-pointer"
                            >
                              <Edit3 className="h-3 w-3" />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteJob(job.id, job.title)
                              }
                              className="inline-flex items-center gap-1 rounded-xs border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* SECTION 5: GIAO DIỆN & TRANG CHỦ (WP CUSTOMIZER METABOXES)        */}
          {/* ================================================================= */}
          {activeSection === "site" && siteSettings && (
            <form onSubmit={handleSaveSiteSettings} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c3c4c7] pb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-[#1d2327]">
                    Tùy biến Giao diện & Nội dung Trang chủ
                  </h1>
                  <p className="text-xs text-[#50575e] mt-0.5">
                    Cập nhật Banner Hero, Khối Quà Biếu, Hotline, Zalo, Địa chỉ và câu chuyện Về Hà Mi.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xs bg-[#155132] px-5 py-2 text-xs font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#BD9342]" />
                  Lưu thay đổi Trang chủ
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Metabox 1: Hero Section */}
                <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs lg:col-span-7">
                  <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">
                      1. Banner Đầu Trang Chủ (Hero Section)
                    </h2>
                  </div>
                  <div className="p-4 space-y-4 text-xs">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block font-bold mb-1">
                          Nhãn phụ phía trên (Hero Badge)
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
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">
                          Chữ trên nút bấm (Hero CTA)
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
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">
                        Tiêu đề chính Trang chủ (H1)
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
                        className="w-full rounded-xs border border-[#8c8f94] px-3 py-2 text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">
                        Đoạn giới thiệu mở đầu (Hero Lead)
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
                        className="w-full rounded-xs border border-[#8c8f94] p-2.5"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xs border border-[#dcdcde] p-3 space-y-2">
                        <label className="block font-bold">
                          Ảnh Banner Desktop
                        </label>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={siteSettings.heroDesktopImage}
                          alt="Hero Desktop"
                          className="h-24 w-full rounded-xs object-cover border"
                        />
                        <label className="inline-flex items-center gap-1 rounded-xs border border-[#155132] px-2.5 py-1 text-[11px] font-bold text-[#155132] cursor-pointer">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Tải ảnh mới từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const dataUrl =
                                await readAndCompressImageFile(file);
                              setSiteSettings({
                                ...siteSettings,
                                heroDesktopImage: dataUrl,
                              });
                            }}
                          />
                        </label>
                      </div>

                      <div className="rounded-xs border border-[#dcdcde] p-3 space-y-2">
                        <label className="block font-bold">
                          Ảnh Banner Mobile
                        </label>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={siteSettings.heroMobileImage}
                          alt="Hero Mobile"
                          className="h-24 w-full rounded-xs object-cover border"
                        />
                        <label className="inline-flex items-center gap-1 rounded-xs border border-[#155132] px-2.5 py-1 text-[11px] font-bold text-[#155132] cursor-pointer">
                          <ImageIcon className="h-3.5 w-3.5" />
                          Tải ảnh mới từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const dataUrl =
                                await readAndCompressImageFile(file);
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

                {/* Metabox 2 & 3: Contact + Gifting */}
                <div className="space-y-6 lg:col-span-5">
                  <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                    <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">
                        2. Thông tin Liên hệ, Hotline & Zalo
                      </h2>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1">
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
                            className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">
                            Link Zalo OA / CSKH
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
                            className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1">
                          Địa chỉ Bếp / Showroom
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
                          className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                        />
                      </div>

                      <div>
                        <label className="block font-bold mb-1">
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
                          className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                    <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">
                        3. Khối Quà Biếu Sức Khỏe
                      </h2>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">
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
                          className="w-full rounded-xs border border-[#8c8f94] px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">
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
                          className="w-full rounded-xs border border-[#8c8f94] p-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* SECTION 6: CÀI ĐẶT THÔNG BÁO EMAIL & ZALO (WP SETTINGS)           */}
          {/* ================================================================= */}
          {activeSection === "notifications" && notificationSettings && (
            <div className="space-y-6">
              <div className="border-b border-[#c3c4c7] pb-4">
                <h1 className="text-2xl font-semibold text-[#1d2327]">
                  Cài đặt Thông báo Đơn hàng (Email & Zalo)
                </h1>
                <p className="text-xs text-[#50575e] mt-0.5">
                  Tự động bắn thông báo cho chủ thương hiệu ngay khi khách gửi yêu cầu đặt món mới.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <form
                  onSubmit={handleSaveNotificationSettings}
                  className="space-y-5 lg:col-span-7"
                >
                  {/* Email Settings Card */}
                  <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                      <span className="flex items-center gap-2 text-xs font-bold text-[#1d2327]">
                        <Mail className="h-4 w-4 text-[#155132]" />
                        1. Thông báo tự động qua Email
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
                        Kích hoạt
                      </label>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">
                          Địa chỉ Email nhận đơn hàng mới *
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
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block font-bold mb-1">
                            Resend API Key (Tùy chọn)
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
                            placeholder="re_xxxxxx..."
                            className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">
                            Email Webhook URL (Apps Script / Make)
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
                            placeholder="https://..."
                            className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zalo Settings Card */}
                  <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                      <span className="flex items-center gap-2 text-xs font-bold text-[#1d2327]">
                        <MessageCircle className="h-4 w-4 text-[#155132]" />
                        2. Thông báo tự động qua Zalo
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
                        Kích hoạt
                      </label>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1">
                          Số điện thoại Zalo nhận đơn *
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
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1">
                          Zalo OA / ZNS / Webhook URL
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
                          placeholder="https://hooks.zapier.com/... hoặc Zalo Webhook"
                          className="w-full rounded-xs border border-[#8c8f94] px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xs bg-[#155132] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0e3b23] cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#BD9342]" />
                      Lưu cài đặt thông báo
                    </button>

                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="inline-flex items-center gap-2 rounded-xs border border-[#155132] bg-white px-4 py-2.5 text-xs font-bold text-[#155132] hover:bg-[#f6f7f7] cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Gửi thử thông báo ngay
                    </button>
                  </div>
                </form>

                {/* Notification Logs Metabox */}
                <div className="rounded-xs border border-[#c3c4c7] bg-white shadow-2xs lg:col-span-5">
                  <div className="border-b border-[#c3c4c7] bg-[#f6f7f7] px-4 py-3">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">
                      Nhật ký gửi thông báo ({notificationLogs.length})
                    </h2>
                  </div>
                  <div className="p-4 max-h-[500px] overflow-y-auto space-y-2.5 text-xs">
                    {notificationLogs.length === 0 ? (
                      <p className="text-center text-[#50575e] py-8">
                        Chưa có nhật ký thông báo nào.
                      </p>
                    ) : (
                      notificationLogs.map((log) => (
                        <div
                          key={log.id}
                          className="rounded-xs border border-[#dcdcde] bg-[#f6f7f7] p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#155132]">
                              [{log.channel}] Đơn #{log.orderReferenceCode}
                            </span>
                            <span className="text-[10px] font-semibold text-[#50575e]">
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[11px]">
                            Tới: <strong>{log.recipient}</strong>
                          </p>
                          <p className="text-[11px] text-[#50575e]">
                            {log.messageSummary}
                          </p>
                          <p className="text-[10px] text-[#50575e]">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
