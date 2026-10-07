import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { getDeliverySlots, getServiceZones, getTomorrowHoChiMinhDateStr } from "@/db";
import { BRAND_CONFIG } from "@/config/brand";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Liên Hệ & Khu Vực Giao Yến Chưng Nóng 2H Tại Đà Nẵng",
  description:
    "Tra cứu phạm vi phục vụ giao nóng trong 2H tại Đà Nẵng, khung giờ phục vụ (08:00 – 21:00) và kênh liên hệ Hotline/Zalo chính thức của Yến Sào Hà Mi.",
  path: "/lien-he",
});

export default function LienHePage() {
  const zones = getServiceZones();
  const tomorrow = getTomorrowHoChiMinhDateStr();
  const slots = getDeliverySlots({ requestedDate: tomorrow });

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-10 md:py-14 space-y-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Liên hệ & Khu vực giao nhận", path: "/lien-he" },
        ]}
      />
      <div className="border-b border-[#155132]/15 pb-6 space-y-2">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 rounded-full">
          Phạm vi phục vụ & Liên hệ
        </span>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#155132]">
          Khu Vực Giao Nóng 2H & Kênh Liên Hệ Hà Mi
        </h1>
        <p className="text-sm sm:text-base text-[#2B433A]/90 max-w-2xl">
          Để thố yến giữ trọn độ ấm nóng và hương thơm khi trao tay, Hà Mi chưng thủ công tươi mới ngay khi nhận đơn và giao ấm nóng trong vòng 2 giờ tại Đà Nẵng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Service Zones Table */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="flex items-center gap-2 font-serif-display text-xl font-semibold text-[#155132]">
            <MapPin className="w-5 h-5 text-[#BD9342]" />
            <span>Bảng khu vực giao nhận (Giá mẫu)</span>
          </h2>

          <div className="space-y-3">
            {zones.map((z) => (
              <div
                key={z.id}
                className="rounded-2xl border border-[#155132]/15 bg-white p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#155132]">
                    {z.district} ({z.city})
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      z.deliveryStatus === "SUPPORTED"
                        ? "bg-[#155132]/10 text-[#155132]"
                        : z.deliveryStatus === "FEE_PENDING_CONFIRMATION"
                          ? "bg-[#FFFCF4] border border-[#BD9342]/50 text-[#8A6632]"
                          : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {z.deliveryStatus === "SUPPORTED"
                      ? z.shippingFeeVnd === 0
                        ? "Miễn phí giao mẫu"
                        : `Phí giao mẫu: ${z.shippingFeeVnd?.toLocaleString("vi-VN")}đ`
                      : z.deliveryStatus === "FEE_PENDING_CONFIRMATION"
                        ? "Báo phí khi xác nhận"
                        : "Ngoài vùng giao nóng"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#2B433A]/80">
                  Phường tiêu biểu: {z.wardSample}
                </p>
                <p className="mt-1 text-xs text-[#2B433A]">{z.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kitchen Slots & Direct Contact */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-[#155132]/15 bg-white p-5 space-y-3 shadow-xs">
            <h2 className="flex items-center gap-2 font-serif-display text-xl font-semibold text-[#155132]">
              <Clock className="w-5 h-5 text-[#BD9342]" />
              <span>Khung giờ giao nóng trong ngày</span>
            </h2>
            <p className="text-xs text-[#2B433A]/85">
              Khung giờ phục vụ cho ngày mai ({tomorrow}):
            </p>
            <div className="space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl bg-[#FFFCF4] border border-[#BD9342]/35 px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-[#155132]">{slot.label}</p>
                    <p className="text-[#2B433A]/80">
                      Đặt trước tối thiểu {slot.minLeadMinutes} phút
                    </p>
                  </div>
                  <span className="font-semibold text-[#155132]">
                    {slot.remainingBowls > 0
                      ? `Còn ${slot.remainingBowls}/${slot.maxCapacityBowls} thố`
                      : "Đã đầy"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#BD9342]/45 bg-[#FFFCF4] p-5 space-y-3">
            <h2 className="flex items-center gap-2 font-serif-display text-xl font-semibold text-[#155132]">
              <PhoneCall className="w-5 h-5 text-[#BD9342]" />
              <span>Kênh liên hệ Yến Sào Hà Mi</span>
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#2B433A]">
              <p>
                <strong>Địa bàn phục vụ:</strong> {BRAND_CONFIG.contact.addressDisplay}
              </p>
              <p>
                <strong>Khung giờ hoạt động:</strong>{" "}
                {BRAND_CONFIG.contact.serviceHoursDisplay}
              </p>
              <p>
                <strong>Hotline:</strong>{" "}
                {BRAND_CONFIG.contact.hotlineDisplay ||
                  "Chưa cấu hình số chính thức (vui lòng gửi yêu cầu qua biểu mẫu đặt món)"}
              </p>
              <p className="flex items-start gap-1.5 text-xs text-[#8A6632] pt-1">
                <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Kênh Zalo OA & Messenger chính thức được tích hợp ở cụm nút cố định
                  cạnh phải màn hình (chỉ mở khi đã cấu hình đường dẫn chính thức).
                </span>
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dat-hang"
                className="inline-flex w-full items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl bg-[#155132] border border-[#BD9342] text-xs sm:text-sm font-bold text-[#FFFCF4] hover:bg-[#0e3b23]"
              >
                Gửi yêu cầu đặt món trực tiếp →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
