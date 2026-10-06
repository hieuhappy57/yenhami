import { NextResponse } from "next/server";
import {
  syncDbFromCloud,
  syncDbToCloud,
  updateDeliverySlotByStaff,
  updateProductStatusByStaff,
} from "@/db";
import type { ProductStatus } from "@/db/schema";
import { getAuthenticatedStaff } from "@/lib/staff-auth";

export async function PATCH(request: Request) {
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
    if (body.type === "product") {
      const productId = String(body.productId || "");
      const status = String(body.status || "AVAILABLE") as ProductStatus;
      const priceVnd =
        body.priceVnd === null || body.priceVnd === "" || body.priceVnd === undefined
          ? null
          : Number(body.priceVnd);

      const res = updateProductStatusByStaff({ productId, status, priceVnd });
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    if (body.type === "slot") {
      const slotId = String(body.slotId || "");
      const maxCapacityBowls = Number(body.maxCapacityBowls);
      const reservedBowls = Number(body.reservedBowls);
      const isActive = Boolean(body.isActive);

      const res = updateDeliverySlotByStaff({
        slotId,
        maxCapacityBowls,
        reservedBowls,
        isActive,
      });
      await syncDbToCloud();
      return NextResponse.json(res);
    }

    return NextResponse.json({ ok: false, errorMessage: "Loại cập nhật không hợp lệ." }, { status: 400 });
  } catch {
    return NextResponse.json(
      { ok: false, errorMessage: "Không thể cập nhật cấu hình menu/lịch." },
      { status: 400 }
    );
  }
}
