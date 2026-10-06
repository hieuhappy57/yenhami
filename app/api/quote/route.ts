import { NextResponse } from "next/server";
import { calculateServerQuote, syncDbFromCloud } from "@/db";

export async function POST(request: Request) {
  try {
    await syncDbFromCloud();
    const body = await request.json();
    const quote = calculateServerQuote({
      items: body.items || [],
      zoneId: body.zoneId,
      requestedDate: body.requestedDate,
      slotId: body.slotId,
    });
    return NextResponse.json(quote, { status: quote.ok ? 200 : 400 });
  } catch {
    return NextResponse.json(
      { ok: false, errorMessage: "Dữ liệu kiểm tra tạm tính không hợp lệ." },
      { status: 400 }
    );
  }
}
