import React from "react";
import { ExternalLink, Navigation } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";

interface GoogleMapEmbedProps {
  addressDisplay?: string;
  serviceHoursDisplay?: string;
  className?: string;
}

export function GoogleMapEmbed({
  addressDisplay,
  serviceHoursDisplay,
  className = "",
}: GoogleMapEmbedProps) {
  const address = addressDisplay || BRAND_CONFIG.contact.addressDisplay;
  const hours = serviceHoursDisplay || BRAND_CONFIG.contact.serviceHoursDisplay;
  const mapsUrl = BRAND_CONFIG.contact.googleMapsUrl;
  const embedUrl = BRAND_CONFIG.contact.googleMapsEmbedUrl;

  return (
    <section className={`max-w-[1280px] mx-auto px-4 md:px-8 ${className}`}>
      <div className="rounded-3xl bg-white border border-[#E8DEC8]/90 overflow-hidden shadow-[0_6px_24px_rgba(27,67,50,0.06)]">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8DEC8]/60 bg-[#FAF4EB]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block rounded-full bg-[#E2FCF3] px-3 py-1 text-xs font-bold text-[#1B4332]">
                Vị Trí Cửa Hàng & Bếp Chưng Nóng
              </span>
              <span className="text-xs text-[#7C4D2B] font-semibold hidden sm:inline">
                • Hòa Xuân, Đà Nẵng
              </span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B]">
              Bản Đồ Google Maps — Yến Sào Hà Mi
            </h2>
            <p className="text-xs sm:text-sm text-[#2B433A]/85 mt-1">
              📍 {address} • Khung giờ phục vụ: {hours}
            </p>
          </div>
          {mapsUrl && (
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B4332] text-white text-xs sm:text-sm font-bold hover:bg-[#133023] transition shadow-xs"
              >
                <Navigation className="w-4 h-4 text-[#F9E498]" />
                <span>Chỉ đường trên Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </a>
            </div>
          )}
        </div>

        <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] min-h-[360px] max-h-[520px] bg-[#F8F5EC]">
          {embedUrl ? (
            <iframe
              title="Bản đồ vị trí Yến Sào Hà Mi trên Google Maps"
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-6 text-center text-sm text-[#2B433A]/80">
              Chưa cấu hình URL bản đồ.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
