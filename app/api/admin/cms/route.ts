import { after, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteJobPostingByStaff,
  deletePostByStaff,
  deleteProductByStaff,
  getAllJobPostings,
  getAllPosts,
  getAllProducts,
  getSqliteDb,
  getCloudDatabaseStatus,
  getNotificationLogs,
  getNotificationSettings,
  getOrderRequestByReference,
  getSiteContentSettings,
  listEditorImages,
  isCloudflareR2Enabled,
  putCloudflareR2Object,
  getCloudflareR2Object,
  syncDbFromCloud,
  syncDbToCloud,
  testAndInitCloudflareD1,
  triggerOrderNotificationsAfterCommit,
  updateNotificationSettings,
  updateSiteContentSettings,
  upsertJobPostingByStaff,
  upsertPostByStaff,
  upsertProductFullByStaff,
} from "@/db";
import type { ProductCategory, ProductStatus } from "@/db/schema";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { MediaUploadError, storeVerifiedImage } from "@/lib/media-upload";
import { PRODUCT_LINES, getProductLine } from "@/lib/product-lines";
import { parseSiteSettings } from "@/lib/site-settings-validation";
import { getAuthenticatedStaff, guardMutationOrigin, hasForbiddenCommercialProductFields, privateJsonHeaders, staffCan } from "@/lib/staff-auth";

const PRODUCT_STATUSES: ProductStatus[] = ["AVAILABLE", "OUT_OF_STOCK", "PENDING_DATA_APPROVAL"];
const PRODUCT_CATEGORIES: ProductCategory[] = ["nguyen-ban", "ngot-diu", "nhieu-tang"];

function redactNotificationSettings(settings: ReturnType<typeof getNotificationSettings>) {
  const { resendApiKey, emailWebhookUrl, zaloWebhookUrl, ...publicSettings } = settings;
  return { ...publicSettings, resendApiKeyConfigured: Boolean(resendApiKey), emailWebhookConfigured: Boolean(emailWebhookUrl), zaloWebhookConfigured: Boolean(zaloWebhookUrl) };
}

async function readBody(request: Request) {
  const limit = 10 * 1024 * 1024;
  if (Number(request.headers.get("content-length") || 0) > limit) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text) > limit) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text) as Record<string, unknown>;
}

export async function GET(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }
  if (!staffCan(staff, "content.write")) {
    return NextResponse.json({ ok: false, errorMessage: "Không có quyền quản lý nội dung." }, { status: 403, headers: privateJsonHeaders() });
  }

  const sensitive = staffCan(staff, "settings.sensitive");
  if(new URL(request.url).searchParams.get("editorImages")==="1") {
    try {return NextResponse.json({ok:true,...await listEditorImages()},{headers:privateJsonHeaders()});}
    catch {return NextResponse.json({ok:false,errorMessage:"Chưa tải được thư viện ảnh. Vui lòng thử lại."},{status:503,headers:privateJsonHeaders()});}
  }
  await syncDbFromCloud(true);
  return NextResponse.json({
    ok: true,
    products: getAllProducts(),
    siteSettings: getSiteContentSettings(),
    posts: getAllPosts(false),
    jobs: getAllJobPostings(false),
    ...(sensitive ? { notificationSettings: redactNotificationSettings(getNotificationSettings()), notificationLogs: getNotificationLogs(30), cloudDbStatus: getCloudDatabaseStatus() } : {}),
  }, { headers: privateJsonHeaders() });
}

export async function POST(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }
  if (!staffCan(staff, "content.write")) {
    return NextResponse.json({ ok: false, errorMessage: "Không có quyền quản lý nội dung." }, { status: 403, headers: privateJsonHeaders() });
  }
  if (!guardMutationOrigin(request)) {
    return NextResponse.json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers: privateJsonHeaders() });
  }

  try {
    const body = await readBody(request);
    const action = String(body.action || "");
    const sensitiveActions = new Set(["save_notification_settings", "test_notification", "resend_order_notification", "test_init_cloudflare_d1"]);
    if (sensitiveActions.has(action) && !staffCan(staff, "settings.sensitive")) {
      return NextResponse.json({ ok: false, errorMessage: "Chỉ chủ sở hữu được thay đổi cấu hình nhạy cảm." }, { status: 403, headers: privateJsonHeaders() });
    }
    const canWriteCommercial = staffCan(staff, "catalog.commercial.write");
    const productPayload = body.product && typeof body.product === "object" ? body.product as Record<string, unknown> : {};
    if (action === "upsert_product" && !canWriteCommercial && hasForbiddenCommercialProductFields(productPayload)) {
      return NextResponse.json({ ok: false, errorMessage: "Không có quyền thay đổi dữ liệu thương mại của sản phẩm." }, { status: 403, headers: privateJsonHeaders() });
    }
    if (action === "delete_product" && !canWriteCommercial) return NextResponse.json({ ok: false, errorMessage: "Không có quyền xóa sản phẩm." }, { status: 403, headers: privateJsonHeaders() });

    if(action==="upload_media_r2") {
      const siteImageField=body.siteImageField;
      if(siteImageField!==undefined && !["heroDesktopImage","heroMobileImage","giftingImage"].includes(String(siteImageField))) return NextResponse.json({ok:false,errorMessage:"Vị trí ảnh không hợp lệ."},{status:422,headers:privateJsonHeaders()});
      const uploaded=await storeVerifiedImage({dataUrl:String(body.dataUrl || ""),fileName:String(body.fileName || "image")},
        {enabled:isCloudflareR2Enabled(),put:putCloudflareR2Object,get:getCloudflareR2Object});
      if(siteImageField!==undefined) {
        const siteSettings=await withAuthoritativeMutation(async()=>{
          const settings=updateSiteContentSettings({[String(siteImageField)]:uploaded.url});
          await syncDbToCloud();return settings;
        },{deferBackup:after});
        revalidatePath("/","layout");
        return NextResponse.json({...uploaded,siteSettings},{headers:privateJsonHeaders()});
      }
      return NextResponse.json(uploaded,{headers:privateJsonHeaders()});
    }

    const response=await withAuthoritativeMutation(async () => {
    await syncDbFromCloud(true);

    if (action === "save_site_settings") {
      const updated = updateSiteContentSettings(parseSiteSettings(body.settings));
      await syncDbToCloud();
      try {
        revalidatePath("/");
        revalidatePath("/lien-he");
        revalidatePath("/tuyen-dung");
        revalidatePath("/ve-ha-mi");
        revalidatePath("/gui-qua");
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json({ ok: true, siteSettings: updated },{headers:privateJsonHeaders()});
    }

    if (action === "upsert_product") {
      const existing=getAllProducts().find(product=>product.id===String(productPayload.id || ""));
      if(productPayload.id && getSqliteDb().prepare("SELECT id FROM products WHERE id=? AND deleted_at IS NOT NULL").get(String(productPayload.id))) {
        return NextResponse.json({ok:false,errorMessage:"Sản phẩm đã bị xóa. Vui lòng tải lại danh mục."},{status:409,headers:privateJsonHeaders()});
      }
      const productLine=String(productPayload.productLine || (existing ? getProductLine(existing) : "fresh-bowl"));
      if(!Object.hasOwn(PRODUCT_LINES,productLine)) return NextResponse.json({ok:false,errorMessage:"Hạng mục sản phẩm không hợp lệ."},{status:422,headers:privateJsonHeaders()});
      const p:Record<string,unknown> = canWriteCommercial ? {...existing,...productPayload} : productPayload;
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

      if (!canWriteCommercial) {
        const id = String(p.id || "");
        if (!id) return NextResponse.json({ ok: false, errorMessage: "Marketing chỉ được sửa nội dung sản phẩm đã có." }, { status: 400, headers: privateJsonHeaders() });
        const optionalText = (key: string) => typeof p[key] === "string" ? p[key] as string : null;
        const result = getSqliteDb().prepare(`UPDATE products SET slug = COALESCE(?, slug), name = COALESCE(?, name), category = COALESCE(?, category), volume_ml = COALESCE(?, volume_ml), image_url = COALESCE(?, image_url), ingredients_json = COALESCE(?, ingredients_json), taste_profile = COALESCE(?, taste_profile), short_description = COALESCE(?, short_description), usage_guide = COALESCE(?, usage_guide), storage_guide = COALESCE(?, storage_guide), caution_note = COALESCE(?, caution_note) WHERE id = ?`).run(
          optionalText("slug"), optionalText("name"), optionalText("category"), Number.isSafeInteger(p.volumeMl) && Number(p.volumeMl) > 0 ? Number(p.volumeMl) : null, optionalText("imageUrl"), Array.isArray(p.ingredients) || typeof p.ingredientsText === "string" ? JSON.stringify(ingredients) : null, optionalText("tasteProfile"), optionalText("shortDescription"), optionalText("usageGuide"), optionalText("storageGuide"), optionalText("cautionNote"), id,
        );
        if (!result.changes) return NextResponse.json({ ok: false, errorMessage: "Không tìm thấy sản phẩm." }, { status: 404, headers: privateJsonHeaders() });
        getSqliteDb().prepare("UPDATE products SET product_line=? WHERE id=?").run(productLine,id);
        await syncDbToCloud();
        try {
          revalidatePath("/");
          revalidatePath("/san-pham/[slug]", "page");
          revalidatePath("/yen-tuoi-chung-nong");
          revalidatePath("/dat-hang");
          revalidatePath("/gio-hang");
          revalidatePath("/gui-qua");
        } catch {}
        return NextResponse.json({ ok: true, id, product:getAllProducts().find(product=>product.id===id) }, { headers: privateJsonHeaders() });
      }

      const commercialPrice = p.priceVnd === null || p.priceVnd === "" || p.priceVnd === undefined ? null : Number(p.priceVnd);
      const commercialVolume = Number(p.volumeMl);
      const commercialStatus = String(p.status || "AVAILABLE") as ProductStatus;
      const commercialCategory = String(p.category || "nguyen-ban") as ProductCategory;
      if (!String(p.name || "").trim() || !Number.isSafeInteger(commercialVolume) || commercialVolume <= 0 || (commercialPrice !== null && (!Number.isSafeInteger(commercialPrice) || commercialPrice < 0)) || !PRODUCT_STATUSES.includes(commercialStatus) || !PRODUCT_CATEGORIES.includes(commercialCategory)) {
        return NextResponse.json({ ok: false, errorMessage: "Dữ liệu sản phẩm không hợp lệ." }, { status: 422, headers: privateJsonHeaders() });
      }

      const res = upsertProductFullByStaff({
        id: typeof p.id === "string" ? p.id : undefined,
        slug: typeof p.slug === "string" ? p.slug : undefined,
        name: String(p.name || ""),
        category: commercialCategory,
        volumeMl: commercialVolume,
        priceVnd: commercialPrice,
        status: commercialStatus,
        imageUrl: String(p.imageUrl || "/brand/dishes/thanh-nguyen-v2.webp"),
        ingredients,
        tasteProfile: String(p.tasteProfile || ""),
        shortDescription: String(p.shortDescription || ""),
        usageGuide: String(p.usageGuide || ""),
        storageGuide: String(p.storageGuide || ""),
        cautionNote: String(p.cautionNote || ""),
        supportedOptions,
      });
      getSqliteDb().prepare("UPDATE products SET product_line=? WHERE id=?").run(productLine,res.productId);
      await syncDbToCloud();
      try {
        revalidatePath("/");
        revalidatePath("/san-pham/[slug]", "page");
        revalidatePath("/yen-tuoi-chung-nong");
        revalidatePath("/dat-hang");
        revalidatePath("/gio-hang");
        revalidatePath("/gui-qua");
      } catch {}
      return NextResponse.json({...res,product:getAllProducts().find(product=>product.id===res.productId)},{headers:privateJsonHeaders()});
    }

    if (action === "delete_product") {
      const res = deleteProductByStaff(String(body.productId || ""));
      await syncDbToCloud();
      try {
        revalidatePath("/");
        revalidatePath("/san-pham/[slug]", "page");
        revalidatePath("/yen-tuoi-chung-nong");
        revalidatePath("/dat-hang");
        revalidatePath("/gio-hang");
      } catch {}
      return NextResponse.json(res.ok ? res : {...res,errorMessage:"Sản phẩm không còn trong danh mục."},{status:res.ok ? 200 : 404,headers:privateJsonHeaders()});
    }

    if (action === "upsert_post") {
      const post = (body.post && typeof body.post === "object" ? body.post : {}) as Record<string, unknown>;
      const res = upsertPostByStaff({
        id: typeof post.id === "string" ? post.id : undefined,
        slug: typeof post.slug === "string" ? post.slug : undefined,
        title: String(post.title || ""),
        category: String(post.category || "Tin tức Hà Mi"),
        excerpt: String(post.excerpt || ""),
        content: String(post.content || ""),
        coverImageUrl: String(post.coverImageUrl || "/brand/hero-editorial-clean.jpg"),
        isPublished: Boolean(post.isPublished ?? true),
        isPinned: Boolean(post.isPinned ?? false),
      });
      await syncDbToCloud();
      try {
        revalidatePath("/bai-viet");
        revalidatePath("/");
        if (res.slug) revalidatePath(`/bai-viet/${res.slug}`);
      } catch {}
      return NextResponse.json(res);
    }

    if (action === "delete_post") {
      const res = deletePostByStaff(String(body.postId || ""));
      await syncDbToCloud();
      try {
        revalidatePath("/bai-viet");
        revalidatePath("/");
      } catch {}
      return NextResponse.json(res);
    }

    if (action === "upsert_job") {
      const job = (body.job && typeof body.job === "object" ? body.job : {}) as Record<string, unknown>;
      const res = upsertJobPostingByStaff({
        id: typeof job.id === "string" ? job.id : undefined,
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
      try {
        revalidatePath("/tuyen-dung");
      } catch {}
      return NextResponse.json(res);
    }

    if (action === "delete_job") {
      const res = deleteJobPostingByStaff(String(body.jobId || ""));
      await syncDbToCloud();
      try {
        revalidatePath("/tuyen-dung");
      } catch {}
      return NextResponse.json(res);
    }

    if (action === "save_notification_settings") {
      const input = body.settings && typeof body.settings === "object" && !Array.isArray(body.settings)
        ? body.settings as Record<string, unknown>
        : {};
      const resendApiKey = typeof input.resendApiKey === "string" ? input.resendApiKey.trim() : "";
      const resendFromEmail = typeof input.resendFromEmail === "string" ? input.resendFromEmail.trim() : "";
      if (resendApiKey && (!resendApiKey.startsWith("re_") || /\s/.test(resendApiKey))) {
        return NextResponse.json({ ok: false, errorMessage: "Resend API key không hợp lệ." }, { status: 400, headers: privateJsonHeaders() });
      }
      if (resendFromEmail && (/[\r\n]/.test(resendFromEmail) || !/^(?:[^<>]+\s+<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(resendFromEmail))) {
        return NextResponse.json({ ok: false, errorMessage: "Email gửi Resend không hợp lệ." }, { status: 400, headers: privateJsonHeaders() });
      }
      const updated = updateNotificationSettings({
        ...(typeof input.enableEmail === "boolean" ? { enableEmail: input.enableEmail } : {}),
        ...(typeof input.notificationEmailTo === "string" ? { notificationEmailTo: input.notificationEmailTo.trim() } : {}),
        ...(typeof input.emailWebhookUrl === "string" && input.emailWebhookUrl.trim()
          ? { emailWebhookUrl: input.emailWebhookUrl.trim() }
          : resendApiKey ? { emailWebhookUrl: "" } : {}),
        ...(typeof input.resendFromEmail === "string" ? { resendFromEmail } : {}),
        ...(resendApiKey ? { resendApiKey } : {}),
      });
      await syncDbToCloud();
      return NextResponse.json({ ok: true, notificationSettings: redactNotificationSettings(updated) }, { headers: privateJsonHeaders() });
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
        slotLabel: "Giao Nóng Trong 2H (09:00 – 11:00)",
        totalBowls: 3,
        subtotalVnd: 1280000,
        shippingFeeVnd: 0,
        totalVnd: 1280000,
        shippingFeeNote: "Miễn phí giao hàng (Đơn từ 2 thố/set)",
        items: [
          {
            productName: "Thố Yến Tươi Chưng Nóng — Thanh Nguyên",
            variantName: "Thố sứ 200ml (35g yến tươi)",
            volumeMl: 200,
            selectedOption: "Ít ngọt",
            ingredientsText: "35g tổ yến tươi nguyên chất, đường phèn kết tinh, lát gừng ấm",
            quantity: 2,
            unitPriceVnd: 295000,
            lineTotalVnd: 590000,
          },
          {
            productName: "Set Quà Yến Sào Thượng Hạng 6 Vị (Hộp Hoa Sen & Đàn Én)",
            variantName: "Hộp 6 hũ 75ml",
            volumeMl: 450,
            selectedOption: "Nguyên vị 6 hũ",
            ingredientsText: "Đông trùng, Nhân sâm, Kỷ tử, Táo đỏ, Hạt chia, Đường phèn",
            quantity: 1,
            unitPriceVnd: 690000,
            lineTotalVnd: 690000,
          },
        ],
        itemsSummary:
          "1. Thố Yến Tươi Chưng Nóng — Thanh Nguyên (Thố sứ 200ml • Ít ngọt) x2 = 590.000đ | 2. Set Quà Yến Sào Thượng Hạng 6 Vị (Hộp 6 hũ 75ml • Nguyên vị 6 hũ) x1 = 690.000đ",
      });
      await syncDbToCloud();
      return NextResponse.json({
        ok: true,
        message: result.detail,
        notificationLogs: getNotificationLogs(30),
      });
    }

    if (action === "resend_order_notification") {
      const referenceCode = typeof body.referenceCode === "string" ? body.referenceCode.trim() : "";
      const ord = referenceCode ? getOrderRequestByReference({ referenceCode, isStaff: true }) : null;
      if (!ord) return NextResponse.json({ ok: false, errorMessage: "Không tìm thấy đơn hàng để gửi lại thông báo." }, { status: 404, headers: privateJsonHeaders() });
      const items = Array.isArray(ord.items)
        ? ord.items.map((it: Record<string, unknown>) => ({
            productName: String(it.productNameSnapshot || ""),
            variantName: String(it.variantNameSnapshot || "Thố 200ml"),
            volumeMl: Number(it.volumeMlSnapshot || 200),
            selectedOption: String(it.selectedOptionSnapshot || "Nguyên bản"),
            ingredientsText: String(it.ingredientsSnapshot || ""),
            quantity: Number(it.quantity || 1),
            unitPriceVnd: Number(it.unitPriceSnapshot || 295000),
            lineTotalVnd: Number(it.lineTotalSnapshot || 295000),
          }))
        : [];
      const itemsSummary = items
        .map(
          (it: { productName: string; variantName: string; selectedOption: string; quantity: number; lineTotalVnd: number }, idx: number) =>
            `${idx + 1}. ${it.productName} (${it.variantName} • ${it.selectedOption}) x${it.quantity} = ${it.lineTotalVnd.toLocaleString("vi-VN")}đ`
        )
        .join(" | ");

      const result = await triggerOrderNotificationsAfterCommit({
        referenceCode: String(ord.referenceCode || ""),
        orderPurpose: ord.orderPurpose === "GIFT" ? "GIFT" : "SELF",
        buyerName: String(ord.buyerName || ""),
        buyerPhone: String(ord.buyerPhone || ""),
        buyerNote: ord.buyerNote ? String(ord.buyerNote) : undefined,
        recipientName: String(ord.recipientName || ""),
        recipientPhone: String(ord.recipientPhone || ""),
        giftSenderName: ord.giftSenderName ? String(ord.giftSenderName) : undefined,
        giftMessage: ord.giftMessage ? String(ord.giftMessage) : undefined,
        hidePriceOnReceipt: Boolean(ord.hidePriceOnReceipt),
        addressDetail: String(ord.addressDetail || ""),
        requestedDate: String(ord.requestedDate || ""),
        slotLabel: String(ord.slotLabelSnapshot || ""),
        subtotalVnd: Number(ord.subtotalVnd || ord.totalVnd || 0),
        shippingFeeVnd: ord.shippingFeeVnd === null || ord.shippingFeeVnd === undefined ? null : Number(ord.shippingFeeVnd),
        totalVnd: Number(ord.totalVnd || 0),
        shippingFeeNote: String(ord.shippingFeeNote || ""),
        items,
        itemsSummary,
      });
      await syncDbToCloud();
      return NextResponse.json({
        ok: true,
        message: `Đã gửi lại thông báo cho đơn #${ord.referenceCode}: ${result.detail}`,
        notificationLogs: getNotificationLogs(30),
      });
    }

    if (action === "test_init_cloudflare_d1") {
      const res = await testAndInitCloudflareD1();
      return NextResponse.json({
        ok: res.ok,
        message: res.message,
        errorMessage: res.ok ? undefined : res.message,
        cloudDbStatus: getCloudDatabaseStatus(),
      });
    }

    return NextResponse.json(
      { ok: false, errorMessage: "Hành động CMS không hợp lệ." },
      { status: 400 }
    );
    },{deferBackup:after});
    if(response.ok && ["upsert_product","delete_product","save_site_settings"].includes(action)) revalidatePath("/","layout");
    return response;
  } catch (err) {
    const status = err instanceof MediaUploadError ? err.status : typeof err === "object" && err && "status" in err && err.status === 503 ? 503 : err instanceof Error && err.message === "BODY_TOO_LARGE" ? 413 : 400;
    return NextResponse.json(
      {
        ok: false,
        errorMessage:
          status === 503 ? "Kho dữ liệu dùng chung chưa sẵn sàng." : status === 413 ? "Dữ liệu quá lớn." : err instanceof Error ? err.message : "Lỗi xử lý dữ liệu CMS.",
      },
      { status, headers: privateJsonHeaders() }
    );
  }
}
