import React from "react";
import Link from "next/link";
import { MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { getAllProducts, getDeliverySlots, getServiceZones } from "@/db";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { CatalogProductLinesSection } from "@/components/CatalogProductLinesSection";

export const dynamic = "force-dynamic";

export default function MenuPage() {
  const products = getAllProducts();
  const freshBowlProducts = products.filter((p) => !p.id.startsWith("cat-"));
  const zones = getServiceZones();
  const slots = getDeliverySlots();

  return (
    <div>
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
              Bao gồm 8 món Yến Tươi Chưng Nóng (thố sứ 200ml), Set Quà Tặng Hoa Sen Vàng, Yến Hũ Chưng Sẵn (75ml & 100ml) và Yến Sào Tinh Chế 100g chuẩn ISO 22000:2018 & FDA Hoa Kỳ.
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
        title="Menu Yến Tươi Chưng Nóng (Thố 200ml)"
        subtitle="Chưng mới theo khung giờ hẹn (08:00 – 21:00). Đặt từ 2 thố được Miễn phí giao hàng."
      />

      {/* Catalog Product Lines */}
      <CatalogProductLinesSection products={products} />

      {/* Zone & Slot Overview */}
      <section className="max-w-[1200px] mx-auto px-4 pr-14 md:pr-4 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/40 p-6">
          <div className="flex items-center gap-2 text-[#155132] font-serif-display text-xl font-semibold mb-3">
            <MapPin className="w-5 h-5 text-[#8A6632]" aria-hidden="true" />
            <h2>Khu vực phục vụ giao nóng tại Đà Nẵng [DEMO]</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 mb-4">
            Trải nghiệm yến chưng nóng phụ thuộc quãng đường di chuyển. Dưới đây là cấu hình phân
            vùng mẫu đang áp dụng khi kiểm tra đơn:
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
                        ? "Miễn phí [DEMO]"
                        : `${z.shippingFeeVnd?.toLocaleString("vi-VN")}đ [DEMO]`}
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
            <h2>Khung giờ chưng & giao theo ca bếp [DEMO]</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 mb-4">
            Mỗi ca bếp giới hạn số lượng thố để đảm bảo chất lượng chưng mới. Khi ca đã đầy, hệ
            thống tự động khóa nhận thêm vào ca đó:
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
                      Thời gian chuẩn bị tối thiểu: {s.minLeadMinutes} phút trước ca
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded ${
                      isFull
                        ? "bg-red-50 text-red-800 border border-red-200"
                        : "bg-[#DBF1EE]/70 text-[#155132]"
                    }`}
                  >
                    {isFull ? "Đã đầy ca" : `Còn nhận ${s.remainingBowls}/${s.maxCapacityBowls} thố`}
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
