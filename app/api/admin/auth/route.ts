import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authenticateStaff, bootstrapOwnerFromEnvironment, clearLoginFailures, consumeLoginAttempt, createStaffSession, recordLoginFailure, revokeStaffSession } from "@/db/staff-repository";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { getAuthenticatedStaff, guardMutationOrigin, privateJsonHeaders, STAFF_COOKIE_NAME } from "@/lib/staff-auth";

const MAX_BODY_BYTES = 8 * 1024;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateJsonHeaders() });

function clientKey(request: Request, username: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return crypto.createHash("sha256").update(`${ip}\0${username.trim().toLowerCase()}`).digest("hex");
}

async function readLoginBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const value = JSON.parse(text) as Record<string, unknown>;
  return { username: typeof value.username === "string" ? value.username : "", password: typeof value.password === "string" ? value.password : "" };
}

export async function GET(request: Request) {
  const staff = await getAuthenticatedStaff(request);
  return staff ? json({ ok: true, authenticated: true, staff }) : json({ ok: false, authenticated: false, staff: null }, 401);
}

export async function POST(request: Request) {
  if (!guardMutationOrigin(request)) return json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, 403);
  try {
    return await withAuthoritativeMutation(async () => {
    bootstrapOwnerFromEnvironment();
    const { username, password } = await readLoginBody(request);
    const key = clientKey(request, username);
    const attempt = consumeLoginAttempt(key);
    if (!attempt.allowed) {
      const response = json({ ok: false, errorMessage: "Đăng nhập tạm thời bị giới hạn. Vui lòng thử lại sau." }, 429);
      response.headers.set("Retry-After", String(attempt.retryAfterSeconds));
      return response;
    }
    const staff = authenticateStaff(username, password);
    if (!staff) {
      recordLoginFailure(key);
      return json({ ok: false, errorMessage: "Tên đăng nhập hoặc mật khẩu không chính xác." }, 401);
    }
    clearLoginFailures(key);
    const session = createStaffSession(staff.id);
    const response = json({
      ok: true,
      authenticated: true,
      token: session.token,
      staff: { id: staff.id, username: staff.username, displayName: staff.displayName, role: staff.role, roles: staff.roles }
    });
    response.cookies.set(STAFF_COOKIE_NAME, session.token, { httpOnly: true, secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1", sameSite: "lax", path: "/", expires: new Date(session.expiresAt) });
    return response;
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : typeof error === "object" && error && "status" in error && error.status === 503 ? 503 : 400;
    return json({ ok: false, errorMessage: status === 503 ? "Kho xác thực dùng chung chưa sẵn sàng." : "Yêu cầu đăng nhập không hợp lệ." }, status);
  }
}

export async function DELETE(request: Request) {
  if (!guardMutationOrigin(request)) return json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, 403);
  const value = (await cookies()).get(STAFF_COOKIE_NAME)?.value;
  if (value) {
    try { await withAuthoritativeMutation(() => revokeStaffSession(value)); }
    catch (error) {
      if (typeof error === "object" && error && "status" in error && error.status === 503) return json({ ok: false, errorMessage: "Kho xác thực dùng chung chưa sẵn sàng." }, 503);
      throw error;
    }
  }
  const response = json({ ok: true, authenticated: false, staff: null });
  response.cookies.set(STAFF_COOKIE_NAME, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
