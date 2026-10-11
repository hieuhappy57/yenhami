import { NextResponse } from "next/server";
import {
  syncDbFromCloud,
  syncDbToCloud,
  updateDeliverySlotByStaff,
  updateProductStatusByStaff,
} from "@/db";
import type { ProductStatus } from "@/db/schema";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { getAuthenticatedStaff, guardMutationOrigin, privateJsonHeaders, staffCan } from "@/lib/staff-auth";

const PRODUCT_STATUSES: ProductStatus[] = ["AVAILABLE", "OUT_OF_STOCK", "PENDING_DATA_APPROVAL"];

async function readBody(request: Request) {
  const limit = 32 * 1024;
  if (Number(request.headers.get("content-length") || 0) > limit) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text) > limit) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text) as Record<string, unknown>;
}

export async function PATCH(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }
  if (!staffCan(staff, "catalog.commercial.write")) {
    return NextResponse.json({ ok: false, errorMessage: "Không có quyền sửa giá hoặc tình trạng bán." }, { status: 403, headers: privateJsonHeaders() });
  }
  if (!guardMutationOrigin(request)) {
    return NextResponse.json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, { status: 403, headers: privateJsonHeaders() });
  }

  try {
    const body = await readBody(request);
    if (body.type === "product") {
      const productId = String(body.productId || "");
      const status = String(body.status || "AVAILABLE") as ProductStatus;
      const priceVnd =
        body.priceVnd === null || body.priceVnd === "" || body.priceVnd === undefined
          ? null
          : Number(body.priceVnd);
      if (!productId || !PRODUCT_STATUSES.includes(status) || (priceVnd !== null && (!Number.isSafeInteger(priceVnd) || priceVnd < 0))) {
        return NextResponse.json({ ok: false, errorMessage: "Dữ liệu sản phẩm không hợp lệ." }, { status: 422, headers: privateJsonHeaders() });
      }

      const res = await withAuthoritativeMutation(async () => {
        await syncDbFromCloud(true);
        const updated = updateProductStatusByStaff({ productId, status, priceVnd });
        await syncDbToCloud();
        return updated;
      });
      return NextResponse.json(res, { headers: privateJsonHeaders() });
    }

    if (body.type === "slot") {
      const slotId = String(body.slotId || "");
      const maxCapacityBowls = Number(body.maxCapacityBowls);
      const reservedBowls = Number(body.reservedBowls);
      const isActive = Boolean(body.isActive);
      if (!slotId || !Number.isSafeInteger(maxCapacityBowls) || maxCapacityBowls < 0 || !Number.isSafeInteger(reservedBowls) || reservedBowls < 0 || reservedBowls > maxCapacityBowls || typeof body.isActive !== "boolean") {
        return NextResponse.json({ ok: false, errorMessage: "Dữ liệu sức chứa không hợp lệ." }, { status: 422, headers: privateJsonHeaders() });
      }

      const res = await withAuthoritativeMutation(async () => {
        await syncDbFromCloud(true);
        const updated = updateDeliverySlotByStaff({ slotId, maxCapacityBowls, reservedBowls, isActive });
        await syncDbToCloud();
        return updated;
      });
      return NextResponse.json(res, { headers: privateJsonHeaders() });
    }

    return NextResponse.json({ ok: false, errorMessage: "Loại cập nhật không hợp lệ." }, { status: 400 });
  } catch (error) {
    const status = typeof error === "object" && error && "status" in error && error.status === 503 ? 503 : error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : 400;
    return NextResponse.json(
      { ok: false, errorMessage: status === 503 ? "Kho dữ liệu dùng chung chưa sẵn sàng." : status === 413 ? "Dữ liệu quá lớn." : "Không thể cập nhật cấu hình menu/lịch." },
      { status, headers: privateJsonHeaders() }
    );
  }
}
