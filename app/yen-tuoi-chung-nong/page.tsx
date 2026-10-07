import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { getAllProducts, getDeliverySlots, getServiceZones, syncDbFromCloud } from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Thực Đơn Yến Tươi Chưng Nóng Thố Sứ 200ml & Sản Phẩm Yến Sào",
  description:
    "Menu 8 món Yến Tươi Chưng Nóng thố sứ 200ml (35g yến tươi thật) giá chỉ từ 295.000đ, giao ấm nóng trong 2 giờ tại Đà Nẵng. Set Quà Tặng Hoa Sen Vàng, Yến Hũ Chưng Sẵn và Yến Sào Tinh Chế chuẩn ISO 22000:2018 & FDA Hoa Kỳ.",
  path: "/yen-tuoi-chung-nong",
});

export default async function MenuPage() {
  await syncDbFromCloud();
  const products = getAllProducts();
  const freshBowlProducts = products.filter((p) => !p.id.startsWith("cat-"));
  const zones = getServiceZones();
  const slots = getDeliverySlots();

  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Thực đơn & Sản phẩm", path: "/yen-tuoi-chung-nong" },
        ]}
      />
      {/* Header Banner */}
      <section className="bg-[#FFFCF4] border-b border-[#BD9342]/35 py-8 md:py-12 px-4 pr-14 md:pr-4">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#8A6632]">
              Danh mục sản phẩm • Yến Sào Hà Mi
            </span>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#155132]">
              Thực Đơn & Sản Phẩm Yến Sào Hà Mi
            </h1>
            <p className="text-sm sm:text-base text-[#2B433A]/90 leading-relaxed">
              Bao gồm 8 món Yến Tươi Chưng Nóng (thố sứ 200ml • 35g yến tươi thật • giá từ 295.000đ/thố), Set Quà Tặng Hoa Sen Vàng, Yến Hũ Chưng Sẵn (75ml & 100ml) và Yến Sào Tinh Chế 100g chuẩn ISO 22000:2018 & FDA Hoa Kỳ.
            </p>
          </div>
          <Link
            href="/dat-hang"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-md bg-[#155132] text-[#FFFCF4] border border-[#BD9342] font-semibold text-sm hover:bg-[#0e3b23] transition-colors shrink-0"
          >
            Tới bước Gửi yêu cầu đặt món →
          </Link>
        </div>
      </section>

      {/* Main Menu Grid */}
      <ProductMenuSection
        products={freshBowlProducts}
        title="Menu Yến Tươi Chưng Nóng (Thố Sứ 200ml • 35g Yến Tươi)"
        subtitle="Chưng thủ công tươi mới ngay khi nhận đơn, giao ấm nóng trong 2 giờ (08:00 – 21:00). Đặt từ 2 thố được Miễn phí giao hàng trong bán kính 5km."
      />

      {/* Catalog Product Lines */}
      <CatalogProductLinesSection products={products} />

      {/* Zone & Slot Overview */}
      <section className="max-w-[1200px] mx-auto px-4 pr-14 md:pr-4 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/40 p-6">
          <div className="flex items-center gap-2 text-[#155132] font-serif-display text-xl font-semibold mb-3">
            <MapPin className="w-5 h-5 text-[#8A6632]" aria-hidden="true" />
            <h2>Khu vực phục vụ giao nóng 2H tại Đà Nẵng</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 mb-4">
            Thố sứ 200ml giữ nhiệt giúp món yến đến tay vẫn ấm nóng trọn vị. Đặt từ 2 thố miễn phí giao hàng trong bán kính 5km:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {zones.map((z) => (
              <li
                key={z.id}
                className="p-3 rounded-lg bg-white border border-[#155132]/15 flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-semibold text-[#155132]">{z.district}</p>
                  <p className="text-xs text-[#2B433A]/75 mt-0.5">{z.wardSample}</p>
                </div>
                <div className="text-right shrink-0">
                  {z.deliveryStatus === "SUPPORTED" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#155132] bg-[#DBF1EE]/70 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {z.shippingFeeVnd === 0
                        ? "Miễn phí giao"
                        : `${z.shippingFeeVnd?.toLocaleString("vi-VN")}đ`}
                    </span>
                  )}
                  {z.deliveryStatus === "FEE_PENDING_CONFIRMATION" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/50 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5" />
                      Báo phí khi xác nhận
                    </span>
                  )}
                  {z.deliveryStatus === "OUT_OF_ZONE" && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Ngoài vùng giao nóng
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/40 p-6">
          <div className="flex items-center gap-2 text-[#155132] font-serif-display text-xl font-semibold mb-3">
            <Clock className="w-5 h-5 text-[#8A6632]" aria-hidden="true" />
            <h2>Khung giờ chưng nóng & giao ngay trong ngày</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 mb-4">
            Mỗi thố yến được chưng thủ công tươi mới ngay khi nhận đơn và giao ấm nóng trong vòng 2 giờ (08:00 – 21:00):
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm">
            {slots.map((s) => {
              const isFull = s.remainingBowls <= 0 || !s.isActive;
              return (
                <li
                  key={s.id}
                  className="p-3 rounded-lg bg-white border border-[#155132]/15 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-[#155132]">{s.label}</p>
                    <p className="text-xs text-[#2B433A]/75">
                      Thời gian chuẩn bị tối thiểu: {s.minLeadMinutes} phút
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      isFull
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-[#DBF1EE]/70 text-[#155132]"
                    }`}
                  >
                    {isFull ? "Tạm đầy khung giờ" : `Còn nhận ${s.remainingBowls}/${s.maxCapacityBowls} thố`}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
