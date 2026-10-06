import { NextResponse } from "next/server";
import { verifyStaffCredentials } from "@/db";
import {
  createStaffSessionToken,
  getAuthenticatedStaff,
  STAFF_COOKIE_NAME,
} from "@/lib/staff-auth";

export async function GET() {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, authenticated: true, staff });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "");
    const password = String(body.password || "");

    const staff = verifyStaffCredentials(username, password);
    if (!staff) {
      return NextResponse.json(
        {
          ok: false,
          errorMessage: "Tên đăng nhập hoặc mật khẩu nhân viên không chính xác.",
        },
        { status: 401 }
      );
    }

    const token = createStaffSessionToken(staff);
    const res = NextResponse.json({ ok: true, staff });
    res.cookies.set(STAFF_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, errorMessage: "Lỗi xác thực đăng nhập." },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(STAFF_COOKIE_NAME);
  return res;
}
