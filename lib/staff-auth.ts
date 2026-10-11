import { cookies } from "next/headers";
import { getStaffBySessionToken } from "@/db/staff-repository";
import type { AuthenticatedStaff } from "@/lib/staff-access";
export { guardMutationOrigin, hasForbiddenCommercialProductFields, privateJsonHeaders, staffCan } from "@/lib/staff-access";
export type { AuthenticatedStaff, StaffCapability } from "@/lib/staff-access";

export const STAFF_COOKIE_NAME = "hami_staff_session";

export async function getAuthenticatedStaff(request?: Request): Promise<AuthenticatedStaff | null> {
  let token: string | undefined;

  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (match) token = match[1].trim();
    }
    if (!token) {
      token = request.headers.get("x-staff-token") || undefined;
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(STAFF_COOKIE_NAME)?.value;
    } catch {
      // ignore
    }
  }

  if (!token) return null;
  const staff = getStaffBySessionToken(token);
  return staff ? { id: staff.id, username: staff.username, displayName: staff.displayName, role: staff.role, roles: staff.roles } : null;
}
