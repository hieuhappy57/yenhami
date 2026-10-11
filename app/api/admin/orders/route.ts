import { NextResponse } from "next/server";
import { listAllOrderRequestsForStaff, recordPaymentEntryByStaff, submitOrderRequest, syncDbFromCloud, syncDbToCloud, updateOrderStatusByStaff } from "@/db";
import type { OrderSource, OrderStatus, PaymentMethod } from "@/db/schema";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { getAuthenticatedStaff, guardMutationOrigin, staffCan } from "@/lib/staff-auth";
import { privateJsonHeaders, readBoundedJson } from "@/lib/staff-access";
import { ensureOrderNotificationOutbox, flushOrderNotificationOutbox } from "@/db/order-outbox";

const ORDER_STATUSES: OrderStatus[] = ["PENDING_CONFIRMATION", "CONFIRMED", "PREPARING", "DELIVERING", "COMPLETED", "CANCELLED"];
const SOURCES: OrderSource[] = ["WEBSITE", "ZALO", "MESSENGER", "PHONE", "STORE", "OTHER"];
const METHODS: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "OTHER"];
const respond = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateJsonHeaders() });
const fail = (message: string, status: number, code?: string) => respond({ ok: false, errorCode: code, errorMessage: message }, status);

export async function GET(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) return fail("Yêu cầu đăng nhập nhân viên.", 401);
  if (!staffCan(staff, "orders.read")) return fail("Bạn không có quyền xem đơn hàng.", 403);
  await syncDbFromCloud(true);
  const orders = listAllOrderRequestsForStaff();
  const kitchenOnly = staff.roles.every((role) => role === "KITCHEN");
  return respond({ ok: true, staff, orders: kitchenOnly ? orders.map((o) => ({
    id: o.id, referenceCode: o.referenceCode, requestedDate: o.requestedDate,
    slotId: o.slotId, slotLabelSnapshot: o.slotLabelSnapshot, orderStatus: o.orderStatus,
    rowVersion: o.rowVersion, createdAt: o.createdAt, updatedAt: o.updatedAt,
    items: o.items.map((item) => ({
      id: item.id, productId: item.productId, variantId: item.variantId,
      productNameSnapshot: item.productNameSnapshot, variantNameSnapshot: item.variantNameSnapshot,
      volumeMlSnapshot: item.volumeMlSnapshot, ingredientsSnapshot: item.ingredientsSnapshot,
      selectedOptionSnapshot: item.selectedOptionSnapshot, quantity: item.quantity,
    })),
  })) : orders });
}

export async function PATCH(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) return fail("Yêu cầu đăng nhập nhân viên.", 401);
  if (!guardMutationOrigin(request)) return fail("Nguồn yêu cầu không hợp lệ.", 403, "INVALID_ORIGIN");
  try {
    const body = await readBoundedJson(request, 64 * 1024);
    const action = String(body.action || "");
    const referenceCode = String(body.referenceCode || "").trim().toUpperCase();
    const expectedVersion = Number(body.expectedVersion);
    if (!referenceCode || !Number.isSafeInteger(expectedVersion) || expectedVersion < 1) return fail("Mã đơn hoặc phiên bản không hợp lệ.", 400, "VALIDATION_ERROR");
    const result = await withAuthoritativeMutation(async () => {
      await syncDbFromCloud(true);
      if (action === "status") {
        const newOrderStatus = String(body.newOrderStatus || "") as OrderStatus;
        if (!ORDER_STATUSES.includes(newOrderStatus)) return { ok: false, errorCode: "INVALID_STATUS", errorMessage: "Trạng thái đơn không hợp lệ." };
        const kitchenStep = staffCan(staff, "orders.prepare") && newOrderStatus === "PREPARING";
        if (!staffCan(staff, "orders.write") && !kitchenStep) return { ok: false, forbidden: true, errorMessage: "Bạn không có quyền cập nhật trạng thái này." };
        const updated = updateOrderStatusByStaff({ referenceCode, newOrderStatus, expectedVersion, staffUsername: staff.username, staffDisplayName: staff.displayName, note: String(body.note || "").trim() });
        if (updated.ok) await syncDbToCloud();
        return updated;
      }
      if (action === "collection" || action === "refund") {
        const capability = action === "collection" ? "payments.collect" : "payments.refund";
        if (!staffCan(staff, capability)) return { ok: false, forbidden: true, errorMessage: "Bạn không có quyền ghi nhận giao dịch này." };
        const method = String(body.method || "") as PaymentMethod;
        if (!METHODS.includes(method)) return { ok: false, errorCode: "INVALID_PAYMENT_METHOD", errorMessage: "Phương thức thanh toán không hợp lệ." };
        const updated = recordPaymentEntryByStaff({ referenceCode, expectedVersion, type: action === "collection" ? "COLLECTION" : "REFUND", amountVnd: Number(body.amountVnd), method, reason: String(body.reason || "").trim(), idempotencyKey: String(body.idempotencyKey || "").trim(), staffUsername: staff.username });
        if (updated.ok && !updated.deduplicated) await syncDbToCloud();
        return updated;
      }
      return { ok: false, errorCode: "INVALID_ACTION", errorMessage: "Thao tác không hợp lệ." };
    });
    return respond(result, result.ok ? 200 : "forbidden" in result ? 403 : result.errorCode === "VERSION_CONFLICT" ? 409 : 400);
  } catch (caught) {
    const status = typeof caught === "object" && caught && "status" in caught ? Number(caught.status) : 500;
    return fail(caught instanceof Error ? caught.message : "Không thể cập nhật đơn.", status);
  }
}

export async function POST(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) return fail("Yêu cầu đăng nhập nhân viên.", 401);
  if (!staffCan(staff, "orders.write")) return fail("Bạn không có quyền tạo đơn.", 403);
  if (!guardMutationOrigin(request)) return fail("Nguồn yêu cầu không hợp lệ.", 403, "INVALID_ORIGIN");
  try {
    const body = await readBoundedJson(request, 64 * 1024);
    const source = String(body.source || "") as OrderSource;
    if (!SOURCES.includes(source)) return fail("Nguồn đơn không hợp lệ.", 400, "INVALID_SOURCE");
    if (source === "OTHER" && !String(body.sourceDetail || "").trim()) return fail("Nguồn OTHER cần mô tả.", 400, "SOURCE_DETAIL_REQUIRED");
    const result = await withAuthoritativeMutation(async () => {
      await syncDbFromCloud(true);
      ensureOrderNotificationOutbox();
      const created = submitOrderRequest({ idempotencyKey: String(body.idempotencyKey || ""), source, sourceDetail: String(body.sourceDetail || "") || undefined, orderPurpose: body.orderPurpose === "GIFT" || body.isGift === true ? "GIFT" : "SELF", buyerName: String(body.buyerName || ""), buyerPhone: String(body.buyerPhone || ""), buyerNote: String(body.buyerNote || "") || undefined, recipientName: String(body.recipientName || "") || undefined, recipientPhone: String(body.recipientPhone || "") || undefined, giftSenderName: String(body.giftSenderName || "") || undefined, giftMessage: String(body.giftMessage || "") || undefined, hidePriceOnReceipt: body.hidePriceOnReceipt === true, zoneId: String(body.zoneId || "") || undefined, addressDetail: String(body.addressDetail || ""), requestedDate: String(body.requestedDate || ""), slotId: String(body.slotId || ""), items: Array.isArray(body.items) ? body.items as { productId: string; variantId?: string; quantity: number }[] : [] });
      if (created.ok) await syncDbToCloud();
      return created;
    });
    if (result.ok && !result.deduplicated) await flushOrderNotificationOutbox({ limit: 1 });
    return respond(result, result.ok ? 200 : 400);
  } catch (caught) {
    const status = typeof caught === "object" && caught && "status" in caught ? Number(caught.status) : 500;
    return fail(caught instanceof Error ? caught.message : "Không thể tạo đơn.", status);
  }
}
