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
    <div className="bg-[#FDFBF7] pb-14 space-y-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Liên hệ & Khu vực giao nhận", path: "/lien-he" },
        ]}
      />

      {/* 1. LANGFARM-STYLE CONTACT HEADER & 4 PASTEL INFO CARDS */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6 space-y-6">
        <div className="rounded-3xl bg-[#FAD4B8] p-6 sm:p-10 text-center space-y-2.5">
          <span className="inline-block rounded-full bg-white/85 px-3.5 py-1 text-xs font-bold text-[#7C4D2B]">
            Giao Ấm Nóng Tận Tay Trong 2 Giờ Tại Đà Nẵng
          </span>
          <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1B1B1B]">
            Khu Vực Giao Nóng 2H & Kênh Liên Hệ Hà Mi
          </h1>
          <p className="text-xs sm:text-base text-[#2B433A] max-w-2xl mx-auto leading-relaxed">
            Mỗi thố yến 200ml (35g yến tươi thật) được chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng tận giường bệnh, khách sạn hoặc tư gia tại Đà Nẵng.
          </p>
        </div>

        {/* 5 Pastel Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <a
            href={`tel:${BRAND_CONFIG.contact.hotlineTel}`}
            className="rounded-3xl bg-[#FFE9DD] p-5 space-y-1.5 transition hover:-translate-y-0.5"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C4D2B]">
              Hotline Đặt Nóng 2H
            </span>
            <p className="font-serif-display text-xl font-bold text-[#1B1B1B]">
              {BRAND_CONFIG.contact.hotlineDisplay}
            </p>
            <p className="text-xs text-[#4A4A4A]">Gọi xác nhận lịch chưng ngay</p>
          </a>

          <a
            href={BRAND_CONFIG.contact.zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl bg-[#E2FCF3] p-5 space-y-1.5 transition hover:-translate-y-0.5"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
              Zalo OA Chính Thức
            </span>
            <p className="font-serif-display text-xl font-bold text-[#1B1B1B]">
              Chat Zalo Giao 2H
            </p>
            <p className="text-xs text-[#4A4A4A]">Tư vấn vị yến & gửi ảnh thiệp quà</p>
          </a>

          <a
            href={`mailto:${BRAND_CONFIG.contact.emailDisplay}`}
            className="rounded-3xl bg-[#E5F0FA] p-5 space-y-1.5 transition hover:-translate-y-0.5"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
              Email CSKH & Quà Biếu
            </span>
            <p className="font-serif-display text-lg font-bold text-[#1B1B1B] break-all">
              {BRAND_CONFIG.contact.emailDisplay}
            </p>
            <p className="text-xs text-[#4A4A4A]">Tiếp nhận đơn & hợp tác doanh nghiệp</p>
          </a>

          <div className="rounded-3xl bg-[#FAEFCA] p-5 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C4D2B]">
              Khung Giờ Phục Vụ
            </span>
            <p className="font-serif-display text-xl font-bold text-[#1B1B1B]">
              08:00 – 21:00
            </p>
            <p className="text-xs text-[#4A4A4A]">Chưng tươi mới mỗi ngày cả cuối tuần</p>
          </div>

          <div className="rounded-3xl bg-[#F5E2F9] p-5 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1B4332]">
              Địa Chỉ Hà Mi
            </span>
            <p className="font-serif-display text-base font-bold text-[#1B1B1B] leading-snug">
              {BRAND_CONFIG.contact.addressDisplay}
            </p>
            <p className="text-xs text-[#4A4A4A]">Chuẩn ISO 22000:2018 & FDA Hoa Kỳ</p>
          </div>
        </div>
      </section>

      {/* 2. ZONES & SLOTS IN LANGFARM ROUNDED-3XL CONTAINERS */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Service Zones Table */}
        <div className="lg:col-span-7 rounded-3xl bg-[#FAF4EB] p-6 sm:p-8 space-y-4">
          <h2 className="flex items-center gap-2.5 font-serif-display text-xl sm:text-2xl font-bold text-[#1B4332]">
            <span className="w-10 h-10 rounded-2xl bg-[#FFE9DD] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-[#7C4D2B]" />
            </span>
            <span>Bảng khu vực giao nhận tại Đà Nẵng</span>
          </h2>

          <div className="space-y-3">
            {zones.map((z) => (
              <div
                key={z.id}
                className="rounded-2xl bg-white p-4 shadow-2xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-[#1B4332]">
                    {z.district} ({z.city})
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      z.deliveryStatus === "SUPPORTED"
                        ? "bg-[#E2FCF3] text-[#1B4332]"
                        : z.deliveryStatus === "FEE_PENDING_CONFIRMATION"
                          ? "bg-[#FAEFCA] text-[#7C4D2B]"
                          : "bg-red-50 text-red-800"
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
          <div className="rounded-3xl bg-[#FAF4EB] p-6 sm:p-8 space-y-4">
            <h2 className="flex items-center gap-2.5 font-serif-display text-xl font-bold text-[#1B4332]">
              <span className="w-10 h-10 rounded-2xl bg-[#E2FCF3] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-[#1B4332]" />
              </span>
              <span>Khung giờ giao nóng trong ngày</span>
            </h2>
            <p className="text-xs text-[#2B433A]/85">
              Khung giờ phục vụ cho ngày mai ({tomorrow}):
            </p>
            <div className="space-y-2.5">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs shadow-2xs"
                >
                  <div>
                    <p className="font-bold text-[#1B4332]">{slot.label}</p>
                    <p className="text-[#2B433A]/80">
                      Đặt trước tối thiểu {slot.minLeadMinutes} phút
                    </p>
                  </div>
                  <span className="rounded-full bg-[#E2FCF3] px-3 py-1 font-semibold text-[#1B4332]">
                    {slot.remainingBowls > 0
                      ? `Còn ${slot.remainingBowls}/${slot.maxCapacityBowls} thố`
                      : "Đã đầy"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#FFE9DD] p-6 sm:p-8 space-y-3">
            <h2 className="flex items-center gap-2 font-serif-display text-xl font-bold text-[#1B1B1B]">
              <PhoneCall className="w-5 h-5 text-[#7C4D2B]" />
              <span>Đặt Giao Nóng 2H Hoặc Hẹn Giờ Biếu Quà</span>
            </h2>
            <p className="flex items-start gap-2 text-xs sm:text-sm text-[#2B433A] leading-relaxed">
              <MessageCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#7C4D2B]" />
              <span>
                Đặt từ 2 thố yến tươi chưng nóng được miễn phí giao hàng trong bán kính 5km tại Đà Nẵng. Liên hệ nhanh qua Hotline/Zalo{" "}
                <strong>{BRAND_CONFIG.contact.hotlineDisplay}</strong> hoặc Email{" "}
                <a
                  href={`mailto:${BRAND_CONFIG.contact.emailDisplay}`}
                  className="font-bold text-[#1B4332] underline"
                >
                  {BRAND_CONFIG.contact.emailDisplay}
                </a>
                .
              </span>
            </p>
            <div className="pt-2">
              <Link
                href="/dat-hang"
                className="inline-flex w-full items-center justify-center min-h-[46px] px-5 py-3 rounded-full bg-[#1B4332] text-xs sm:text-sm font-bold text-white hover:bg-[#133023] transition"
              >
                Gửi yêu cầu đặt món trực tiếp →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
