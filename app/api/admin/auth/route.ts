import { NextResponse } from "next/server";
import { verifyStaffCredentials } from "@/db";
import {
  createStaffSessionToken,
  getAuthenticatedStaff,
  STAFF_COOKIE_NAME,
} from "@/lib/staff-auth";

// In-memory rate limiting & lockout map for failed login attempts
// Key: IP address, Value: { failedAttempts: number; lockoutUntil: number }
const loginAttemptMap = new Map<
  string,
  { failedAttempts: number; lockoutUntil: number }
>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "local";
}

export async function GET() {
  const staff = await getAuthenticatedStaff();
  if (!staff) {
    return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ ok: true, authenticated: true, staff });
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const attemptInfo = loginAttemptMap.get(ip);

    // Check if IP is currently locked out
    if (attemptInfo && attemptInfo.lockoutUntil > now) {
      const remainingMinutes = Math.ceil(
        (attemptInfo.lockoutUntil - now) / 60000
      );
      return NextResponse.json(
        {
          ok: false,
          errorMessage: `Tài khoản đang bị tạm khóa an ninh do nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau ${remainingMinutes} phút.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const username = String(body.username || "");
    const password = String(body.password || "");

    const staff = verifyStaffCredentials(username, password);
    if (!staff) {
      const currentFailures = (attemptInfo?.failedAttempts || 0) + 1;
      const isLockout = currentFailures >= 5;
      loginAttemptMap.set(ip, {
        failedAttempts: currentFailures,
        lockoutUntil: isLockout ? now + 15 * 60 * 1000 : 0, // Lock for 15 minutes on 5 failures
      });

      const remainingAttempts = Math.max(0, 5 - currentFailures);
      return NextResponse.json(
        {
          ok: false,
          errorMessage: isLockout
            ? "Tài khoản đang bị tạm khóa an ninh 15 phút do nhập sai mật khẩu quá 5 lần."
            : `Tên đăng nhập hoặc mật khẩu nhân viên không chính xác. (Còn ${remainingAttempts} lần thử trước khi tạm khóa)`,
        },
        { status: isLockout ? 429 : 401 }
      );
    }

    // Login successful: clear failure history for this IP
    loginAttemptMap.delete(ip);

    const token = createStaffSessionToken(staff);
    const res = NextResponse.json({ ok: true, staff });
    res.cookies.set(STAFF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
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
