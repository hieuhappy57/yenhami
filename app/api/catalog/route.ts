import { NextResponse } from "next/server";
import {
  getAllProducts,
  getDeliverySlots,
  getServiceZones,
  syncDbFromCloud,
} from "@/db";

export async function GET(request: Request) {
  await syncDbFromCloud();

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date") || undefined;
  const zoneId = url.searchParams.get("zoneId") || undefined;

  const products = getAllProducts();
  const zones = getServiceZones();
  const selectedZone = zoneId ? zones.find((z) => z.id === zoneId) : undefined;
  const slots = getDeliverySlots({
    requestedDate,
    zoneLeadTimeMinutes: selectedZone?.leadTimeMinutes,
  });

  return NextResponse.json({
    ok: true,
    isDemoMode: true,
    products,
    zones,
    slots,
  });
}
