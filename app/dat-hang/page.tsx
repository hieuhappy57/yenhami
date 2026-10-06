import React, { Suspense } from "react";
import type { Metadata } from "next";
import {
  getAllProducts,
  getDeliverySlots,
  getServiceZones,
  getTomorrowHoChiMinhDateStr,
  syncDbFromCloud,
} from "@/db";
import { OrderRequestClient } from "@/components/OrderRequestClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đặt món | Yến Sào Hà Mi",
  description:
    "Chọn món yến tươi chưng nóng, khu vực giao hàng, khung giờ nhận món và thiệp quà tặng. Hà Mi sẽ liên hệ xác nhận lịch chưng nóng.",
};

export default async function DatHangPage() {
  await syncDbFromCloud();
  const products = getAllProducts();
  const zones = getServiceZones();
  const defaultDate = getTomorrowHoChiMinhDateStr();
  const slots = getDeliverySlots({
    requestedDate: defaultDate,
    zoneLeadTimeMinutes: zones[0]?.leadTimeMinutes,
  });

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1200px] px-4 py-12 text-sm text-[#2B433A]">
          Đang tải biểu mẫu đặt yến...
        </div>
      }
    >
      <OrderRequestClient
        initialProducts={products}
        initialZones={zones}
        initialSlots={slots}
        defaultDate={defaultDate}
      />
    </Suspense>
  );
}
