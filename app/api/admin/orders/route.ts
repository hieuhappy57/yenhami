import { NextResponse } from "next/server";
import { listAllOrderRequestsForStaff, updateOrderStatusByStaff } from "@/db";
import type { OrderStatus, PaymentStatus } from "@/db/schema";
import { getAuthenticatedStaff } from "@/lib/staff-auth";

const VALID_ORDER_STATUSES: OrderStatus[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PREPARING",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["UNPAID", "PAID", "REFUNDED"];

export async function GET() {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }
  const orders = listAllOrderRequestsForStaff();
  return NextResponse.json({ ok: true, staff, orders });
}

export async function PATCH(request: Request) {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json(
      { ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const referenceCode = String(body.referenceCode || "").trim();
    const newOrderStatus = String(body.newOrderStatus || "") as OrderStatus;
    const newPaymentStatus = String(body.newPaymentStatus || "") as PaymentStatus;
    const note = String(body.note || "").trim();
    const confirmedShippingFeeVnd =
      body.confirmedShippingFeeVnd === undefined || body.confirmedShippingFeeVnd === ""
        ? undefined
        : Number(body.confirmedShippingFeeVnd);

    if (!referenceCode || !VALID_ORDER_STATUSES.includes(newOrderStatus)) {
      return NextResponse.json(
        { ok: false, errorMessage: "Trạng thái đơn không hợp lệ." },
        { status: 400 }
      );
    }

    if (!VALID_PAYMENT_STATUSES.includes(newPaymentStatus)) {
      return NextResponse.json(
        { ok: false, errorMessage: "Trạng thái thanh toán không hợp lệ." },
        { status: 400 }
      );
    }

    const updated = updateOrderStatusByStaff({
      referenceCode,
      newOrderStatus,
      newPaymentStatus,
      staffUsername: staff.username,
      staffDisplayName: staff.displayName,
      note,
      confirmedShippingFeeVnd,
    });

    return NextResponse.json(updated, { status: updated.ok ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { ok: false, errorMessage: "Không thể cập nhật trạng thái đơn." },
      { status: 400 }
    );
  }
}
