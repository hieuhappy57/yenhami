import { NextResponse } from "next/server";
import { createStaff, listStaff, updateStaff } from "@/db/staff-repository";
import { withAuthoritativeMutation } from "@/lib/authoritative-write";
import { getAuthenticatedStaff, guardMutationOrigin, privateJsonHeaders, staffCan } from "@/lib/staff-auth";

const MAX_BODY_BYTES = 32 * 1024;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: privateJsonHeaders() });

async function owner(request?: Request) {
  const staff = await getAuthenticatedStaff(request);
  if (!staff) return { response: json({ ok: false, errorMessage: "Yêu cầu đăng nhập nhân viên." }, 401) };
  if (!staffCan(staff, "staff.manage")) return { response: json({ ok: false, errorMessage: "Chỉ chủ sở hữu được quản lý nhân viên." }, 403) };
  return { staff };
}

async function body(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  return JSON.parse(text) as Record<string, unknown>;
}

export async function GET(request: Request) {
  const auth = await owner(request);
  if (auth.response) return auth.response;
  return json({ ok: true, staff: listStaff() });
}

export async function POST(request: Request) {
  const auth = await owner(request);
  if (auth.response) return auth.response;
  if (!guardMutationOrigin(request)) return json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, 403);
  try {
    const value = await body(request);
    const created = await withAuthoritativeMutation(() => createStaff({
      username: String(value.username || ""), email: value.email == null ? null : String(value.email),
      displayName: String(value.displayName || ""), password: typeof value.password === "string" ? value.password : "", roles: value.roles,
    }));
    return json({ ok: true, staff: created }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tạo nhân viên.";
    const status = typeof error === "object" && error && "status" in error && error.status === 503 ? 503 : message === "BODY_TOO_LARGE" ? 413 : message.includes("UNIQUE") ? 409 : 400;
    return json({ ok: false, errorMessage: status === 503 ? "Kho dữ liệu dùng chung chưa sẵn sàng." : message === "BODY_TOO_LARGE" ? "Dữ liệu quá lớn." : message }, status);
  }
}

export async function PATCH(request: Request) {
  const auth = await owner(request);
  if (auth.response) return auth.response;
  if (!guardMutationOrigin(request)) return json({ ok: false, errorMessage: "Nguồn yêu cầu không hợp lệ." }, 403);
  try {
    const value = await body(request);
    const id = typeof value.id === "string" ? value.id : "";
    if (!id) return json({ ok: false, errorMessage: "Thiếu mã nhân viên." }, 400);
    const updated = await withAuthoritativeMutation(() => updateStaff(id, {
      username: typeof value.username === "string" ? value.username : undefined,
      email: value.email === null ? null : typeof value.email === "string" ? value.email : undefined,
      displayName: typeof value.displayName === "string" ? value.displayName : undefined,
      password: typeof value.password === "string" && value.password ? value.password : undefined,
      roles: value.roles,
      isActive: typeof value.isActive === "boolean" ? value.isActive : undefined,
    }));
    return json({ ok: true, staff: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể cập nhật nhân viên.";
    const status = typeof error === "object" && error && "status" in error && error.status === 503 ? 503 : message === "BODY_TOO_LARGE" ? 413 : message.includes("cuối cùng") || message.includes("UNIQUE") ? 409 : 400;
    return json({ ok: false, errorMessage: status === 503 ? "Kho dữ liệu dùng chung chưa sẵn sàng." : message === "BODY_TOO_LARGE" ? "Dữ liệu quá lớn." : message }, status);
  }
}
