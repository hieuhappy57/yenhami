import type { PublicStaff, StaffRole } from "@/db/staff-repository";

export type AuthenticatedStaff = Pick<PublicStaff, "id" | "username" | "displayName" | "role" | "roles">;
export type StaffCapability = "reports.read" | "orders.read" | "orders.write" | "orders.prepare" | "payments.collect" | "payments.refund" | "customers.read" | "content.write" | "catalog.commercial.write" | "staff.manage" | "settings.sensitive";

const ROLE_CAPABILITIES: Record<StaffRole, readonly StaffCapability[]> = {
  OWNER: ["reports.read", "orders.read", "orders.write", "orders.prepare", "payments.collect", "payments.refund", "customers.read", "content.write", "catalog.commercial.write", "staff.manage", "settings.sensitive"],
  MANAGER: ["reports.read", "orders.read", "orders.write", "orders.prepare", "payments.collect", "payments.refund", "customers.read", "content.write", "catalog.commercial.write"],
  SALES: ["orders.read", "orders.write", "orders.prepare", "payments.collect", "customers.read"],
  KITCHEN: ["orders.read", "orders.prepare"],
  MARKETING: ["content.write"],
};

export function staffCan(staff: AuthenticatedStaff, capability: StaffCapability): boolean {
  return staff.roles.some((role) => ROLE_CAPABILITIES[role]?.includes(capability));
}

export function guardMutationOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    const originUrl = new URL(origin);
    return originUrl.protocol === requestUrl.protocol && originUrl.host === requestUrl.host;
  } catch { return false; }
}

export const COMMERCIAL_PRODUCT_FIELDS = ["priceVnd", "status", "supportedOptions", "supportedOptionsText", "variants", "priceDeltaVnd", "discountVnd", "isActive", "isAvailable"] as const;

export function hasForbiddenCommercialProductFields(payload: Record<string, unknown>): boolean {
  return COMMERCIAL_PRODUCT_FIELDS.some((key) => Object.hasOwn(payload, key));
}

export function privateJsonHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store, max-age=0", Pragma: "no-cache", Vary: "Cookie" };
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<Record<string, unknown>> {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw Object.assign(new Error("Dữ liệu yêu cầu quá lớn."), { status: 413 });
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw Object.assign(new Error("Dữ liệu yêu cầu quá lớn."), { status: 413 });
  }
  return JSON.parse(text) as Record<string, unknown>;
}
