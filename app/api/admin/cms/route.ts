import { NextResponse } from "next/server";
import {
  deleteJobPostingByStaff,
  deletePostByStaff,
  deleteProductByStaff,
  getAllJobPostings,
  getAllPosts,
  getNotificationLogs,
  getNotificationSettings,
  getSiteContentSettings,
  syncDbFromCloud,
  syncDbToCloud,
  triggerOrderNotificationsAfterCommit,
  updateNotificationSettings,
  updateSiteContentSettings,
  upsertJobPostingByStaff,
  upsertPostByStaff,
  upsertProductFullByStaff,
} from "@/db";
import type { ProductCategory, ProductStatus } from "@/db/schema";
import { getAuthenticatedStaff } from "@/lib/staff-auth";

export async function GET() {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }

  await syncDbFromCloud(true);

  return NextResponse.json({
    ok: true,
    siteSettings: getSiteContentSettings(),
    posts: getAllPosts(false),
    jobs: getAllJobPostings(false),
    notificationSettings: getNotificationSettings(),
    notificationLogs: getNotificationLogs(30),
  });
}

export async function POST(request: Request) {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }

  try {
    await syncDbFromCloud(true);

    const body = await request.json();
    const action = String(body.action || "");

    if (action === "save_site_settings") {
      const updated = updateSiteContentSettings(body.settings || {});
      await syncDbToCloud();
      return NextResponse.json({ ok: true, siteSettings: updated });
    }

    if (action === "upsert_product") {
      const p = body.product || {};
      const ingredients = Array.isArray(p.ingredients)
        ? p.ingredients
        : String(p.ingredientsText || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);
      const supportedOptions = Array.isArray(p.supportedOptions)
        ? p.supportedOptions
        : String(p.supportedOptionsText || "")
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean);

      const res = upsertProductFullByStaff({
        id: p.id,
        slug: p.slug,
        name: String(p.name || ""),
        category: (p.category || "nguyen-ban") as ProductCategory,
        volumeMl: Number(p.volumeMl || 200),
        priceVnd:
          p.priceVnd === null || p.priceVnd === "" || p.priceVnd === undefined
            ? null
            : Number(p.priceVnd),
        status: (p.status || "AVAILABLE") as ProductStatus,
        imageUrl: String(p.imageUrl || "/brand/dishes/thanh-nguyen-dish.jpg"),
        ingredients,
        tasteProfile: String(p.tasteProfile || ""),
        shortDescription: String(p.shortDescription || ""),
        usageGuide: String(p.usageGuide || ""),
        storageGuide: String(p.storageGuide || ""),
        cautionNote: String(p.cautionNote || ""),
        supportedOptions,
      });
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "delete_product") {
      const res = deleteProductByStaff(String(body.productId || ""));
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "upsert_post") {
      const post = body.post || {};
      const res = upsertPostByStaff({
        id: post.id,
        slug: post.slug,
        title: String(post.title || ""),
        category: String(post.category || "Tin tức Hà Mi"),
        excerpt: String(post.excerpt || ""),
        content: String(post.content || ""),
        coverImageUrl: String(post.coverImageUrl || "/brand/hero-editorial-clean.jpg"),
        isPublished: Boolean(post.isPublished ?? true),
      });
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "delete_post") {
      const res = deletePostByStaff(String(body.postId || ""));
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "upsert_job") {
      const job = body.job || {};
      const res = upsertJobPostingByStaff({
        id: job.id,
        title: String(job.title || ""),
        department: String(job.department || "Kinh doanh & CSKH"),
        location: String(job.location || "Đà Nẵng"),
        employmentType: String(job.employmentType || "Toàn thời gian"),
        salaryRange: String(job.salaryRange || "Thỏa thuận"),
        description: String(job.description || ""),
        requirements: String(job.requirements || ""),
        contactInfo: String(job.contactInfo || "Hotline/Zalo: 0935 052 959"),
        isOpen: Boolean(job.isOpen ?? true),
      });
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "delete_job") {
      const res = deleteJobPostingByStaff(String(body.jobId || ""));
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (action === "save_notification_settings") {
      const updated = updateNotificationSettings(body.settings || {});
      await syncDbToCloud();
      return NextResponse.json({ ok: true, notificationSettings: updated });
    }

    if (action === "test_notification") {
      const result = await triggerOrderNotificationsAfterCommit({
        referenceCode: `TEST-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        orderPurpose: "GIFT",
        buyerName: "Nguyễn Minh Anh (Đơn thử nghiệm)",
        buyerPhone: "0935052959",
        buyerNote: "Giao giờ hành chính, gọi trước 15 phút giúp mình nhé",
        recipientName: "Cô Lan Hương",
        recipientPhone: "0905123456",
        giftSenderName: "Gia đình Minh Anh",
        giftMessage: "Kính chúc Cô luôn dồi dào sức khỏe và bình an!",
        hidePriceOnReceipt: true,
        addressDetail: "128 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng",
        requestedDate: new Date().toISOString().slice(0, 10),
        slotLabel: "Khung giờ (09:00 – 10:00)",
        totalBowls: 3,
        subtotalVnd: 550000,
        shippingFeeVnd: 0,
        totalVnd: 550000,
        shippingFeeNote: "Miễn phí giao hàng (Đơn từ 2 thố/set)",
        items: [
          {
            productName: "Thố Yến Tươi Chưng Nóng — Thanh Nguyên",
            variantName: "Thố sứ 200ml",
            volumeMl: 200,
            selectedOption: "Ít ngọt",
            ingredientsText: "Tổ yến tươi nguyên chất, đường phèn kết tinh, lát gừng ấm",
            quantity: 2,
            unitPriceVnd: 145000,
            lineTotalVnd: 290000,
          },
          {
            productName: "Set Quà Yến Sào Thượng Hạng 6 Vị (Hộp Hoa Sen & Đàn Én)",
            variantName: "Hộp 6 hũ 75ml",
            volumeMl: 450,
            selectedOption: "Nguyên vị 6 hũ",
            ingredientsText: "Đông trùng, Nhân sâm, Kỷ tử, Táo đỏ, Hạt chia, Đường phèn",
            quantity: 1,
            unitPriceVnd: 260000,
            lineTotalVnd: 260000,
          },
        ],
        itemsSummary:
          "1. Thố Yến Tươi Chưng Nóng — Thanh Nguyên (Thố sứ 200ml • Ít ngọt) x2 = 290.000đ | 2. Set Quà Yến Sào Thượng Hạng 6 Vị (Hộp 6 hũ 75ml • Nguyên vị 6 hũ) x1 = 260.000đ",
      });
      await syncDbToCloud();
      return NextResponse.json({
        ok: true,
        message: result.detail,
        notificationLogs: getNotificationLogs(30),
      });
    }

    return NextResponse.json(
      { ok: false, errorMessage: "Hành động CMS không hợp lệ." },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        errorMessage:
          err instanceof Error ? err.message : "Lỗi xử lý dữ liệu CMS.",
      },
      { status: 400 }
    );
  }
}
