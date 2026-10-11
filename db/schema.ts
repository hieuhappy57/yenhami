import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const productsTable = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  volumeMl: integer("volume_ml").notNull(),
  ingredientsJson: text("ingredients_json").notNull(),
  tasteProfile: text("taste_profile").notNull(),
  shortDescription: text("short_description").notNull(),
  usageGuide: text("usage_guide").notNull(),
  storageGuide: text("storage_guide").notNull(),
  cautionNote: text("caution_note").notNull(),
  imageUrl: text("image_url").notNull(),
  isIllustrationImage: integer("is_illustration_image", { mode: "boolean" }).notNull(),
  priceVnd: integer("price_vnd"),
  status: text("status").notNull(),
  isDemoFixture: integer("is_demo_fixture", { mode: "boolean" }).notNull(),
  supportedOptionsJson: text("supported_options_json").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const productVariantsTable = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  priceDeltaVnd: integer("price_delta_vnd").notNull(),
  isAvailable: integer("is_available", { mode: "boolean" }).notNull(),
});

export const serviceZonesTable = sqliteTable("service_zones", {
  id: text("id").primaryKey(),
  city: text("city").notNull(),
  district: text("district").notNull(),
  wardSample: text("ward_sample").notNull(),
  deliveryStatus: text("delivery_status").notNull(),
  shippingFeeVnd: integer("shipping_fee_vnd"),
  leadTimeMinutes: integer("lead_time_minutes").notNull(),
  note: text("note").notNull(),
  isDemoFixture: integer("is_demo_fixture", { mode: "boolean" }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const deliverySlotsTable = sqliteTable("delivery_slots", {
  id: text("id").primaryKey(),
  slotCode: text("slot_code").notNull().unique(),
  label: text("label").notNull(),
  timeWindow: text("time_window").notNull(),
  startMinutesOfDay: integer("start_minutes_of_day").notNull(),
  maxCapacityBowls: integer("max_capacity_bowls").notNull(),
  reservedBowls: integer("reserved_bowls").notNull(),
  minLeadMinutes: integer("min_lead_minutes").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const slotDateReservationsTable = sqliteTable("slot_date_reservations", {
  requestedDate: text("requested_date").notNull(),
  slotId: text("slot_id").notNull(),
  reservedBowls: integer("reserved_bowls").notNull(),
});

export const orderRequestsTable = sqliteTable("order_requests", {
  id: text("id").primaryKey(),
  referenceCode: text("reference_code").notNull().unique(),
  lookupToken: text("lookup_token").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  orderPurpose: text("order_purpose").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone").notNull(),
  buyerNote: text("buyer_note"),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone").notNull(),
  giftSenderName: text("gift_sender_name"),
  giftMessage: text("gift_message"),
  hidePriceOnReceipt: integer("hide_price_on_receipt", { mode: "boolean" }).notNull(),
  zoneId: text("zone_id").notNull(),
  zoneNameSnapshot: text("zone_name_snapshot").notNull(),
  addressDetail: text("address_detail").notNull(),
  requestedDate: text("requested_date").notNull(),
  slotId: text("slot_id").notNull(),
  slotLabelSnapshot: text("slot_label_snapshot").notNull(),
  subtotalVnd: integer("subtotal_vnd").notNull(),
  shippingFeeVnd: integer("shipping_fee_vnd"),
  shippingFeeNote: text("shipping_fee_note").notNull(),
  totalVnd: integer("total_vnd").notNull(),
  isTotalFinal: integer("is_total_final", { mode: "boolean" }).notNull(),
  orderStatus: text("order_status").notNull(),
  paymentStatus: text("payment_status").notNull(),
  source: text("source").notNull(),
  sourceDetail: text("source_detail"),
  rowVersion: integer("row_version").notNull(),
  completedAt: text("completed_at"),
  isDemoOrder: integer("is_demo_order", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const paymentEntriesTable = sqliteTable("payment_entries", {
  id: text("id").primaryKey(),
  orderRequestId: text("order_request_id").notNull(),
  type: text("type").notNull(),
  amountVnd: integer("amount_vnd").notNull(),
  method: text("method").notNull(),
  occurredAt: text("occurred_at").notNull(),
  recordedAt: text("recorded_at").notNull(),
  staffUsername: text("staff_username").notNull(),
  reason: text("reason"),
  idempotencyKey: text("idempotency_key").notNull().unique(),
});

export const orderItemsTable = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderRequestId: text("order_request_id").notNull(),
  productId: text("product_id").notNull(),
  variantId: text("variant_id").notNull(),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  variantNameSnapshot: text("variant_name_snapshot").notNull(),
  volumeMlSnapshot: integer("volume_ml_snapshot").notNull(),
  ingredientsSnapshot: text("ingredients_snapshot").notNull(),
  selectedOptionSnapshot: text("selected_option_snapshot").notNull(),
  unitPriceSnapshot: integer("unit_price_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalSnapshot: integer("line_total_snapshot").notNull(),
});

export const staffUsersTable = sqliteTable("staff_users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull(),
});

export const orderStatusHistoryTable = sqliteTable("order_status_history", {
  id: text("id").primaryKey(),
  orderRequestId: text("order_request_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  fromPaymentStatus: text("from_payment_status"),
  toPaymentStatus: text("to_payment_status").notNull(),
  changedByStaffUsername: text("changed_by_staff_username").notNull(),
  changedByStaffName: text("changed_by_staff_name").notNull(),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull(),
});

export type ProductStatus = "AVAILABLE" | "OUT_OF_STOCK" | "PENDING_DATA_APPROVAL";
export type ProductCategory = "nguyen-ban" | "ngot-diu" | "nhieu-tang";
export type ZoneDeliveryStatus = "SUPPORTED" | "FEE_PENDING_CONFIRMATION" | "OUT_OF_ZONE";
export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PREPARING"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";
export type OrderSource = "WEBSITE" | "ZALO" | "MESSENGER" | "PHONE" | "STORE" | "OTHER" | "UNKNOWN";
export type PaymentEntryType = "COLLECTION" | "REFUND";
export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "OTHER";

export interface ProductRecord {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  volumeMl: number;
  ingredients: string[];
  tasteProfile: string;
  shortDescription: string;
  usageGuide: string;
  storageGuide: string;
  cautionNote: string;
  imageUrl: string;
  isIllustrationImage: boolean;
  priceVnd: number | null;
  status: ProductStatus;
  isDemoFixture: boolean;
  supportedOptions: string[];
  sortOrder: number;
  variants: ProductVariantRecord[];
}

export interface ProductVariantRecord {
  id: string;
  productId: string;
  name: string;
  priceDeltaVnd: number;
  isAvailable: boolean;
}

export interface ServiceZoneRecord {
  id: string;
  city: string;
  district: string;
  wardSample: string;
  deliveryStatus: ZoneDeliveryStatus;
  shippingFeeVnd: number | null;
  leadTimeMinutes: number;
  note: string;
  isDemoFixture: boolean;
  sortOrder: number;
}

export interface DeliverySlotRecord {
  id: string;
  slotCode: string;
  label: string;
  timeWindow: string;
  startMinutesOfDay: number;
  maxCapacityBowls: number;
  reservedBowls: number;
  remainingBowls: number;
  minLeadMinutes: number;
  isActive: boolean;
  isPastOrInsufficientLead?: boolean;
  unavailableReason?: string | null;
  sortOrder: number;
}

export interface SiteContentSettings {
  heroBadge: string;
  heroTitle: string;
  heroLead: string;
  heroCta: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  giftingBadge: string;
  giftingTitle: string;
  giftingDescription: string;
  giftingImage: string;
  hotlineDisplay: string;
  hotlineTel: string;
  zaloUrl: string;
  addressDisplay: string;
  serviceHoursDisplay: string;
  noticeBanner: string;
  aboutHeadline: string;
  aboutLead: string;
  aboutDiffBanner: string;
}

export interface PostRecord {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt?: string;
  isPublished: boolean;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobPostingRecord {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  description: string;
  requirements: string;
  contactInfo: string;
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  enableEmail: boolean;
  notificationEmailTo: string;
  resendApiKey: string;
  emailWebhookUrl: string;
  enableZalo: boolean;
  zaloRecipientPhone: string;
  zaloWebhookUrl: string;
}

export interface NotificationLogRecord {
  id: string;
  orderReferenceCode: string;
  channel: "EMAIL" | "ZALO";
  recipient: string;
  status: "PENDING" | "SENT" | "CONFIG_READY" | "FAILED";
  messageSummary: string;
  detail: string;
  createdAt: string;
}

