import { NextResponse } from "next/server";
import {
  flushPendingOrderNotifications,
  getOrderRequestByReference,
  submitOrderRequest,
  syncDbFromCloud,
  syncDbToCloud,
} from "@/db";
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

  const staff = await getAuthenticatedStaff();
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

    await syncDbFromCloud(true);

    const body = await request.json();
    const res = submitOrderRequest(body);

    if (res.ok) {
      await flushPendingOrderNotifications();
      await syncDbToCloud();
    }

    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "SERVER_ERROR",
        errorMessage: "Không thể xử lý yêu cầu đặt hàng lúc này. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}
