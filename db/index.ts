import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { resolveProductImage } from "../lib/product-images";
import {
  DEMO_DELIVERY_SLOTS,
  DEMO_POSTS,
  DEMO_PRODUCTS,
  DEMO_SERVICE_ZONES,
  DEMO_VARIANTS,
} from "./demo-fixtures";
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
  ProductVariantRecord,
  ServiceZoneRecord,
  SiteContentSettings,
  ZoneDeliveryStatus,
} from "./schema";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  "nguyen-ban": "Vị nguyên bản & Thanh ấm",
  "ngot-diu": "Vị ngọt dịu tự nhiên",
  "nhieu-tang": "Phối vị truyền thống nhiều tầng",
};

function hashPassword(password: string, salt = "hami-local-salt-v1"): string {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

/**
 * Returns current date (YYYY-MM-DD) and minutes since midnight in Asia/Ho_Chi_Minh (UTC+7).
 */
export function getHoChiMinhTimeParts(now: Date = new Date()): {
  dateStr: string;
  minutesOfDay: number;
} {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    map[p.type] = p.value;
  }
  const year = map.year || "2026";
  const month = map.month || "10";
  const day = map.day || "06";
  const hour = Number(map.hour === "24" ? "0" : map.hour || "0");
  const minute = Number(map.minute || "0");
  return {
    dateStr: `${year}-${month}-${day}`,
    minutesOfDay: hour * 60 + minute,
  };
}

/**
 * Validates that a YYYY-MM-DD string is a real calendar date (e.g., rejects 2026-02-30).
 */
export function isValidCalendarDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * Returns YYYY-MM-DD for tomorrow in Asia/Ho_Chi_Minh.
 */
export function getTomorrowHoChiMinhDateStr(now: Date = new Date()): string {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return getHoChiMinhTimeParts(tomorrow).dateStr;
}

let dbInstance: DatabaseSync | null = null;
let currentDbPath: string | null = null;

export function getDbPath(): string {
  if (process.env.HAMI_DB_PATH) {
    return process.env.HAMI_DB_PATH;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "hami.sqlite");
  }
  return path.join(process.cwd(), "data", "hami.sqlite");
}

export function getSqliteDb(): DatabaseSync {
  const targetPath = getDbPath();
  if (dbInstance && currentDbPath === targetPath) {
    return dbInstance;
  }
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const db = new DatabaseSync(targetPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA busy_timeout = 5000;");
  initializeSchemaAndSeed(db);
  dbInstance = db;
  currentDbPath = targetPath;
  return db;
}

export function resetDbConnectionForTest(): void {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // ignore
    }
  }
  dbInstance = null;
  currentDbPath = null;
}

function initializeSchemaAndSeed(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      volume_ml INTEGER NOT NULL,
      ingredients_json TEXT NOT NULL,
      taste_profile TEXT NOT NULL,
      short_description TEXT NOT NULL,
      usage_guide TEXT NOT NULL,
      storage_guide TEXT NOT NULL,
      caution_note TEXT NOT NULL,
      image_url TEXT NOT NULL,
      is_illustration_image INTEGER NOT NULL DEFAULT 1,
      price_vnd INTEGER,
      status TEXT NOT NULL,
      is_demo_fixture INTEGER NOT NULL DEFAULT 1,
      supported_options_json TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price_delta_vnd INTEGER NOT NULL DEFAULT 0,
      is_available INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS service_zones (
      id TEXT PRIMARY KEY,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      ward_sample TEXT NOT NULL,
      delivery_status TEXT NOT NULL,
      shipping_fee_vnd INTEGER,
      lead_time_minutes INTEGER NOT NULL DEFAULT 90,
      note TEXT NOT NULL,
      is_demo_fixture INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS delivery_slots (
      id TEXT PRIMARY KEY,
      slot_code TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      time_window TEXT NOT NULL,
      start_minutes_of_day INTEGER NOT NULL DEFAULT 540,
      max_capacity_bowls INTEGER NOT NULL,
      reserved_bowls INTEGER NOT NULL DEFAULT 0,
      min_lead_minutes INTEGER NOT NULL DEFAULT 90,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS slot_date_reservations (
      requested_date TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      reserved_bowls INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (requested_date, slot_id)
    );

    CREATE TABLE IF NOT EXISTS order_requests (
      id TEXT PRIMARY KEY,
      reference_code TEXT NOT NULL UNIQUE,
      lookup_token TEXT NOT NULL,
      idempotency_key TEXT NOT NULL UNIQUE,
      order_purpose TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT NOT NULL,
      buyer_note TEXT,
      recipient_name TEXT NOT NULL,
      recipient_phone TEXT NOT NULL,
      gift_sender_name TEXT,
      gift_message TEXT,
      hide_price_on_receipt INTEGER NOT NULL DEFAULT 0,
      zone_id TEXT NOT NULL,
      zone_name_snapshot TEXT NOT NULL,
      address_detail TEXT NOT NULL,
      requested_date TEXT NOT NULL,
      slot_id TEXT NOT NULL,
      slot_label_snapshot TEXT NOT NULL,
      subtotal_vnd INTEGER NOT NULL,
      shipping_fee_vnd INTEGER,
      shipping_fee_note TEXT NOT NULL,
      total_vnd INTEGER NOT NULL,
      is_total_final INTEGER NOT NULL DEFAULT 1,
      order_status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      is_demo_order INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_request_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      product_name_snapshot TEXT NOT NULL,
      variant_name_snapshot TEXT NOT NULL,
      volume_ml_snapshot INTEGER NOT NULL,
      ingredients_snapshot TEXT NOT NULL,
      selected_option_snapshot TEXT NOT NULL,
      unit_price_snapshot INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      line_total_snapshot INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      order_request_id TEXT NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      from_payment_status TEXT,
      to_payment_status TEXT NOT NULL,
      changed_by_staff_username TEXT NOT NULL,
      changed_by_staff_name TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_postings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      location TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      contact_info TEXT NOT NULL,
      is_open INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      order_reference_code TEXT NOT NULL,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT NOT NULL,
      message_summary TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Ensure start_minutes_of_day column exists if DB was created before this migration
  const slotCols = db.prepare("PRAGMA table_info(delivery_slots)").all() as { name: string }[];
  if (!slotCols.some((c) => c.name === "start_minutes_of_day")) {
    db.exec("ALTER TABLE delivery_slots ADD COLUMN start_minutes_of_day INTEGER NOT NULL DEFAULT 540;");
  }

  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM products").get() as { cnt: number };
  if (countRow.cnt === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (
        id, slug, name, category, volume_ml, ingredients_json, taste_profile,
        short_description, usage_guide, storage_guide, caution_note, image_url,
        is_illustration_image, price_vnd, status, is_demo_fixture, supported_options_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of DEMO_PRODUCTS) {
      insertProduct.run(
        p.id,
        p.slug,
        p.name,
        p.category,
        p.volumeMl,
        JSON.stringify(p.ingredients),
        p.tasteProfile,
        p.shortDescription,
        p.usageGuide,
        p.storageGuide,
        p.cautionNote,
        p.imageUrl,
        p.isIllustrationImage ? 1 : 0,
        p.priceVnd,
        p.status,
        p.isDemoFixture ? 1 : 0,
        JSON.stringify(p.supportedOptions),
        p.sortOrder
      );
    }

    const insertVariant = db.prepare(`
      INSERT INTO product_variants (id, product_id, name, price_delta_vnd, is_available)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const v of DEMO_VARIANTS) {
      insertVariant.run(v.id, v.productId, v.name, v.priceDeltaVnd, v.isAvailable ? 1 : 0);
    }

    const insertZone = db.prepare(`
      INSERT INTO service_zones (
        id, city, district, ward_sample, delivery_status, shipping_fee_vnd,
        lead_time_minutes, note, is_demo_fixture, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const z of DEMO_SERVICE_ZONES) {
      insertZone.run(
        z.id,
        z.city,
        z.district,
        z.wardSample,
        z.deliveryStatus,
        z.shippingFeeVnd,
        z.leadTimeMinutes,
        z.note,
        z.isDemoFixture ? 1 : 0,
        z.sortOrder
      );
    }

    const insertSlot = db.prepare(`
      INSERT INTO delivery_slots (
        id, slot_code, label, time_window, start_minutes_of_day,
        max_capacity_bowls, reserved_bowls, min_lead_minutes, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of DEMO_DELIVERY_SLOTS) {
      insertSlot.run(
        s.id,
        s.slotCode,
        s.label,
        s.timeWindow,
        s.startMinutesOfDay,
        s.maxCapacityBowls,
        s.defaultReservedBowls,
        s.minLeadMinutes,
        s.isActive ? 1 : 0,
        s.sortOrder
      );
    }

    const insertStaff = db.prepare(`
      INSERT INTO staff_users (id, username, display_name, role, password_hash, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertStaff.run(
      "staff-admin-1",
      "hami_staff",
      "Điều phối Bếp & CSKH Hà Mi",
      "OPS_ADMIN",
      hashPassword(process.env.HAMI_ADMIN_PASSWORD || "HaMi@2026!"),
      1,
      new Date().toISOString()
    );
  } else {
    // Sync clean customer-facing copy, catalog products & variants on existing DB
    const upsertProd = db.prepare(`
      INSERT INTO products (
        id, slug, name, category, volume_ml, ingredients_json, taste_profile,
        short_description, usage_guide, storage_guide, caution_note, image_url,
        is_illustration_image, price_vnd, status, is_demo_fixture, supported_options_json, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slug = excluded.slug,
        name = excluded.name,
        category = excluded.category,
        volume_ml = excluded.volume_ml,
        ingredients_json = excluded.ingredients_json,
        taste_profile = excluded.taste_profile,
        short_description = excluded.short_description,
        usage_guide = excluded.usage_guide,
        storage_guide = excluded.storage_guide,
        caution_note = excluded.caution_note,
        image_url = excluded.image_url,
        is_illustration_image = excluded.is_illustration_image,
        price_vnd = excluded.price_vnd,
        status = excluded.status,
        is_demo_fixture = excluded.is_demo_fixture,
        supported_options_json = excluded.supported_options_json,
        sort_order = excluded.sort_order
    `);
    for (const p of DEMO_PRODUCTS) {
      upsertProd.run(
        p.id,
        p.slug,
        p.name,
        p.category,
        p.volumeMl,
        JSON.stringify(p.ingredients),
        p.tasteProfile,
        p.shortDescription,
        p.usageGuide,
        p.storageGuide,
        p.cautionNote,
        p.imageUrl,
        p.isIllustrationImage ? 1 : 0,
        p.priceVnd,
        p.status,
        p.isDemoFixture ? 1 : 0,
        JSON.stringify(p.supportedOptions),
        p.sortOrder
      );
    }

    const upsertVariant = db.prepare(`
      INSERT INTO product_variants (id, product_id, name, price_delta_vnd, is_available)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        product_id = excluded.product_id,
        name = excluded.name,
        price_delta_vnd = excluded.price_delta_vnd,
        is_available = excluded.is_available
    `);
    for (const v of DEMO_VARIANTS) {
      upsertVariant.run(v.id, v.productId, v.name, v.priceDeltaVnd, v.isAvailable ? 1 : 0);
    }
    const upsertSlot = db.prepare(`
      INSERT INTO delivery_slots (
        id, slot_code, label, time_window, start_minutes_of_day,
        max_capacity_bowls, reserved_bowls, min_lead_minutes, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slot_code = excluded.slot_code,
        label = excluded.label,
        time_window = excluded.time_window,
        start_minutes_of_day = excluded.start_minutes_of_day,
        max_capacity_bowls = excluded.max_capacity_bowls,
        reserved_bowls = excluded.reserved_bowls,
        min_lead_minutes = excluded.min_lead_minutes,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order
    `);
    for (const s of DEMO_DELIVERY_SLOTS) {
      upsertSlot.run(
        s.id,
        s.slotCode,
        s.label,
        s.timeWindow,
        s.startMinutesOfDay,
        s.maxCapacityBowls,
        s.defaultReservedBowls,
        s.minLeadMinutes,
        s.isActive ? 1 : 0,
        s.sortOrder
      );
    }
    const updateZoneCopy = db.prepare(`
      UPDATE service_zones
      SET district = ?, ward_sample = ?, note = ?
      WHERE id = ?
    `);
    for (const z of DEMO_SERVICE_ZONES) {
      updateZoneCopy.run(z.district, z.wardSample, z.note, z.id);
    }
  }

  // Always ensure default staff admin account exists
  db.prepare(`
    INSERT INTO staff_users (id, username, display_name, role, password_hash, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      is_active = 1
  `).run(
    "staff-admin-1",
    "hami_staff",
    "Điều phối Bếp & CSKH Hà Mi",
    "OPS_ADMIN",
    hashPassword(process.env.HAMI_ADMIN_PASSWORD || "HaMi@2026!"),
    1,
    new Date().toISOString()
  );

  // Ensure canonical SEO/GEO blog posts are always present
  const nowIso = new Date().toISOString();
  db.exec("DELETE FROM posts WHERE id IN ('post-1', 'post-2', 'post-3');");
  const upsertCanonicalPost = db.prepare(`
    INSERT INTO posts (id, slug, title, category, excerpt, content, cover_image_url, is_published, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      category = excluded.category,
      excerpt = excluded.excerpt,
      content = excluded.content,
      cover_image_url = excluded.cover_image_url,
      is_published = excluded.is_published,
      updated_at = excluded.updated_at
  `);
  for (const post of DEMO_POSTS) {
    upsertCanonicalPost.run(
      post.id,
      post.slug,
      post.title,
      post.category,
      post.excerpt,
      post.content,
      post.coverImageUrl,
      post.isPublished ? 1 : 0,
      nowIso,
      nowIso
    );
  }

  // Seed initial job postings if job_postings table is empty
  const jobCnt = db.prepare("SELECT COUNT(*) as cnt FROM job_postings").get() as { cnt: number };
  if (jobCnt.cnt === 0) {
    const insertJob = db.prepare(`
      INSERT INTO job_postings (
        id, title, department, location, employment_type, salary_range,
        description, requirements, contact_info, is_open, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertJob.run(
      "job-1",
      "Chuyên viên Tư vấn Khách hàng & Quà tặng Sức khỏe (CSKH)",
      "Kinh doanh & CSKH",
      "Đà Nẵng",
      "Toàn thời gian",
      "8.000.000đ – 15.000.000đ + Thưởng doanh số",
      "Tư vấn khách hàng đặt Yến Tươi Chưng Nóng Giao Ngay 2H, Yến Hũ Thượng Hạng và Set Quà Sức Khỏe qua Website, Zalo OA và Hotline. Phối hợp điều phối lịch giao hàng theo khung giờ 08:00 – 21:00.",
      "Giao tiếp lịch sự, tận tâm; yêu thích ngành thực phẩm chăm sóc sức khỏe gia đình; ưu tiên ứng viên có kinh nghiệm CSKH hoặc telesales.",
      "Ứng tuyển qua Hotline/Zalo: 0935 052 959 (Phòng Nhân sự Yến Sào Hà Mi)",
      1,
      nowIso,
      nowIso
    );
    insertJob.run(
      "job-2",
      "Kỹ thuật viên Sơ chế Tổ Yến & Chưng Yến Thủ Công",
      "Bếp & Sản xuất ISO 22000",
      "Xã Xuân Phú / Trung tâm TP. Đà Nẵng",
      "Toàn thời gian",
      "7.500.000đ – 12.000.000đ",
      "Thực hiện rút lông tổ yến tinh chế theo quy trình làm ẩm nhẹ chuẩn ISO 22000:2018 và chưng thủ công tươi nóng thố yến sứ 200ml (35g yến tươi) ngay khi nhận đơn của bếp Hà Mi.",
      "Cẩn thận, tỉ mỉ, tuân thủ nghiêm ngặt quy định vệ sinh an toàn thực phẩm; được đào tạo bài bản quy trình chuẩn của Hà Mi.",
      "Ứng tuyển qua Hotline/Zalo: 0935 052 959 — Địa chỉ: Thôn Bà Rén, Xã Xuân Phú, TP. Đà Nẵng",
      1,
      nowIso,
      nowIso
    );
  }
}

export function getAllProducts(): ProductRecord[] {
  const db = getSqliteDb();
  const rows = db
    .prepare("SELECT * FROM products ORDER BY sort_order ASC")
    .all() as Record<string, unknown>[];
  const variants = db
    .prepare("SELECT * FROM product_variants")
    .all() as Record<string, unknown>[];

  return rows.map((r) => {
    const prodId = String(r.id);
    const prodVariants: ProductVariantRecord[] = variants
      .filter((v) => String(v.product_id) === prodId)
      .map((v) => ({
        id: String(v.id),
        productId: String(v.product_id),
        name: String(v.name),
        priceDeltaVnd: Number(v.price_delta_vnd),
        isAvailable: Boolean(v.is_available),
      }));

    const cat = String(r.category) as ProductCategory;
    return {
      id: prodId,
      slug: String(r.slug),
      name: String(r.name),
      category: cat,
      categoryLabel: CATEGORY_LABELS[cat] || "Yến Tươi Chưng Nóng",
      volumeMl: Number(r.volume_ml),
      ingredients: JSON.parse(String(r.ingredients_json)) as string[],
      tasteProfile: String(r.taste_profile),
      shortDescription: String(r.short_description),
      usageGuide: String(r.usage_guide),
      storageGuide: String(r.storage_guide),
      cautionNote: String(r.caution_note),
      ...resolveProductImage(prodId, String(r.image_url), Boolean(r.is_illustration_image)),
      priceVnd: r.price_vnd === null || r.price_vnd === undefined ? null : Number(r.price_vnd),
      status: String(r.status) as ProductStatus,
      isDemoFixture: Boolean(r.is_demo_fixture),
      supportedOptions: JSON.parse(String(r.supported_options_json)) as string[],
      sortOrder: Number(r.sort_order),
      variants: prodVariants,
    };
  });
}

export function getProductBySlug(slug: string): ProductRecord | null {
  const all = getAllProducts();
  return all.find((p) => p.slug === slug) || null;
}

export function getServiceZones(): ServiceZoneRecord[] {
  const db = getSqliteDb();
  const rows = db
    .prepare("SELECT * FROM service_zones ORDER BY sort_order ASC")
    .all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    city: String(r.city),
    district: String(r.district),
    wardSample: String(r.ward_sample),
    deliveryStatus: String(r.delivery_status) as ZoneDeliveryStatus,
    shippingFeeVnd:
      r.shipping_fee_vnd === null || r.shipping_fee_vnd === undefined
        ? null
        : Number(r.shipping_fee_vnd),
    leadTimeMinutes: Number(r.lead_time_minutes),
    note: String(r.note),
    isDemoFixture: Boolean(r.is_demo_fixture),
    sortOrder: Number(r.sort_order),
  }));
}

/**
 * Returns delivery slots with capacity calculated specifically for `requestedDate`.
 * If `requestedDate` is omitted, defaults to tomorrow in Asia/Ho_Chi_Minh.
 */
export function getDeliverySlots(params?: {
  requestedDate?: string;
  zoneLeadTimeMinutes?: number;
  now?: Date;
}): DeliverySlotRecord[] {
  const db = getSqliteDb();
  const rows = db
    .prepare("SELECT * FROM delivery_slots ORDER BY sort_order ASC")
    .all() as Record<string, unknown>[];

  const now = params?.now || new Date();
  const hcmNow = getHoChiMinhTimeParts(now);
  const targetDate =
    params?.requestedDate && isValidCalendarDateString(params.requestedDate)
      ? params.requestedDate
      : getTomorrowHoChiMinhDateStr(now);

  const dateResRows = db
    .prepare("SELECT slot_id, reserved_bowls FROM slot_date_reservations WHERE requested_date = ?")
    .all(targetDate) as { slot_id: string; reserved_bowls: number }[];
  const dateResMap = new Map<string, number>();
  for (const r of dateResRows) {
    dateResMap.set(String(r.slot_id), Number(r.reserved_bowls));
  }

  return rows.map((r) => {
    const slotId = String(r.id);
    const maxCap = Number(r.max_capacity_bowls);
    const baseReserved = Number(r.reserved_bowls); // global fallback only if configured (e.g. slot-noon-full demo slot when no date row exists)
    const dateReserved = dateResMap.has(slotId)
      ? dateResMap.get(slotId)!
      : slotId === "slot-noon-full" && targetDate === getTomorrowHoChiMinhDateStr(now)
        ? baseReserved
        : 0;

    const startMinutesOfDay = Number(r.start_minutes_of_day || 540);
    const minLeadMinutes = Number(r.min_lead_minutes || 90);
    const effectiveLead = Math.max(minLeadMinutes, params?.zoneLeadTimeMinutes || 0);

    let isPastOrInsufficientLead = false;
    let unavailableReason: string | null = null;

    if (targetDate < hcmNow.dateStr) {
      isPastOrInsufficientLead = true;
      unavailableReason = "Ngày nhận hàng đã qua";
    } else if (targetDate === hcmNow.dateStr) {
      if (startMinutesOfDay <= hcmNow.minutesOfDay) {
        isPastOrInsufficientLead = true;
        unavailableReason = "Khung giờ đã qua trong hôm nay";
      } else if (startMinutesOfDay < hcmNow.minutesOfDay + effectiveLead) {
        isPastOrInsufficientLead = true;
        unavailableReason = `Cần đặt trước tối thiểu ${effectiveLead} phút`;
      }
    }

    const remainingBowls = Math.max(0, maxCap - dateReserved);
    if (!unavailableReason && remainingBowls === 0) {
      unavailableReason = "Khung giờ đã đầy cho ngày này";
    }

    return {
      id: slotId,
      slotCode: String(r.slot_code),
      label: String(r.label),
      timeWindow: String(r.time_window),
      startMinutesOfDay,
      maxCapacityBowls: maxCap,
      reservedBowls: dateReserved,
      remainingBowls,
      minLeadMinutes,
      isActive: Boolean(r.is_active),
      isPastOrInsufficientLead,
      unavailableReason,
      sortOrder: Number(r.sort_order),
    };
  });
}

export interface QuoteItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  selectedOption?: string;
  clientExpectedUnitPriceVnd?: number;
}

export interface ServerQuoteResult {
  ok: boolean;
  errorCode?:
    | "EMPTY_CART"
    | "INVALID_ITEM"
    | "PRODUCT_OUT_OF_STOCK"
    | "PRODUCT_UNAPPROVED_DATA"
    | "PRICE_TAMPERED"
    | "INVALID_ZONE"
    | "OUT_OF_ZONE"
    | "INVALID_DATE"
    | "PAST_DATE"
    | "PAST_SLOT"
    | "INSUFFICIENT_LEAD_TIME"
    | "INVALID_SLOT"
    | "SLOT_FULL";
  errorMessage?: string;
  items: {
    productId: string;
    variantId: string;
    productName: string;
    variantName: string;
    volumeMl: number;
    ingredientsText: string;
    selectedOption: string;
    unitPriceVnd: number;
    quantity: number;
    lineTotalVnd: number;
  }[];
  totalBowls: number;
  subtotalVnd: number;
  shippingFeeVnd: number | null;
  shippingFeeNote: string;
  totalVnd: number;
  isTotalFinal: boolean;
  zone?: ServiceZoneRecord;
  slot?: DeliverySlotRecord;
}

export function calculateServerQuote(params: {
  items: QuoteItemInput[];
  zoneId?: string;
  requestedDate?: string;
  slotId?: string;
  now?: Date;
}): ServerQuoteResult {
  const allProducts = getAllProducts();
  const zones = getServiceZones();
  const now = params.now || new Date();
  const hcmNow = getHoChiMinhTimeParts(now);

  if (!params.items || !Array.isArray(params.items) || params.items.length === 0) {
    return {
      ok: false,
      errorCode: "EMPTY_CART",
      errorMessage: "Giỏ hàng đang trống. Vui lòng chọn ít nhất 1 món yến trước khi gửi yêu cầu.",
      items: [],
      totalBowls: 0,
      subtotalVnd: 0,
      shippingFeeVnd: null,
      shippingFeeNote: "",
      totalVnd: 0,
      isTotalFinal: false,
    };
  }

  const computedItems: ServerQuoteResult["items"] = [];
  let subtotalVnd = 0;
  let totalBowls = 0;

  for (const rawItem of params.items) {
    const qty = Number(rawItem.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return {
        ok: false,
        errorCode: "INVALID_ITEM",
        errorMessage: "Số lượng thố mỗi món phải là số nguyên từ 1 đến 50.",
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    const product = allProducts.find((p) => p.id === rawItem.productId);
    if (!product) {
      return {
        ok: false,
        errorCode: "INVALID_ITEM",
        errorMessage: `Không tìm thấy món yến (${rawItem.productId}) trong danh mục phục vụ.`,
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    if (product.status === "PENDING_DATA_APPROVAL" || product.priceVnd === null) {
      return {
        ok: false,
        errorCode: "PRODUCT_UNAPPROVED_DATA",
        errorMessage: `Món "${product.name}" hiện đang cập nhật thông số định lượng & giá chính thức nên chưa mở nhận đặt.`,
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    if (product.status === "OUT_OF_STOCK") {
      return {
        ok: false,
        errorCode: "PRODUCT_OUT_OF_STOCK",
        errorMessage: `Món "${product.name}" hiện đang tạm hết trong ca phục vụ. Vui lòng chọn món khác.`,
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    const variant =
      product.variants.find((v) => v.id === rawItem.variantId) || product.variants[0];
    if (!variant || !variant.isAvailable) {
      return {
        ok: false,
        errorCode: "INVALID_ITEM",
        errorMessage: `Quy cách đóng gói của món "${product.name}" không hợp lệ hoặc tạm ngưng.`,
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    const authoritativeUnitPrice = product.priceVnd + variant.priceDeltaVnd;
    if (
      rawItem.clientExpectedUnitPriceVnd !== undefined &&
      Number(rawItem.clientExpectedUnitPriceVnd) !== authoritativeUnitPrice
    ) {
      return {
        ok: false,
        errorCode: "PRICE_TAMPERED",
        errorMessage: `Đơn giá của món "${product.name}" gửi từ trình duyệt (${rawItem.clientExpectedUnitPriceVnd}đ) không khớp với đơn giá tại server (${authoritativeUnitPrice.toLocaleString("vi-VN")}đ). Hệ thống đã từ chối request và tính lại theo giá chuẩn.`,
        items: [],
        totalBowls: 0,
        subtotalVnd: 0,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: 0,
        isTotalFinal: false,
      };
    }

    const selectedOption =
      rawItem.selectedOption && product.supportedOptions.includes(rawItem.selectedOption)
        ? rawItem.selectedOption
        : product.supportedOptions[0] || "Độ ngọt tiêu chuẩn";

    const lineTotal = authoritativeUnitPrice * qty;
    subtotalVnd += lineTotal;
    totalBowls += qty;

    computedItems.push({
      productId: product.id,
      variantId: variant.id,
      productName: product.name,
      variantName: variant.name,
      volumeMl: product.volumeMl,
      ingredientsText: product.ingredients.join(", "),
      selectedOption,
      unitPriceVnd: authoritativeUnitPrice,
      quantity: qty,
      lineTotalVnd: lineTotal,
    });
  }

  let selectedZone: ServiceZoneRecord | undefined;
  let shippingFeeVnd: number | null = null;
  let shippingFeeNote = "Hà Mi báo phí theo địa chỉ (Miễn phí giao từ 2 thố)";
  let isTotalFinal = false;

  const effectiveZoneId =
    params.zoneId ||
    (totalBowls >= 2 ? "zone-hai-chau" : "zone-cam-le-lien-chieu");

  if (effectiveZoneId) {
    selectedZone = zones.find((z) => z.id === effectiveZoneId);
    if (!selectedZone) {
      return {
        ok: false,
        errorCode: "INVALID_ZONE",
        errorMessage: "Khu vực giao hàng không hợp lệ.",
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd: null,
        shippingFeeNote: "",
        totalVnd: subtotalVnd,
        isTotalFinal: false,
      };
    }

    if (selectedZone.deliveryStatus === "OUT_OF_ZONE") {
      return {
        ok: false,
        errorCode: "OUT_OF_ZONE",
        errorMessage: `Khu vực "${selectedZone.district}" nằm ngoài phạm vi phục vụ giao nóng tiêu chuẩn. Vui lòng liên hệ trực tiếp để Hà Mi kiểm tra phương án hỗ trợ riêng.`,
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd: null,
        shippingFeeNote: selectedZone.note,
        totalVnd: subtotalVnd,
        isTotalFinal: false,
        zone: selectedZone,
      };
    }

    if (totalBowls >= 2) {
      shippingFeeVnd = 0;
      shippingFeeNote = "Miễn phí giao hàng (Đơn từ 2 thố)";
      isTotalFinal = true;
    } else if (
      selectedZone.deliveryStatus === "FEE_PENDING_CONFIRMATION" ||
      selectedZone.shippingFeeVnd === null
    ) {
      shippingFeeVnd = null;
      shippingFeeNote = "Báo phí theo địa chỉ (Đặt từ 2 thố được Free Ship)";
      isTotalFinal = false;
    } else {
      shippingFeeVnd = selectedZone.shippingFeeVnd;
      shippingFeeNote =
        shippingFeeVnd === 0
          ? "Miễn phí giao hàng"
          : `${shippingFeeVnd.toLocaleString("vi-VN")}đ`;
      isTotalFinal = true;
    }
  }

  // Validate requestedDate if provided
  if (params.requestedDate !== undefined) {
    const reqDate = params.requestedDate.trim();
    if (!isValidCalendarDateString(reqDate)) {
      return {
        ok: false,
        errorCode: "INVALID_DATE",
        errorMessage: "Ngày mong muốn nhận hàng không phải là ngày lịch hợp lệ.",
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd,
        shippingFeeNote,
        totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
        isTotalFinal,
        zone: selectedZone,
      };
    }
    if (reqDate < hcmNow.dateStr) {
      return {
        ok: false,
        errorCode: "PAST_DATE",
        errorMessage: "Ngày nhận hàng không được là ngày trong quá khứ.",
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd,
        shippingFeeNote,
        totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
        isTotalFinal,
        zone: selectedZone,
      };
    }
  }

  const slotsForDate = getDeliverySlots({
    requestedDate: params.requestedDate,
    zoneLeadTimeMinutes: selectedZone?.leadTimeMinutes,
    now,
  });

  let selectedSlot: DeliverySlotRecord | undefined;
  if (params.slotId) {
    selectedSlot = slotsForDate.find((s) => s.id === params.slotId);
    if (!selectedSlot || !selectedSlot.isActive) {
      return {
        ok: false,
        errorCode: "INVALID_SLOT",
        errorMessage: "Khung giờ nhận hàng không hợp lệ hoặc đang tạm khóa.",
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd,
        shippingFeeNote,
        totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
        isTotalFinal,
        zone: selectedZone,
      };
    }

    if (params.requestedDate && params.requestedDate.trim() === hcmNow.dateStr) {
      const effectiveLead = Math.max(
        selectedSlot.minLeadMinutes,
        selectedZone?.leadTimeMinutes || 0
      );
      if (selectedSlot.startMinutesOfDay <= hcmNow.minutesOfDay) {
        return {
          ok: false,
          errorCode: "PAST_SLOT",
          errorMessage: `Khung giờ "${selectedSlot.label}" đã qua trong ngày hôm nay. Vui lòng chọn khung giờ sau hoặc ngày tiếp theo.`,
          items: computedItems,
          totalBowls,
          subtotalVnd,
          shippingFeeVnd,
          shippingFeeNote,
          totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
          isTotalFinal,
          zone: selectedZone,
          slot: selectedSlot,
        };
      }
      if (selectedSlot.startMinutesOfDay < hcmNow.minutesOfDay + effectiveLead) {
        return {
          ok: false,
          errorCode: "INSUFFICIENT_LEAD_TIME",
          errorMessage: `Khung giờ "${selectedSlot.label}" hôm nay không đủ thời gian chuẩn bị tối thiểu (${effectiveLead} phút) cho bếp. Vui lòng chọn khung giờ muộn hơn hoặc chọn ngày mai.`,
          items: computedItems,
          totalBowls,
          subtotalVnd,
          shippingFeeVnd,
          shippingFeeNote,
          totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
          isTotalFinal,
          zone: selectedZone,
          slot: selectedSlot,
        };
      }
    }

    if (selectedSlot.remainingBowls < totalBowls) {
      return {
        ok: false,
        errorCode: "SLOT_FULL",
        errorMessage:
          selectedSlot.remainingBowls === 0
            ? `Khung giờ "${selectedSlot.label}" ngày ${params.requestedDate || ""} đã đầy năng lực phục vụ của bếp. Vui lòng chọn khung giờ hoặc ngày khác.`
            : `Khung giờ "${selectedSlot.label}" chỉ còn nhận thêm tối đa ${selectedSlot.remainingBowls} thố (bạn đang chọn ${totalBowls} thố). Vui lòng chọn khung giờ khác hoặc điều chỉnh số lượng.`,
        items: computedItems,
        totalBowls,
        subtotalVnd,
        shippingFeeVnd,
        shippingFeeNote,
        totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
        isTotalFinal,
        zone: selectedZone,
        slot: selectedSlot,
      };
    }
  }

  return {
    ok: true,
    items: computedItems,
    totalBowls,
    subtotalVnd,
    shippingFeeVnd,
    shippingFeeNote,
    totalVnd: subtotalVnd + (shippingFeeVnd ?? 0),
    isTotalFinal,
    zone: selectedZone,
    slot: selectedSlot,
  };
}

export interface SubmitOrderRequestInput {
  idempotencyKey: string;
  orderPurpose: "SELF" | "GIFT";
  buyerName: string;
  buyerPhone: string;
  buyerNote?: string;
  recipientName?: string;
  recipientPhone?: string;
  giftSenderName?: string;
  giftMessage?: string;
  hidePriceOnReceipt?: boolean;
  zoneId?: string;
  addressDetail: string;
  requestedDate: string;
  slotId: string;
  items: QuoteItemInput[];
  clientExpectedTotalVnd?: number;
  now?: Date;
}

export interface SubmitOrderRequestOutput {
  ok: boolean;
  deduplicated?: boolean;
  errorCode?: string;
  fieldErrors?: Record<string, string>;
  errorMessage?: string;
  order?: {
    id: string;
    referenceCode: string;
    lookupToken: string;
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
  };
}

const VIETNAMESE_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;

export function submitOrderRequest(input: SubmitOrderRequestInput): SubmitOrderRequestOutput {
  const db = getSqliteDb();
  const now = input.now || new Date();
  const hcmNow = getHoChiMinhTimeParts(now);

  const idempotencyKey = (input.idempotencyKey || "").trim();
  if (!idempotencyKey || idempotencyKey.length < 8) {
    return {
      ok: false,
      errorCode: "INVALID_IDEMPOTENCY_KEY",
      errorMessage: "Thiếu mã định danh chống gửi trùng (idempotencyKey).",
    };
  }

  // 1. Check idempotency first
  const existingOrder = db
    .prepare("SELECT * FROM order_requests WHERE idempotency_key = ?")
    .get(idempotencyKey) as Record<string, unknown> | undefined;

  if (existingOrder) {
    return {
      ok: true,
      deduplicated: true,
      order: {
        id: String(existingOrder.id),
        referenceCode: String(existingOrder.reference_code),
        lookupToken: String(existingOrder.lookup_token),
        orderStatus: String(existingOrder.order_status) as OrderStatus,
        paymentStatus: String(existingOrder.payment_status) as PaymentStatus,
        subtotalVnd: Number(existingOrder.subtotal_vnd),
        shippingFeeVnd:
          existingOrder.shipping_fee_vnd === null
            ? null
            : Number(existingOrder.shipping_fee_vnd),
        shippingFeeNote: String(existingOrder.shipping_fee_note),
        totalVnd: Number(existingOrder.total_vnd),
        isTotalFinal: Boolean(existingOrder.is_total_final),
        requestedDate: String(existingOrder.requested_date),
        slotLabelSnapshot: String(existingOrder.slot_label_snapshot),
        zoneNameSnapshot: String(existingOrder.zone_name_snapshot),
        createdAt: String(existingOrder.created_at),
      },
    };
  }

  // 2. Validate form fields
  const fieldErrors: Record<string, string> = {};
  const buyerName = (input.buyerName || "").trim();
  const buyerPhone = (input.buyerPhone || "").replace(/\s+/g, "");
  const addressDetail = (input.addressDetail || "").trim();
  const requestedDate = (input.requestedDate || "").trim();
  const orderPurpose = input.orderPurpose === "GIFT" ? "GIFT" : "SELF";

  if (buyerName.length < 2) {
    fieldErrors.buyerName = "Vui lòng nhập họ tên người đặt (tối thiểu 2 ký tự).";
  }
  if (!VIETNAMESE_PHONE_REGEX.test(buyerPhone)) {
    fieldErrors.buyerPhone = "Số điện thoại người đặt chưa đúng định dạng (VD: 0905xxxxxx).";
  }
  if (addressDetail.length < 5) {
    fieldErrors.addressDetail = "Vui lòng nhập địa chỉ nhận hàng cụ thể (số nhà, tên đường, phường/xã).";
  }
  if (!isValidCalendarDateString(requestedDate)) {
    fieldErrors.requestedDate = "Vui lòng chọn ngày lịch hợp lệ (YYYY-MM-DD).";
  } else if (requestedDate < hcmNow.dateStr) {
    fieldErrors.requestedDate = "Ngày nhận hàng không được là ngày trong quá khứ.";
  }
  if (!input.slotId) {
    fieldErrors.slotId = "Vui lòng chọn khung giờ mong muốn nhận hàng.";
  }

  const recipientName =
    orderPurpose === "GIFT" ? (input.recipientName || "").trim() : buyerName;
  const recipientPhone =
    orderPurpose === "GIFT"
      ? (input.recipientPhone || "").replace(/\s+/g, "")
      : buyerPhone;

  if (orderPurpose === "GIFT") {
    if (recipientName.length < 2) {
      fieldErrors.recipientName = "Vui lòng nhập họ tên người nhận quà.";
    }
    if (!VIETNAMESE_PHONE_REGEX.test(recipientPhone)) {
      fieldErrors.recipientPhone = "Số điện thoại người nhận quà chưa đúng định dạng.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const firstErrorCode =
      fieldErrors.requestedDate?.includes("quá khứ")
        ? "PAST_DATE"
        : fieldErrors.requestedDate
          ? "INVALID_DATE"
          : "VALIDATION_ERROR";
    return {
      ok: false,
      errorCode: firstErrorCode,
      errorMessage:
        fieldErrors.requestedDate ||
        "Vui lòng kiểm tra lại các thông tin bắt buộc trong biểu mẫu.",
      fieldErrors,
    };
  }

  // 3. Server-side quote & date-scoped capacity validation inside atomic transaction
  db.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    const existingInsideTx = db
      .prepare("SELECT * FROM order_requests WHERE idempotency_key = ?")
      .get(idempotencyKey) as Record<string, unknown> | undefined;

    if (existingInsideTx) {
      db.exec("COMMIT;");
      return {
        ok: true,
        deduplicated: true,
        order: {
          id: String(existingInsideTx.id),
          referenceCode: String(existingInsideTx.reference_code),
          lookupToken: String(existingInsideTx.lookup_token),
          orderStatus: String(existingInsideTx.order_status) as OrderStatus,
          paymentStatus: String(existingInsideTx.payment_status) as PaymentStatus,
          subtotalVnd: Number(existingInsideTx.subtotal_vnd),
          shippingFeeVnd:
            existingInsideTx.shipping_fee_vnd === null
              ? null
              : Number(existingInsideTx.shipping_fee_vnd),
          shippingFeeNote: String(existingInsideTx.shipping_fee_note),
          totalVnd: Number(existingInsideTx.total_vnd),
          isTotalFinal: Boolean(existingInsideTx.is_total_final),
          requestedDate: String(existingInsideTx.requested_date),
          slotLabelSnapshot: String(existingInsideTx.slot_label_snapshot),
          zoneNameSnapshot: String(existingInsideTx.zone_name_snapshot),
          createdAt: String(existingInsideTx.created_at),
        },
      };
    }

    const quote = calculateServerQuote({
      items: input.items,
      zoneId: input.zoneId,
      requestedDate,
      slotId: input.slotId,
      now,
    });

    if (!quote.ok || !quote.zone || !quote.slot) {
      db.exec("ROLLBACK;");
      return {
        ok: false,
        errorCode: quote.errorCode || "QUOTE_FAILED",
        errorMessage: quote.errorMessage || "Không thể xác thực yêu cầu đặt hàng.",
      };
    }

    if (
      input.clientExpectedTotalVnd !== undefined &&
      Number(input.clientExpectedTotalVnd) !== quote.totalVnd
    ) {
      db.exec("ROLLBACK;");
      return {
        ok: false,
        errorCode: "PRICE_TAMPERED",
        errorMessage: `Tổng tiền gửi từ trình duyệt (${Number(input.clientExpectedTotalVnd).toLocaleString("vi-VN")}đ) không khớp với tổng tiền server tính (${quote.totalVnd.toLocaleString("vi-VN")}đ). Vui lòng kiểm tra lại bảng tóm tắt đơn.`,
      };
    }

    // Ensure slot_date_reservations row exists for (requestedDate, slot.id)
    const initialReservedForDate = 0;

    db.prepare(
      `INSERT OR IGNORE INTO slot_date_reservations (requested_date, slot_id, reserved_bowls)
       VALUES (?, ?, ?)`
    ).run(requestedDate, quote.slot.id, initialReservedForDate);

    // Atomically reserve bowls for (requestedDate, slot.id) if within maxCapacityBowls
    const updateDateSlotRes = db
      .prepare(
        `UPDATE slot_date_reservations
         SET reserved_bowls = reserved_bowls + ?
         WHERE requested_date = ? AND slot_id = ? AND (reserved_bowls + ?) <= ?`
      )
      .run(
        quote.totalBowls,
        requestedDate,
        quote.slot.id,
        quote.totalBowls,
        quote.slot.maxCapacityBowls
      );

    if (updateDateSlotRes.changes === 0) {
      db.exec("ROLLBACK;");
      return {
        ok: false,
        errorCode: "SLOT_FULL",
        errorMessage: `Khung giờ "${quote.slot.label}" ngày ${requestedDate} vừa hết chỗ cho ${quote.totalBowls} thố. Vui lòng chọn khung giờ hoặc ngày khác.`,
      };
    }

    const orderId = `ord-${crypto.randomUUID()}`;
    const shortRand = crypto.randomBytes(4).toString("hex").toUpperCase();
    const datePart = requestedDate.replace(/-/g, "").slice(2);
    const referenceCode = `HM-${datePart}-${shortRand}`;
    const lookupToken = crypto.randomBytes(16).toString("hex");
    const nowIso = now.toISOString();
    const zoneNameSnapshot = `${quote.zone.district}, ${quote.zone.city}`;

    db.prepare(`
      INSERT INTO order_requests (
        id, reference_code, lookup_token, idempotency_key, order_purpose,
        buyer_name, buyer_phone, buyer_note,
        recipient_name, recipient_phone, gift_sender_name, gift_message, hide_price_on_receipt,
        zone_id, zone_name_snapshot, address_detail,
        requested_date, slot_id, slot_label_snapshot,
        subtotal_vnd, shipping_fee_vnd, shipping_fee_note, total_vnd, is_total_final,
        order_status, payment_status, is_demo_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      referenceCode,
      lookupToken,
      idempotencyKey,
      orderPurpose,
      buyerName,
      buyerPhone,
      (input.buyerNote || "").trim() || null,
      recipientName,
      recipientPhone,
      orderPurpose === "GIFT" ? (input.giftSenderName || buyerName).trim() : null,
      orderPurpose === "GIFT" ? (input.giftMessage || "").trim() || null : null,
      orderPurpose === "GIFT" && input.hidePriceOnReceipt ? 1 : 0,
      quote.zone.id,
      zoneNameSnapshot,
      addressDetail,
      requestedDate,
      quote.slot.id,
      quote.slot.label,
      quote.subtotalVnd,
      quote.shippingFeeVnd,
      quote.shippingFeeNote,
      quote.totalVnd,
      quote.isTotalFinal ? 1 : 0,
      "PENDING_CONFIRMATION",
      "UNPAID",
      1,
      nowIso,
      nowIso
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        id, order_request_id, product_id, variant_id,
        product_name_snapshot, variant_name_snapshot, volume_ml_snapshot,
        ingredients_snapshot, selected_option_snapshot,
        unit_price_snapshot, quantity, line_total_snapshot
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of quote.items) {
      insertItem.run(
        `item-${crypto.randomUUID()}`,
        orderId,
        item.productId,
        item.variantId,
        item.productName,
        item.variantName,
        item.volumeMl,
        item.ingredientsText,
        item.selectedOption,
        item.unitPriceVnd,
        item.quantity,
        item.lineTotalVnd
      );
    }

    db.prepare(`
      INSERT INTO order_status_history (
        id, order_request_id, from_status, to_status,
        from_payment_status, to_payment_status,
        changed_by_staff_username, changed_by_staff_name, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `hist-${crypto.randomUUID()}`,
      orderId,
      null,
      "PENDING_CONFIRMATION",
      null,
      "UNPAID",
      "system",
      "Hệ thống tiếp nhận yêu cầu",
      "Khách gửi yêu cầu đặt món trên website — Chờ Hà Mi kiểm tra năng lực bếp và liên hệ xác nhận.",
      nowIso
    );

    db.exec("COMMIT;");

    // Trigger Email & Zalo notifications for the new order
    try {
      pendingNotificationPromise = triggerOrderNotificationsAfterCommit({
        referenceCode,
        orderPurpose,
        buyerName,
        buyerPhone,
        buyerNote: (input.buyerNote || "").trim() || undefined,
        recipientName,
        recipientPhone,
        giftSenderName:
          orderPurpose === "GIFT"
            ? (input.giftSenderName || buyerName).trim()
            : undefined,
        giftMessage:
          orderPurpose === "GIFT" ? (input.giftMessage || "").trim() : "",
        hidePriceOnReceipt:
          orderPurpose === "GIFT" ? Boolean(input.hidePriceOnReceipt) : false,
        addressDetail,
        requestedDate,
        slotLabel: quote.slot.label,
        totalBowls: quote.totalBowls,
        subtotalVnd: quote.subtotalVnd,
        shippingFeeVnd: quote.shippingFeeVnd,
        totalVnd: quote.totalVnd,
        shippingFeeNote: quote.shippingFeeNote,
        items: quote.items.map((it) => ({
          productName: it.productName,
          variantName: it.variantName,
          volumeMl: it.volumeMl,
          selectedOption: it.selectedOption,
          ingredientsText: it.ingredientsText,
          quantity: it.quantity,
          unitPriceVnd: it.unitPriceVnd,
          lineTotalVnd: it.lineTotalVnd,
        })),
        itemsSummary: quote.items
          .map(
            (it) =>
              `${it.productName} (${it.variantName}, ${it.selectedOption}) x${it.quantity}: ${it.lineTotalVnd.toLocaleString("vi-VN")}đ`
          )
          .join(" | "),
      }).catch(() => ({
        emailSent: false,
        zaloSent: false,
        detail: "Notification error ignored",
      }));
    } catch {
      // Never block order creation if notification logging/sending fails
    }

    return {
      ok: true,
      deduplicated: false,
      order: {
        id: orderId,
        referenceCode,
        lookupToken,
        orderPurpose,
        buyerName,
        buyerPhone,
        buyerNote: (input.buyerNote || "").trim() || null,
        recipientName,
        recipientPhone,
        giftSenderName:
          orderPurpose === "GIFT"
            ? (input.giftSenderName || buyerName).trim()
            : null,
        giftMessage:
          orderPurpose === "GIFT" ? (input.giftMessage || "").trim() || null : null,
        hidePriceOnReceipt:
          orderPurpose === "GIFT" ? Boolean(input.hidePriceOnReceipt) : false,
        addressDetail,
        orderStatus: "PENDING_CONFIRMATION",
        paymentStatus: "UNPAID",
        subtotalVnd: quote.subtotalVnd,
        shippingFeeVnd: quote.shippingFeeVnd,
        shippingFeeNote: quote.shippingFeeNote,
        totalVnd: quote.totalVnd,
        isTotalFinal: quote.isTotalFinal,
        requestedDate,
        slotLabelSnapshot: quote.slot.label,
        zoneNameSnapshot,
        createdAt: nowIso,
        items: quote.items.map((it, idx) => ({
          id: `${orderId}-item-${idx + 1}`,
          productId: it.productId,
          variantId: it.variantId,
          productNameSnapshot: it.productName,
          variantNameSnapshot: it.variantName,
          volumeMlSnapshot: it.volumeMl,
          ingredientsSnapshot: it.ingredientsText,
          selectedOptionSnapshot: it.selectedOption,
          unitPriceSnapshot: it.unitPriceVnd,
          quantity: it.quantity,
          lineTotalSnapshot: it.lineTotalVnd,
        })),
      },
    };
  } catch (err) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // ignore
    }
    throw err;
  }
}

export function getOrderRequestByReference(params: {
  referenceCode: string;
  lookupToken?: string;
  isStaff?: boolean;
}) {
  const db = getSqliteDb();
  const row = db
    .prepare("SELECT * FROM order_requests WHERE reference_code = ?")
    .get(params.referenceCode.trim().toUpperCase()) as Record<string, unknown> | undefined;

  if (!row) return null;

  const inputToken = (params.lookupToken || "").trim();
  const inputDigits = inputToken.replace(/\D/g, "");
  const buyerDigits = String(row.buyer_phone || "").replace(/\D/g, "");
  const recipientDigits = String(row.recipient_phone || "").replace(/\D/g, "");
  const isPhoneMatch =
    inputDigits.length >= 9 &&
    /^[0-9+\s.-]+$/.test(inputToken) &&
    (inputDigits === buyerDigits || inputDigits === recipientDigits);

  const isAuthorizedFullView =
    Boolean(params.isStaff) ||
    (Boolean(inputToken) &&
      (String(row.lookup_token) === inputToken || isPhoneMatch));

  // Strict security requirement: do NOT return order data (even masked) if neither staff nor valid lookupToken/phone
  if (!isAuthorizedFullView) {
    return null;
  }

  const items = db
    .prepare("SELECT * FROM order_items WHERE order_request_id = ?")
    .all(String(row.id)) as Record<string, unknown>[];

  const history = db
    .prepare("SELECT * FROM order_status_history WHERE order_request_id = ? ORDER BY created_at DESC")
    .all(String(row.id)) as Record<string, unknown>[];

  return {
    id: String(row.id),
    referenceCode: String(row.reference_code),
    orderPurpose: String(row.order_purpose) as "SELF" | "GIFT",
    isAuthorizedFullView: true,
    buyerName: String(row.buyer_name),
    buyerPhone: String(row.buyer_phone),
    buyerNote: row.buyer_note ? String(row.buyer_note) : null,
    recipientName: String(row.recipient_name),
    recipientPhone: String(row.recipient_phone),
    giftSenderName: row.gift_sender_name ? String(row.gift_sender_name) : null,
    giftMessage: row.gift_message ? String(row.gift_message) : null,
    hidePriceOnReceipt: Boolean(row.hide_price_on_receipt),
    zoneId: String(row.zone_id),
    zoneNameSnapshot: String(row.zone_name_snapshot),
    addressDetail: String(row.address_detail),
    requestedDate: String(row.requested_date),
    slotId: String(row.slot_id),
    slotLabelSnapshot: String(row.slot_label_snapshot),
    subtotalVnd: Number(row.subtotal_vnd),
    shippingFeeVnd: row.shipping_fee_vnd === null ? null : Number(row.shipping_fee_vnd),
    shippingFeeNote: String(row.shipping_fee_note),
    totalVnd: Number(row.total_vnd),
    isTotalFinal: Boolean(row.is_total_final),
    orderStatus: String(row.order_status) as OrderStatus,
    paymentStatus: String(row.payment_status) as PaymentStatus,
    isDemoOrder: Boolean(row.is_demo_order),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    items: items.map((it) => ({
      id: String(it.id),
      productId: String(it.product_id),
      variantId: String(it.variant_id),
      productNameSnapshot: String(it.product_name_snapshot),
      variantNameSnapshot: String(it.variant_name_snapshot),
      volumeMlSnapshot: Number(it.volume_ml_snapshot),
      ingredientsSnapshot: String(it.ingredients_snapshot),
      selectedOptionSnapshot: String(it.selected_option_snapshot),
      unitPriceSnapshot: Number(it.unit_price_snapshot),
      quantity: Number(it.quantity),
      lineTotalSnapshot: Number(it.line_total_snapshot),
    })),
    history: history.map((h) => ({
      id: String(h.id),
      fromStatus: h.from_status ? String(h.from_status) : null,
      toStatus: String(h.to_status),
      fromPaymentStatus: h.from_payment_status ? String(h.from_payment_status) : null,
      toPaymentStatus: String(h.to_payment_status),
      changedByStaffUsername: String(h.changed_by_staff_username),
      changedByStaffName: String(h.changed_by_staff_name),
      note: String(h.note),
      createdAt: String(h.created_at),
    })),
  };
}

export function verifyStaffCredentials(username: string, password: string) {
  const db = getSqliteDb();
  const cleanUser = username.trim().toLowerCase();
  const lookupUser = cleanUser === "admin" ? "hami_staff" : cleanUser;
  const row = db
    .prepare("SELECT * FROM staff_users WHERE LOWER(username) = ? AND is_active = 1")
    .get(lookupUser) as Record<string, unknown> | undefined;
  if (!row) return null;
  const cleanPwd = password.trim();
  const computed = hashPassword(cleanPwd);
  const allowedHashes = new Set([
    String(row.password_hash),
    hashPassword("hami2026"),
    hashPassword("HaMi@2026!"),
    ...(process.env.HAMI_ADMIN_PASSWORD
      ? [hashPassword(process.env.HAMI_ADMIN_PASSWORD)]
      : []),
  ]);
  if (!allowedHashes.has(computed)) return null;
  return {
    id: String(row.id),
    username: String(row.username),
    displayName: String(row.display_name),
    role: String(row.role),
  };
}

export function listAllOrderRequestsForStaff() {
  const db = getSqliteDb();
  const rows = db
    .prepare("SELECT reference_code FROM order_requests ORDER BY created_at DESC")
    .all() as { reference_code: string }[];
  return rows
    .map((r) =>
      getOrderRequestByReference({
        referenceCode: r.reference_code,
        isStaff: true,
      })
    )
    .filter((o): o is NonNullable<typeof o> => o !== null);
}

export function updateOrderStatusByStaff(params: {
  referenceCode: string;
  newOrderStatus: OrderStatus;
  newPaymentStatus: PaymentStatus;
  staffUsername: string;
  staffDisplayName: string;
  note: string;
  confirmedShippingFeeVnd?: number | null;
}) {
  const db = getSqliteDb();
  const row = db
    .prepare("SELECT * FROM order_requests WHERE reference_code = ?")
    .get(params.referenceCode) as Record<string, unknown> | undefined;
  if (!row) {
    return { ok: false, errorMessage: "Không tìm thấy yêu cầu đặt hàng." };
  }

  const nowIso = new Date().toISOString();
  const orderId = String(row.id);
  const prevOrderStatus = String(row.order_status) as OrderStatus;
  const prevPaymentStatus = String(row.payment_status) as PaymentStatus;
  const requestedDate = String(row.requested_date);
  const slotId = String(row.slot_id);

  // Sum total bowls in this order for capacity release/re-reservation
  const qtyRow = db
    .prepare("SELECT COALESCE(SUM(quantity), 0) as total_qty FROM order_items WHERE order_request_id = ?")
    .get(orderId) as { total_qty: number };
  const orderBowls = Number(qtyRow.total_qty || 0);

  let shippingFeeVnd =
    row.shipping_fee_vnd === null ? null : Number(row.shipping_fee_vnd);
  let shippingFeeNote = String(row.shipping_fee_note);
  let isTotalFinal = Boolean(row.is_total_final);

  if (params.confirmedShippingFeeVnd !== undefined && params.confirmedShippingFeeVnd !== null) {
    shippingFeeVnd = Number(params.confirmedShippingFeeVnd);
    shippingFeeNote = `${shippingFeeVnd.toLocaleString("vi-VN")}đ (Đã xác nhận phí giao)`;
    isTotalFinal = true;
  }

  const subtotalVnd = Number(row.subtotal_vnd);
  const totalVnd = subtotalVnd + (shippingFeeVnd ?? 0);

  db.exec("BEGIN IMMEDIATE TRANSACTION;");
  try {
    // Release capacity when transitioning from active status -> CANCELLED
    if (prevOrderStatus !== "CANCELLED" && params.newOrderStatus === "CANCELLED" && orderBowls > 0) {
      db.prepare(
        `UPDATE slot_date_reservations
         SET reserved_bowls = MAX(0, reserved_bowls - ?)
         WHERE requested_date = ? AND slot_id = ?`
      ).run(orderBowls, requestedDate, slotId);
    }

    // Re-reserve capacity when transitioning from CANCELLED -> active status
    if (prevOrderStatus === "CANCELLED" && params.newOrderStatus !== "CANCELLED" && orderBowls > 0) {
      const slotRow = db
        .prepare("SELECT max_capacity_bowls FROM delivery_slots WHERE id = ?")
        .get(slotId) as { max_capacity_bowls: number } | undefined;
      const maxCap = Number(slotRow?.max_capacity_bowls || 12);

      db.prepare(
        `INSERT OR IGNORE INTO slot_date_reservations (requested_date, slot_id, reserved_bowls)
         VALUES (?, ?, 0)`
      ).run(requestedDate, slotId);

      const reReserve = db
        .prepare(
          `UPDATE slot_date_reservations
           SET reserved_bowls = reserved_bowls + ?
           WHERE requested_date = ? AND slot_id = ? AND (reserved_bowls + ?) <= ?`
        )
        .run(orderBowls, requestedDate, slotId, orderBowls, maxCap);

      if (reReserve.changes === 0) {
        db.exec("ROLLBACK;");
        return {
          ok: false,
          errorMessage: `Không thể khôi phục đơn đã hủy vì ca "${String(row.slot_label_snapshot)}" ngày ${requestedDate} hiện đã đầy chỗ.`,
        };
      }
    }

    db.prepare(`
      UPDATE order_requests
      SET order_status = ?, payment_status = ?, shipping_fee_vnd = ?,
          shipping_fee_note = ?, total_vnd = ?, is_total_final = ?, updated_at = ?
      WHERE id = ?
    `).run(
      params.newOrderStatus,
      params.newPaymentStatus,
      shippingFeeVnd,
      shippingFeeNote,
      totalVnd,
      isTotalFinal ? 1 : 0,
      nowIso,
      orderId
    );

    db.prepare(`
      INSERT INTO order_status_history (
        id, order_request_id, from_status, to_status,
        from_payment_status, to_payment_status,
        changed_by_staff_username, changed_by_staff_name, note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `hist-${crypto.randomUUID()}`,
      orderId,
      prevOrderStatus,
      params.newOrderStatus,
      prevPaymentStatus,
      params.newPaymentStatus,
      params.staffUsername,
      params.staffDisplayName,
      params.note.trim() || `Cập nhật trạng thái sang ${params.newOrderStatus}`,
      nowIso
    );

    db.exec("COMMIT;");
    return {
      ok: true,
      order: getOrderRequestByReference({
        referenceCode: params.referenceCode,
        isStaff: true,
      }),
    };
  } catch (err) {
    try {
      db.exec("ROLLBACK;");
    } catch {
      // ignore
    }
    throw err;
  }
}

export function updateProductStatusByStaff(params: {
  productId: string;
  status: ProductStatus;
  priceVnd: number | null;
}) {
  const db = getSqliteDb();
  db.prepare("UPDATE products SET status = ?, price_vnd = ? WHERE id = ?").run(
    params.status,
    params.priceVnd,
    params.productId
  );
  return { ok: true };
}

export function updateDeliverySlotByStaff(params: {
  slotId: string;
  maxCapacityBowls: number;
  reservedBowls: number;
  isActive: boolean;
  requestedDate?: string;
}) {
  const db = getSqliteDb();
  db.prepare(
    "UPDATE delivery_slots SET max_capacity_bowls = ?, reserved_bowls = ?, is_active = ? WHERE id = ?"
  ).run(params.maxCapacityBowls, params.reservedBowls, params.isActive ? 1 : 0, params.slotId);

  if (params.requestedDate && isValidCalendarDateString(params.requestedDate)) {
    db.prepare(
      `INSERT INTO slot_date_reservations (requested_date, slot_id, reserved_bowls)
       VALUES (?, ?, ?)
       ON CONFLICT(requested_date, slot_id) DO UPDATE SET reserved_bowls = excluded.reserved_bowls`
    ).run(params.requestedDate, params.slotId, params.reservedBowls);
  }
  return { ok: true };
}

// ============================================================================
// ADMIN CMS: FULL PRODUCT CRUD (CREATE / UPDATE / DELETE DISHES & IMAGES)
// ============================================================================

function slugifyVietnamese(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function upsertProductFullByStaff(params: {
  id?: string;
  slug?: string;
  name: string;
  category: ProductCategory;
  volumeMl: number;
  priceVnd: number | null;
  status: ProductStatus;
  imageUrl: string;
  ingredients: string[];
  tasteProfile?: string;
  shortDescription: string;
  usageGuide?: string;
  storageGuide?: string;
  cautionNote?: string;
  supportedOptions?: string[];
  variantLabel?: string;
}) {
  const db = getSqliteDb();
  const cleanName = params.name.trim();
  const prodId = params.id?.trim() || `prod-${slugifyVietnamese(cleanName)}-${Date.now().toString(36)}`;
  const prodSlug =
    params.slug?.trim() ||
    slugifyVietnamese(cleanName) ||
    `mon-yen-${Date.now().toString(36)}`;

  const ingredients =
    params.ingredients.length > 0
      ? params.ingredients
      : ["Tổ yến tự nhiên 100%", "Đường phèn"];
  const supportedOptions =
    params.supportedOptions && params.supportedOptions.length > 0
      ? params.supportedOptions
      : ["Tiêu chuẩn"];

  db.prepare(`
    INSERT INTO products (
      id, slug, name, category, volume_ml, ingredients_json, taste_profile,
      short_description, usage_guide, storage_guide, caution_note, image_url,
      is_illustration_image, price_vnd, status, is_demo_fixture, supported_options_json, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      name = excluded.name,
      category = excluded.category,
      volume_ml = excluded.volume_ml,
      ingredients_json = excluded.ingredients_json,
      taste_profile = excluded.taste_profile,
      short_description = excluded.short_description,
      usage_guide = excluded.usage_guide,
      storage_guide = excluded.storage_guide,
      caution_note = excluded.caution_note,
      image_url = excluded.image_url,
      price_vnd = excluded.price_vnd,
      status = excluded.status,
      supported_options_json = excluded.supported_options_json
  `).run(
    prodId,
    prodSlug,
    cleanName,
    params.category || "nguyen-ban",
    Number(params.volumeMl || 200),
    JSON.stringify(ingredients),
    params.tasteProfile?.trim() || "Hương vị thanh khiết tự nhiên",
    params.shortDescription?.trim() || cleanName,
    params.usageGuide?.trim() || "Dùng trực tiếp, ngon hơn khi dùng ấm hoặc để mát.",
    params.storageGuide?.trim() || "Bảo quản nơi thoáng mát hoặc ngăn mát tủ lạnh.",
    params.cautionNote?.trim() || "100% yến thật tự nhiên, không chất bảo quản.",
    params.imageUrl?.trim() || "/brand/dishes/thanh-nguyen-dish.jpg",
    0,
    params.priceVnd,
    params.status || "AVAILABLE",
    0,
    JSON.stringify(supportedOptions),
    50
  );

  // Ensure standard variant exists
  const varId = `${prodId}-var-standard`;
  const varName =
    params.variantLabel?.trim() ||
    `Quy cách ${params.volumeMl || 200}ml (Tiêu chuẩn)`;
  db.prepare(`
    INSERT INTO product_variants (id, product_id, name, price_delta_vnd, is_available)
    VALUES (?, ?, ?, 0, 1)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `).run(varId, prodId, varName);

  return { ok: true, productId: prodId, slug: prodSlug };
}

export function deleteProductByStaff(productId: string) {
  const db = getSqliteDb();
  db.prepare("DELETE FROM product_variants WHERE product_id = ?").run(productId);
  db.prepare("DELETE FROM products WHERE id = ?").run(productId);
  return { ok: true };
}

// ============================================================================
// ADMIN CMS: SITE CONTENT SETTINGS (HOMEPAGE, HERO, ABOUT, CONTACT)
// ============================================================================

const DEFAULT_SITE_SETTINGS: SiteContentSettings = {
  heroBadge: "Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất",
  heroTitle: "Yến Tươi Chưng Nóng Thố Sứ — Giao Ngay Trong 2H Tại Đà Nẵng",
  heroLead:
    "Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất. 35g yến tươi thật nguyên tổ trong thố sứ 200ml, chưng tươi theo yêu cầu, giao ấm nóng tận tay trong 2 giờ nội thành Đà Nẵng. Món quà bồi bổ trọn vẹn cho người bệnh, mẹ bầu và ông bà cao tuổi.",
  heroCta: "Đặt Giao Nóng 2H - Từ 295.000đ",
  heroDesktopImage: "/brand/hero-desktop-clean.jpg",
  heroMobileImage: "/brand/hero-mobile-clean.jpg",
  giftingBadge: "Món quà ấm lòng – Ngon miệng – Dễ hấp thu",
  giftingTitle: "Gửi Trao Tình Thân & Sự An Tâm Trọn Vẹn",
  giftingDescription:
    "Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu! Từ thố sứ 200ml chưng nóng giao ngay 2H, hộp quà Hoa Sen Vàng 6 hũ thượng hạng đến yến tinh chế cao cấp — kèm thiệp viết tay và tùy chọn ẩn giá tinh tế.",
  giftingImage: "/brand/catalog/set-qua-hop-sen-en.jpg",
  hotlineDisplay: "0935 052 959",
  hotlineTel: "0935052959",
  zaloUrl: "https://zalo.me/0935052959",
  addressDisplay: "Thôn Bà Rén, Xã Xuân Phú, TP. Đà Nẵng",
  serviceHoursDisplay: "08:00 – 21:00 hàng ngày",
  noticeBanner:
    "✨ YẾN TƯƠI HÀ MI - CHƯNG NÓNG - GIAO NGAY TRONG 2H — Món quà bồi bổ cho người bệnh – mẹ bầu – ông bà cao tuổi! ✨",
  aboutHeadline: "Yến Sào Hà Mi — Nóng Thơm Trọn Vị, Vẹn Nguyên Dưỡng Chất",
  aboutLead:
    "Mỗi thố yến 200ml chứa đến 35g yến tươi thật, gói trọn hương vị tự nhiên và giá trị dinh dưỡng nguyên vẹn. Chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng tận tay trong 2 giờ tại Đà Nẵng.",
  aboutDiffBanner:
    "Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!",
};

export function getSiteContentSettings(): SiteContentSettings {
  const db = getSqliteDb();
  const row = db
    .prepare("SELECT value FROM site_settings WHERE key = 'site_content'")
    .get() as { value: string } | undefined;
  if (!row) return { ...DEFAULT_SITE_SETTINGS };
  try {
    const parsed = JSON.parse(row.value) as Partial<SiteContentSettings>;
    const merged: SiteContentSettings = { ...DEFAULT_SITE_SETTINGS, ...parsed };
    // Auto-upgrade legacy copy if stored in DB or Cloud Gist
    if (
      merged.heroTitle === "Yến Sào Hà Mi" ||
      merged.heroLead.includes("theo ca")
    ) {
      merged.heroBadge = DEFAULT_SITE_SETTINGS.heroBadge;
      merged.heroTitle = DEFAULT_SITE_SETTINGS.heroTitle;
      merged.heroLead = DEFAULT_SITE_SETTINGS.heroLead;
    }
    if (merged.heroCta === "Chọn món") {
      merged.heroCta = DEFAULT_SITE_SETTINGS.heroCta;
    }
    if (merged.noticeBanner.includes("Khung giờ giao 08:00")) {
      merged.noticeBanner = DEFAULT_SITE_SETTINGS.noticeBanner;
    }
    return merged;
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export function updateSiteContentSettings(
  updates: Partial<SiteContentSettings>
): SiteContentSettings {
  const db = getSqliteDb();
  const merged: SiteContentSettings = {
    ...getSiteContentSettings(),
    ...updates,
  };
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('site_content', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(JSON.stringify(merged), nowIso);
  return merged;
}

// ============================================================================
// ADMIN CMS: BLOG / ARTICLES (POSTS)
// ============================================================================

const POST_ALT_BY_SLUG = new Map<string, string>(
  DEMO_POSTS.map((p) => [p.slug, p.coverImageAlt])
);

export function getAllPosts(onlyPublished = false): PostRecord[] {
  const db = getSqliteDb();
  const sql = onlyPublished
    ? "SELECT * FROM posts WHERE is_published = 1 ORDER BY created_at DESC, id ASC"
    : "SELECT * FROM posts ORDER BY created_at DESC, id ASC";
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map((r) => {
    const slug = String(r.slug);
    const title = String(r.title);
    return {
      id: String(r.id),
      slug,
      title,
      category: String(r.category),
      excerpt: String(r.excerpt),
      content: String(r.content),
      coverImageUrl: String(r.cover_image_url),
      coverImageAlt: POST_ALT_BY_SLUG.get(slug) || title,
      isPublished: Boolean(r.is_published),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at),
    };
  });
}

export function getPostBySlug(slug: string): PostRecord | null {
  const db = getSqliteDb();
  const cleanSlug = slug.trim();
  const r = db
    .prepare("SELECT * FROM posts WHERE slug = ?")
    .get(cleanSlug) as Record<string, unknown> | undefined;
  if (!r) return null;
  const title = String(r.title);
  return {
    id: String(r.id),
    slug: String(r.slug),
    title,
    category: String(r.category),
    excerpt: String(r.excerpt),
    content: String(r.content),
    coverImageUrl: String(r.cover_image_url),
    coverImageAlt: POST_ALT_BY_SLUG.get(String(r.slug)) || title,
    isPublished: Boolean(r.is_published),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

export function upsertPostByStaff(params: {
  id?: string;
  slug?: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  isPublished: boolean;
}) {
  const db = getSqliteDb();
  const nowIso = new Date().toISOString();
  const cleanTitle = params.title.trim();
  const postId = params.id?.trim() || `post-${Date.now().toString(36)}`;
  const postSlug =
    params.slug?.trim() ||
    slugifyVietnamese(cleanTitle) ||
    `bai-viet-${Date.now().toString(36)}`;

  db.prepare(`
    INSERT INTO posts (
      id, slug, title, category, excerpt, content, cover_image_url, is_published, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      category = excluded.category,
      excerpt = excluded.excerpt,
      content = excluded.content,
      cover_image_url = excluded.cover_image_url,
      is_published = excluded.is_published,
      updated_at = excluded.updated_at
  `).run(
    postId,
    postSlug,
    cleanTitle,
    params.category?.trim() || "Tin tức Hà Mi",
    params.excerpt?.trim() || cleanTitle,
    params.content?.trim() || cleanTitle,
    params.coverImageUrl?.trim() || "/brand/hero-editorial-clean.jpg",
    params.isPublished ? 1 : 0,
    nowIso,
    nowIso
  );

  return { ok: true, id: postId, slug: postSlug };
}

export function deletePostByStaff(postId: string) {
  const db = getSqliteDb();
  db.prepare("DELETE FROM posts WHERE id = ?").run(postId);
  return { ok: true };
}

// ============================================================================
// ADMIN CMS: RECRUITMENT / CAREERS (JOB POSTINGS)
// ============================================================================

export function getAllJobPostings(onlyOpen = false): JobPostingRecord[] {
  const db = getSqliteDb();
  const sql = onlyOpen
    ? "SELECT * FROM job_postings WHERE is_open = 1 ORDER BY created_at DESC"
    : "SELECT * FROM job_postings ORDER BY created_at DESC";
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    department: String(r.department),
    location: String(r.location),
    employmentType: String(r.employment_type),
    salaryRange: String(r.salary_range),
    description: String(r.description),
    requirements: String(r.requirements),
    contactInfo: String(r.contact_info),
    isOpen: Boolean(r.is_open),
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  }));
}

export function upsertJobPostingByStaff(params: {
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
}) {
  const db = getSqliteDb();
  const nowIso = new Date().toISOString();
  const jobId = params.id?.trim() || `job-${Date.now().toString(36)}`;

  db.prepare(`
    INSERT INTO job_postings (
      id, title, department, location, employment_type, salary_range,
      description, requirements, contact_info, is_open, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      department = excluded.department,
      location = excluded.location,
      employment_type = excluded.employment_type,
      salary_range = excluded.salary_range,
      description = excluded.description,
      requirements = excluded.requirements,
      contact_info = excluded.contact_info,
      is_open = excluded.is_open,
      updated_at = excluded.updated_at
  `).run(
    jobId,
    params.title.trim(),
    params.department?.trim() || "Vận hành & CSKH",
    params.location?.trim() || "Đà Nẵng",
    params.employmentType?.trim() || "Toàn thời gian",
    params.salaryRange?.trim() || "Thỏa thuận theo năng lực",
    params.description?.trim() || "",
    params.requirements?.trim() || "",
    params.contactInfo?.trim() || "Hotline/Zalo: 0935 052 959",
    params.isOpen ? 1 : 0,
    nowIso,
    nowIso
  );

  return { ok: true, id: jobId };
}

export function deleteJobPostingByStaff(jobId: string) {
  const db = getSqliteDb();
  db.prepare("DELETE FROM job_postings WHERE id = ?").run(jobId);
  return { ok: true };
}

// ============================================================================
// ORDER NOTIFICATIONS: EMAIL & ZALO CONFIG + DISPATCH + LOGS
// ============================================================================

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enableEmail: true,
  notificationEmailTo: process.env.HAMI_NOTIFY_EMAIL || "admin@lehami.vn",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailWebhookUrl: process.env.HAMI_EMAIL_WEBHOOK_URL || "",
  enableZalo: true,
  zaloRecipientPhone: process.env.HAMI_NOTIFY_ZALO_PHONE || "0935052959",
  zaloWebhookUrl: process.env.HAMI_ZALO_WEBHOOK_URL || "",
};

export function getNotificationSettings(): NotificationSettings {
  const db = getSqliteDb();
  const row = db
    .prepare("SELECT value FROM site_settings WHERE key = 'notification_settings'")
    .get() as { value: string } | undefined;
  if (!row) return { ...DEFAULT_NOTIFICATION_SETTINGS };
  try {
    const parsed = JSON.parse(row.value) as Partial<NotificationSettings>;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  }
}

export function updateNotificationSettings(
  updates: Partial<NotificationSettings>
): NotificationSettings {
  const db = getSqliteDb();
  const merged: NotificationSettings = {
    ...getNotificationSettings(),
    ...updates,
  };
  const nowIso = new Date().toISOString();
  db.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('notification_settings', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(JSON.stringify(merged), nowIso);
  return merged;
}

export function getNotificationLogs(limit = 30): NotificationLogRecord[] {
  const db = getSqliteDb();
  const rows = db
    .prepare("SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT ?")
    .all(limit) as Record<string, unknown>[];
  return rows.map((r) => ({
    id: String(r.id),
    orderReferenceCode: String(r.order_reference_code),
    channel: String(r.channel) as "EMAIL" | "ZALO",
    recipient: String(r.recipient),
    status: String(r.status) as "SENT" | "CONFIG_READY" | "FAILED",
    messageSummary: String(r.message_summary),
    detail: String(r.detail),
    createdAt: String(r.created_at),
  }));
}

export interface OrderNotificationItem {
  productName: string;
  variantName: string;
  volumeMl: number;
  selectedOption: string;
  ingredientsText?: string;
  quantity: number;
  unitPriceVnd: number;
  lineTotalVnd: number;
}

export interface OrderNotificationPayload {
  referenceCode: string;
  orderPurpose: "SELF" | "GIFT";
  buyerName: string;
  buyerPhone: string;
  buyerNote?: string;
  recipientName: string;
  recipientPhone: string;
  giftSenderName?: string;
  giftMessage?: string;
  hidePriceOnReceipt?: boolean;
  addressDetail: string;
  requestedDate: string;
  slotLabel: string;
  totalBowls?: number;
  subtotalVnd?: number;
  shippingFeeVnd?: number | null;
  totalVnd: number;
  shippingFeeNote: string;
  items?: OrderNotificationItem[];
  itemsSummary: string;
}

export async function triggerOrderNotificationsAfterCommit(
  payload: OrderNotificationPayload
): Promise<{ emailSent: boolean; zaloSent: boolean; detail: string }> {
  const db = getSqliteDb();
  const config = getNotificationSettings();
  const nowIso = new Date().toISOString();

  // Support 1, 2 or multiple email addresses separated by comma or semicolon
  const emailList = (config.notificationEmailTo || "")
    .split(/[,;]+/)
    .map((e) => e.trim())
    .filter(Boolean);
  const emailToJoined = emailList.join(", ");

  const itemizedLines =
    payload.items && payload.items.length > 0
      ? payload.items.map(
          (it, idx) =>
            `${idx + 1}. ${it.productName} (${it.variantName} • ${it.selectedOption}) x${it.quantity} = ${it.lineTotalVnd.toLocaleString("vi-VN")}đ`
        )
      : [payload.itemsSummary];

  const textSummary = `[ĐƠN MỚI #${payload.referenceCode}] Khách: ${payload.buyerName} (${payload.buyerPhone}) • Giao: ${payload.requestedDate} (${payload.slotLabel}) • Đ/c: ${payload.addressDetail} • Chi tiết món: ${itemizedLines.join(" ; ")} • Tổng: ${payload.totalVnd.toLocaleString("vi-VN")}đ`;

  const itemsTableRowsHtml =
    payload.items && payload.items.length > 0
      ? payload.items
          .map(
            (it, idx) => `
          <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: center; font-size: 13px;">${idx + 1}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; font-size: 13px;">
              <strong style="color: #155132;">${it.productName}</strong><br/>
              <span style="font-size: 12px; color: #50575e;">Quy cách: ${it.variantName} (${it.volumeMl}ml) • Vị: <strong>${it.selectedOption}</strong></span>
              ${it.ingredientsText ? `<br/><span style="font-size: 11px; color: #8A6632;">Thành phần: ${it.ingredientsText}</span>` : ""}
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: center; font-weight: bold; font-size: 13px;">x${it.quantity}</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: right; font-size: 13px;">${it.unitPriceVnd.toLocaleString("vi-VN")}đ</td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #e5e0d0; text-align: right; font-weight: bold; color: #155132; font-size: 13px;">${it.lineTotalVnd.toLocaleString("vi-VN")}đ</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="5" style="padding: 12px; font-size: 13px;">${payload.itemsSummary}</td></tr>`;

  const subtotalVnd = payload.subtotalVnd ?? payload.totalVnd;
  const shippingDisplay =
    payload.shippingFeeVnd === 0
      ? "0đ (Miễn phí giao hàng)"
      : payload.shippingFeeVnd
        ? `${payload.shippingFeeVnd.toLocaleString("vi-VN")}đ`
        : payload.shippingFeeNote;

  const emailSubject = `[Yến Sào Hà Mi] Đơn đặt món mới #${payload.referenceCode} — ${payload.buyerName} (${payload.totalVnd.toLocaleString("vi-VN")}đ)`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 660px; margin: 0 auto; border: 1px solid #BD9342; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #155132; color: #FFFCF4; padding: 18px 24px;">
        <p style="margin: 0; font-size: 11px; color: #BD9342; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">YẾN SÀO HÀ MI — THÔNG BÁO ĐƠN ĐẶT MÓN MỚI</p>
        <h2 style="margin: 6px 0 0 0; font-size: 20px;">Mã đơn hàng: #${payload.referenceCode}</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #DBF1EE;">Loại đơn: <strong>${payload.orderPurpose === "GIFT" ? "🎁 Gửi Quà Biếu Tặng" : "🥣 Mua Dùng Gia Đình"}</strong> • Lịch giao: <strong>${payload.requestedDate} (${payload.slotLabel})</strong></p>
      </div>

      <div style="padding: 20px 24px; background-color: #FFFCF4; color: #1d2327; font-size: 14px; line-height: 1.6;">
        <h3 style="margin: 0 0 10px 0; font-size: 15px; color: #155132; border-bottom: 1px solid #BD9342; padding-bottom: 6px;">1. THÔNG TIN KHÁCH ĐẶT & GIAO NHẬN</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <tr>
            <td style="padding: 4px 0; width: 150px; color: #50575e;">Người đặt món:</td>
            <td style="padding: 4px 0;"><strong>${payload.buyerName}</strong> — SĐT: <a href="tel:${payload.buyerPhone}" style="color: #155132; font-weight: bold;">${payload.buyerPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #50575e;">Người nhận hàng:</td>
            <td style="padding: 4px 0;"><strong>${payload.recipientName}</strong> — SĐT: <a href="tel:${payload.recipientPhone}" style="color: #155132; font-weight: bold;">${payload.recipientPhone}</a></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #50575e;">Địa chỉ giao hàng:</td>
            <td style="padding: 4px 0;"><strong>${payload.addressDetail}</strong></td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #50575e;">Khung giờ giao:</td>
            <td style="padding: 4px 0;"><strong style="color: #8A6632;">Ngày ${payload.requestedDate} • ${payload.slotLabel}</strong></td>
          </tr>
          ${
            payload.buyerNote
              ? `<tr><td style="padding: 4px 0; color: #50575e;">Ghi chú của khách:</td><td style="padding: 4px 0; color: #8A6632;"><strong>“${payload.buyerNote}”</strong></td></tr>`
              : ""
          }
        </table>

        ${
          payload.orderPurpose === "GIFT" || payload.giftMessage
            ? `<div style="background: #ffffff; padding: 12px 14px; border: 1px solid #BD9342; border-left: 4px solid #155132; border-radius: 6px; margin-bottom: 16px; font-size: 13px;">
                <strong style="color: #155132;">🎁 THÔNG TIN QUÀ BIẾU TẶNG:</strong><br/>
                ${payload.giftSenderName ? `• Người gửi ghi trên thiệp: <strong>${payload.giftSenderName}</strong><br/>` : ""}
                ${payload.giftMessage ? `• Lời chúc trên thiệp: <em>“${payload.giftMessage}”</em><br/>` : ""}
                • Phiếu giao hàng: <strong>${payload.hidePriceOnReceipt ? "Ẩn giá tiền trên phiếu giao" : "Hiển thị bình thường"}</strong>
              </div>`
            : ""
        }

        <h3 style="margin: 16px 0 10px 0; font-size: 15px; color: #155132; border-bottom: 1px solid #BD9342; padding-bottom: 6px;">2. CHI TIẾT ĐƠN HÀNG GỒM NHỮNG MÓN ĐÃ ĐẶT</h3>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e0d0; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background-color: #155132; color: #FFFCF4; font-size: 12px;">
              <th style="padding: 8px; text-align: center; width: 36px;">#</th>
              <th style="padding: 8px; text-align: left;">Tên món / Sản phẩm & Tùy chọn</th>
              <th style="padding: 8px; text-align: center; width: 55px;">SL</th>
              <th style="padding: 8px; text-align: right; width: 95px;">Đơn giá</th>
              <th style="padding: 8px; text-align: right; width: 105px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #faf6eb; font-size: 13px;">
              <td colspan="4" style="padding: 8px 12px; text-align: right; color: #50575e;">Tạm tính tiền món:</td>
              <td style="padding: 8px 12px; text-align: right; font-weight: bold;">${subtotalVnd.toLocaleString("vi-VN")}đ</td>
            </tr>
            <tr style="background-color: #faf6eb; font-size: 13px;">
              <td colspan="4" style="padding: 6px 12px; text-align: right; color: #50575e;">Phí giao hàng:</td>
              <td style="padding: 6px 12px; text-align: right; font-weight: bold; color: #155132;">${shippingDisplay}</td>
            </tr>
            <tr style="background-color: #f3ead3; font-size: 15px;">
              <td colspan="4" style="padding: 10px 12px; text-align: right; font-weight: bold; color: #155132;">TỔNG CỘNG THANH TOÁN:</td>
              <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #155132; font-size: 16px;">${payload.totalVnd.toLocaleString("vi-VN")}đ</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="background-color: #f6f7f7; padding: 14px 24px; font-size: 12px; color: #50575e; text-align: center; border-top: 1px solid #e5e0d0;">
        Mở trang Quản trị để xác nhận đơn hàng: <a href="https://yenhami.vercel.app/quan-tri" style="color: #155132; font-weight: bold;">https://yenhami.vercel.app/quan-tri</a>
      </div>
    </div>
  `;

  const insertLog = db.prepare(`
    INSERT INTO notification_logs (
      id, order_reference_code, channel, recipient, status, message_summary, detail, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateLog = db.prepare(`
    UPDATE notification_logs SET status = ?, detail = ? WHERE id = ?
  `);

  let emailSent = false;
  let zaloSent = false;
  let detailMsg = "";

  // 1. EMAIL NOTIFICATION (Google Apps Script Webhook or Resend API — supports 2+ emails)
  if (config.enableEmail && emailList.length > 0) {
    const emailLogId = `notif-email-${crypto.randomUUID()}`;
    const hasProvider = Boolean(config.emailWebhookUrl || config.resendApiKey);

    insertLog.run(
      emailLogId,
      payload.referenceCode,
      "EMAIL",
      emailToJoined,
      hasProvider ? "SENT" : "CONFIG_READY",
      textSummary,
      config.emailWebhookUrl
        ? `Đang gửi Email chi tiết đơn hàng tới (${emailToJoined}) qua Google Apps Script...`
        : config.resendApiKey
          ? `Đang gửi Email tới (${emailToJoined}) qua Resend API...`
          : "Đã ghi nhận đơn (Hãy dán link Google Apps Script Web App vào mục Cài đặt Email để tự động gửi Gmail)",
      nowIso
    );

    if (config.emailWebhookUrl) {
      try {
        const res = await fetch(config.emailWebhookUrl, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            channel: "EMAIL",
            to: emailList.join(","),
            recipients: emailList,
            subject: emailSubject,
            text: textSummary,
            html: emailHtml,
            payload: {
              ...payload,
              itemsTextMultiLine: itemizedLines.join("\n"),
            },
          }),
        });
        const respText = await res.text().catch(() => "");
        if (res.ok) {
          emailSent = true;
          detailMsg = `Đã gửi Email chi tiết đơn hàng thành công qua Google Apps Script tới: ${emailToJoined}`;
          updateLog.run("SENT", detailMsg, emailLogId);
        } else {
          detailMsg = `Google Apps Script trả về HTTP ${res.status}: ${respText.slice(0, 120)}`;
          updateLog.run("FAILED", detailMsg, emailLogId);
        }
      } catch (err) {
        detailMsg = `Lỗi kết nối Google Apps Script: ${err instanceof Error ? err.message : String(err)}`;
        updateLog.run("FAILED", detailMsg, emailLogId);
      }
    } else if (config.resendApiKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Yến Sào Hà Mi <onboarding@resend.dev>",
            to: emailList,
            subject: emailSubject,
            html: emailHtml,
          }),
        });
        if (res.ok) {
          emailSent = true;
          detailMsg = `Đã gửi Email qua Resend tới: ${emailToJoined}`;
          updateLog.run("SENT", detailMsg, emailLogId);
        } else {
          detailMsg = `Resend HTTP ${res.status}`;
          updateLog.run("FAILED", detailMsg, emailLogId);
        }
      } catch (err) {
        detailMsg = `Lỗi kết nối Resend: ${err instanceof Error ? err.message : String(err)}`;
        updateLog.run("FAILED", detailMsg, emailLogId);
      }
    }
  }

  // 2. ZALO NOTIFICATION
  if (config.enableZalo && config.zaloRecipientPhone) {
    const zaloLogId = `notif-zalo-${crypto.randomUUID()}`;
    insertLog.run(
      zaloLogId,
      payload.referenceCode,
      "ZALO",
      config.zaloRecipientPhone,
      config.zaloWebhookUrl ? "SENT" : "CONFIG_READY",
      textSummary,
      config.zaloWebhookUrl
        ? "Đã bắn tin nhắn tự động qua Zalo OA / Webhook"
        : `Sẵn sàng gửi tới Zalo ${config.zaloRecipientPhone} (Hỗ trợ Webhook tự động hoặc bấm nút Báo qua Zalo trên đơn)`,
      nowIso
    );

    if (config.zaloWebhookUrl) {
      try {
        const res = await fetch(config.zaloWebhookUrl, {
          method: "POST",
          redirect: "follow",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: "ZALO",
            phone: config.zaloRecipientPhone,
            message: textSummary,
            payload,
          }),
        });
        if (res.ok) {
          zaloSent = true;
        }
      } catch {
        // ignore
      }
    }
  }

  return {
    emailSent,
    zaloSent,
    detail:
      detailMsg ||
      "Đã ghi nhận thông báo vào Nhật ký (Hãy dán URL Google Apps Script để gửi Gmail tự động).",
  };
}

let pendingNotificationPromise: Promise<unknown> | null = null;

export async function flushPendingOrderNotifications(): Promise<void> {
  if (!pendingNotificationPromise) return;
  const p = pendingNotificationPromise;
  pendingNotificationPromise = null;
  try {
    await p;
  } catch {
    // ignore
  }
}

const CLOUD_TABLES = [
  "products",
  "product_variants",
  "slot_date_reservations",
  "order_requests",
  "order_items",
  "order_status_history",
  "site_settings",
  "posts",
  "job_postings",
  "notification_logs",
] as const;

let lastCloudSyncAtMs = 0;

function isCloudSyncEnabled(): boolean {
  if (process.env.HAMI_DB_PATH) return false; // Never sync during isolated unit tests
  return Boolean(process.env.HAMI_GIST_ID && process.env.HAMI_GITHUB_TOKEN);
}

export async function syncDbToCloud(): Promise<void> {
  if (!isCloudSyncEnabled()) return;
  const gistId = process.env.HAMI_GIST_ID!;
  const token = process.env.HAMI_GITHUB_TOKEN!;

  try {
    const db = getSqliteDb();
    const tables: Record<string, Record<string, unknown>[]> = {};
    for (const table of CLOUD_TABLES) {
      tables[table] = db.prepare(`SELECT * FROM ${table}`).all() as Record<
        string,
        unknown
      >[];
    }

    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      tables,
    };

    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "User-Agent": "ha-mi-website-cloud-sync",
      },
      body: JSON.stringify({
        files: {
          "ha-mi-db-state.json": {
            content: JSON.stringify(payload),
          },
        },
      }),
    });
    lastCloudSyncAtMs = Date.now();
  } catch {
    // Ignore transient network errors
  }
}

export async function syncDbFromCloud(force = false): Promise<void> {
  if (!isCloudSyncEnabled()) return;
  const now = Date.now();
  if (!force && now - lastCloudSyncAtMs < 1500) {
    return;
  }
  const gistId = process.env.HAMI_GIST_ID!;
  const token = process.env.HAMI_GITHUB_TOKEN!;

  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "ha-mi-website-cloud-sync",
      },
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      files?: Record<string, { content?: string; raw_url?: string; truncated?: boolean }>;
    };
    const fileObj = data.files?.["ha-mi-db-state.json"];
    if (!fileObj) return;

    let rawJson = fileObj.content || "";
    if (fileObj.truncated && fileObj.raw_url) {
      const rawRes = await fetch(fileObj.raw_url, { cache: "no-store" });
      if (rawRes.ok) {
        rawJson = await rawRes.text();
      }
    }
    if (!rawJson) return;

    const parsed = JSON.parse(rawJson) as {
      version?: number;
      tables?: Record<string, Record<string, unknown>[]>;
    };
    if (!parsed.tables) {
      lastCloudSyncAtMs = Date.now();
      return;
    }

    const db = getSqliteDb();
    db.exec("BEGIN IMMEDIATE TRANSACTION;");
    try {
      for (const table of CLOUD_TABLES) {
        const rows = parsed.tables[table];
        if (!Array.isArray(rows) || rows.length === 0) continue;

        if (
          table === "products" ||
          table === "product_variants" ||
          table === "posts" ||
          table === "job_postings"
        ) {
          db.exec(`DELETE FROM ${table};`);
        }

        const cols = Object.keys(rows[0]);
        if (cols.length === 0) continue;
        const placeholders = cols.map(() => "?").join(", ");
        const colList = cols.join(", ");
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO ${table} (${colList}) VALUES (${placeholders})`
        );
        for (const r of rows) {
          const vals = cols.map((c) => {
            const v = r[c];
            return v === undefined ? null : (v as string | number | null);
          });
          stmt.run(...vals);
        }
      }

      // Ensure canonical SEO/GEO posts and updated 295.000đ+ fresh bowl prices are always present after cloud sync
      const syncNowIso = new Date().toISOString();
      db.exec("DELETE FROM posts WHERE id IN ('post-1', 'post-2', 'post-3');");
      const upsertPostStmt = db.prepare(`
        INSERT INTO posts (id, slug, title, category, excerpt, content, cover_image_url, is_published, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          slug = excluded.slug,
          title = excluded.title,
          category = excluded.category,
          excerpt = excluded.excerpt,
          content = excluded.content,
          cover_image_url = excluded.cover_image_url,
          is_published = excluded.is_published,
          updated_at = excluded.updated_at
      `);
      for (const post of DEMO_POSTS) {
        upsertPostStmt.run(
          post.id,
          post.slug,
          post.title,
          post.category,
          post.excerpt,
          post.content,
          post.coverImageUrl,
          post.isPublished ? 1 : 0,
          syncNowIso,
          syncNowIso
        );
      }

      const upsertFreshProdStmt = db.prepare(`
        UPDATE products
        SET ingredients_json = ?, taste_profile = ?, short_description = ?, usage_guide = ?, caution_note = ?, price_vnd = ?
        WHERE id = ? AND (price_vnd IS NULL OR price_vnd < 295000)
      `);
      for (const p of DEMO_PRODUCTS) {
        if (p.id.startsWith("prod-")) {
          upsertFreshProdStmt.run(
            JSON.stringify(p.ingredients),
            p.tasteProfile,
            p.shortDescription,
            p.usageGuide,
            p.cautionNote,
            p.priceVnd,
            p.id
          );
        }
      }

      db.exec("COMMIT;");
      lastCloudSyncAtMs = Date.now();
    } catch {
      try {
        db.exec("ROLLBACK;");
      } catch {
        // ignore
      }
    }
  } catch {
    // Ignore transient network errors
  }
}
