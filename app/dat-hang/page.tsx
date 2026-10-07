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
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Đặt Món Yến Tươi Chưng Nóng & Set Quà Biếu Giao Ngay 2H",
  description:
    "Chọn món yến tươi chưng nóng thố sứ 200ml, khu vực giao hàng tại Đà Nẵng, khung giờ nhận món (08:00 – 21:00) và thiệp quà tặng viết tay. Hà Mi liên hệ xác nhận lịch chưng nóng.",
  path: "/dat-hang",
});

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
