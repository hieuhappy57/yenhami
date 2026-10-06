export interface ContactChannelConfig {
  hotlineDisplay: string | null;
  hotlineTel: string | null;
  zaloUrl: string | null;
  messengerUrl: string | null;
  addressDisplay: string;
  serviceHoursDisplay: string;
  legalEntityDisplay: string;
}

export const BRAND_CONFIG = {
  brandName: "Yến Sào Hà Mi",
  shortName: "HÀ MI",
  tagline: "CHẤT TỪNG SỢI YẾN",
  flagshipLine: "Yến Tươi Chưng Nóng & Quà Tặng Yến Sào",
  emotionalSubline: "Món quà của sự an tâm, chạm đến sự bình yên.",
  heroCopy: {
    h1: "Yến Sào Hà Mi",
    lineBadge: "Tinh Hoa Yến Việt • ISO 22000 & FDA",
    lead: "Yến tươi chưng nóng theo ca, yến hũ thượng hạng 75ml–100ml và bộ quà tặng yến sào tinh tuyển.",
    cta: "Chọn món",
    subline: "Món quà của sự an tâm, chạm đến sự bình yên.",
  },
  isDemoMode: true,
  demoNoticeBanner: "Yến Sào Hà Mi • Đặt từ 2 thố/set miễn phí giao hàng • Khung giờ giao 08:00 – 21:00",
  contact: {
    hotlineDisplay: process.env.NEXT_PUBLIC_HAMI_HOTLINE_DISPLAY || "0935 052 959",
    hotlineTel: process.env.NEXT_PUBLIC_HAMI_HOTLINE_TEL || "0935052959",
    zaloUrl: process.env.NEXT_PUBLIC_HAMI_ZALO_URL || "https://zalo.me/0935052959",
    messengerUrl: process.env.NEXT_PUBLIC_HAMI_MESSENGER_URL || null,
    addressDisplay:
      process.env.NEXT_PUBLIC_HAMI_ADDRESS ||
      "Thôn Bà Rén, Xã Xuân Phú, TP. Đà Nẵng",
    serviceHoursDisplay:
      process.env.NEXT_PUBLIC_HAMI_HOURS || "08:00 – 21:00 hàng ngày",
    legalEntityDisplay:
      process.env.NEXT_PUBLIC_HAMI_LEGAL ||
      "Yến Sào Hà Mi (lehami.vn) • Đạt chuẩn ISO 22000:2018 & FDA Hoa Kỳ • Hotline: 0935 052 959",
  } satisfies ContactChannelConfig,
};
