import { NextResponse } from "next/server";
import {
  getOrderRequestByReference,
  submitOrderRequest,
  syncDbFromCloud,
} from "@/db";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { readBoundedJson, privateJsonHeaders } from "@/lib/staff-access";
import { ensureOrderNotificationOutbox, flushOrderNotificationOutbox } from "@/db/order-outbox";
import { getAuthenticatedStaff } from "@/lib/staff-auth";

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > 60_000) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= 15) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") || "";
  const token = url.searchParams.get("token") || undefined;

  if (!ref.trim()) {
    return NextResponse.json(
      { ok: false, errorMessage: "Thiếu mã tham chiếu yêu cầu." },
      { status: 400 }
    );
  }

  await syncDbFromCloud(true);

  const staff = await getAuthenticatedStaff(request);
  const order = getOrderRequestByReference({
    referenceCode: ref,
    lookupToken: token,
    isStaff: Boolean(staff),
  });

  if (!order) {
    return NextResponse.json(
      { ok: false, errorMessage: "Không tìm thấy yêu cầu đặt món với mã tham chiếu này." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, order });
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          ok: false,
          errorCode: "RATE_LIMITED",
          errorMessage: "Bạn đang thao tác quá nhanh. Vui lòng đợi ít phút trước khi gửi lại.",
        },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await readBoundedJson(request,64 * 1024);
    } catch {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_BODY", errorMessage: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { ok: false, errorCode: "INVALID_BODY", errorMessage: "Dữ liệu yêu cầu không hợp lệ." },
        { status: 400 }
      );
    }
    const res = await withAuthoritativeMutation(() => {
      ensureOrderNotificationOutbox();
      return submitOrderRequest({...body,source:"WEBSITE",isDemoOrder:false} as any);
    });

    if (res.ok && res.order?.referenceCode) {
      try {
        await withAuthoritativeMutation(() => flushOrderNotificationOutbox({ limit: 1 }));
      } catch (notifErr) {
        console.error("Order notification error:", notifErr);
      }
    }

    return NextResponse.json(res, { status: res.ok ? 200 : 400, headers:privateJsonHeaders() });
  } catch (error) {
    console.error("Order submit exception:", error);
    const unavailable = typeof error === "object" && error && "status" in error && error.status === 503;
    return NextResponse.json(
      {
        ok: false,
        errorCode: unavailable ? "CLOUD_PERSISTENCE_UNAVAILABLE" : "SERVER_ERROR",
        errorMessage: unavailable ? "Chưa xác nhận được việc lưu đơn. Vui lòng thử lại, hệ thống sẽ kiểm tra để tránh trùng đơn." : "Không thể xử lý yêu cầu đặt hàng lúc này. Vui lòng thử lại.",
      },
      { status: unavailable ? 503 : 500, headers:privateJsonHeaders() }
    );
  }
}
