import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "hami_staff_session";
const SECRET = process.env.HAMI_SESSION_SECRET || "hami-local-mvp-session-secret-2026";

export interface StaffSessionPayload {
  id: string;
  username: string;
  displayName: string;
  role: string;
  exp: number;
}

export function createStaffSessionToken(staff: Omit<StaffSessionPayload, "exp">): string {
  const payload: StaffSessionPayload = {
    ...staff,
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyStaffSessionToken(token?: string | null): StaffSessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as StaffSessionPayload;
    if (!parsed.exp || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAuthenticatedStaff(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyStaffSessionToken(token);
}

export const STAFF_COOKIE_NAME = COOKIE_NAME;
