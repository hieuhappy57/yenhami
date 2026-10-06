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
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "save_site_settings") {
      const updated = updateSiteContentSettings(body.settings || {});
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
      return NextResponse.json(res);
    }

    if (action === "delete_product") {
      const res = deleteProductByStaff(String(body.productId || ""));
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
      return NextResponse.json(res);
    }

    if (action === "delete_post") {
      const res = deletePostByStaff(String(body.postId || ""));
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
      return NextResponse.json(res);
    }

    if (action === "delete_job") {
      const res = deleteJobPostingByStaff(String(body.jobId || ""));
      return NextResponse.json(res);
    }

    if (action === "save_notification_settings") {
      const updated = updateNotificationSettings(body.settings || {});
      return NextResponse.json({ ok: true, notificationSettings: updated });
    }

    if (action === "test_notification") {
      triggerOrderNotificationsAfterCommit({
        referenceCode: `TEST-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        orderPurpose: "SELF",
        buyerName: "Khách thử nghiệm thông báo",
        buyerPhone: "0935052959",
        recipientName: "Khách thử nghiệm thông báo",
        recipientPhone: "0935052959",
        addressDetail: "Thôn Bà Rén, Xã Xuân Phú, TP. Đà Nẵng",
        requestedDate: new Date().toISOString().slice(0, 10),
        slotLabel: "Khung giờ (09:00 – 10:00)",
        totalVnd: 260000,
        shippingFeeNote: "Miễn phí giao hàng",
        itemsSummary: "Set Quà Yến Sào Thượng Hạng 6 Vị (6 Hũ 75ml) x1",
      });
      return NextResponse.json({
        ok: true,
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
