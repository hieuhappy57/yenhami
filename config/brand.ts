export interface ContactChannelConfig {
  hotlineDisplay: string | null;
  hotlineTel: string | null;
  emailDisplay: string;
  zaloUrl: string | null;
  messengerUrl: string | null;
  facebookUrl: string;
  googleMapsUrl?: string;
  googleMapsEmbedUrl?: string;
  addressDisplay: string;
  serviceHoursDisplay: string;
  legalEntityDisplay: string;
}

export const BRAND_CONFIG = {
  brandName: "Yến Sào Hà Mi",
  shortName: "HÀ MI",
  tagline: "Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất",
  flagshipLine: "Yến Tươi Chưng Nóng Giao Ngay 2H & Quà Tặng Sức Khỏe",
  emotionalSubline:
    "Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!",
  purityCommitment:
    "Mỗi thố yến 200ml chứa đến 35g yến tươi thật, gói trọn hương vị tự nhiên và giá trị dinh dưỡng nguyên vẹn.",
  promoBanner:
    "✨ YẾN TƯƠI HÀ MI - CHƯNG NÓNG - GIAO NGAY TRONG 2H — Món quà bồi bổ cho người bệnh – mẹ bầu – ông bà cao tuổi! ✨",
  heroCopy: {
    h1: "Yến Tươi Chưng Nóng Thố Sứ — Giao Ngay Trong 2H Tại Đà Nẵng",
    lineBadge: "Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất",
    lead: "Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất. 35g yến tươi thật nguyên tổ trong thố sứ 200ml, chưng tươi theo yêu cầu, giao ấm nóng tận tay trong 2 giờ nội thành Đà Nẵng. Món quà bồi bổ trọn vẹn cho người bệnh, mẹ bầu và ông bà cao tuổi.",
    cta: "Đặt Giao Nóng 2H - Từ 295.000đ",
    secondaryCta: "Xem Menu Thảo Mộc Thượng Hạng",
    subline:
      "Dù là mẹ bầu cần thêm dưỡng chất, ông bà lớn tuổi, hay người đang hồi phục sau bệnh, yến chưng nóng luôn là món quà ấm lòng – ngon miệng – dễ hấp thu!",
  },
  isDemoMode: true,
  demoNoticeBanner:
    "✨ YẾN TƯƠI HÀ MI - CHƯNG NÓNG - GIAO NGAY TRONG 2H — Món quà bồi bổ cho người bệnh – mẹ bầu – ông bà cao tuổi! ✨",
  workshopAddressDisplay: "Thôn Bà Rén, Xã Xuân Phú, Đà Nẵng",
  contact: {
    hotlineDisplay: process.env.NEXT_PUBLIC_HAMI_HOTLINE_DISPLAY || "0935 052 959",
    hotlineTel: process.env.NEXT_PUBLIC_HAMI_HOTLINE_TEL || "0935052959",
    emailDisplay: process.env.NEXT_PUBLIC_HAMI_EMAIL || "cskh@yenhami.com",
    zaloUrl: process.env.NEXT_PUBLIC_HAMI_ZALO_URL || "https://zalo.me/0935052959",
    messengerUrl: process.env.NEXT_PUBLIC_HAMI_MESSENGER_URL || "https://m.me/yenhamidanang",
    facebookUrl: "https://www.facebook.com/yenhamidanang/",
    googleMapsUrl:
      process.env.NEXT_PUBLIC_HAMI_MAPS_URL ||
      "https://www.google.com/maps/place/Y%E1%BA%BFn+S%C3%A0o+H%C3%A0+Mi+-+Y%E1%BA%BFn+t%C6%B0%C6%A1i+ch%C6%B0ng+n%C3%B3ng+%C4%90%C3%A0+N%E1%BA%B5ng/@16.0132072,108.2258626,17z/data=!3m1!4b1!4m6!3m5!1s0x31421b2ef191fa53:0x729e4b14ef420552!8m2!3d16.0132072!4d108.2258626!16s%2Fg%2F11p1_y12f_?hl=vi",
    googleMapsEmbedUrl:
      "https://maps.google.com/maps?q=loc:16.0132072,108.2258626+(Y%E1%BA%BFn+S%C3%A0o+H%C3%A0+Mi+-+Y%E1%BA%BFn+T%C6%B0%C6%A1i+Ch%C6%B0ng+N%C3%B3ng)&hl=vi&z=17&output=embed",
    addressDisplay:
      process.env.NEXT_PUBLIC_HAMI_ADDRESS ||
      "365 Đường 29 tháng 3, Hòa Xuân, Tp. Đà Nẵng",
    serviceHoursDisplay:
      process.env.NEXT_PUBLIC_HAMI_HOURS || "08:00 – 21:00 hàng ngày",
    legalEntityDisplay:
      process.env.NEXT_PUBLIC_HAMI_LEGAL ||
      "Yến Sào Hà Mi (yenhami.com) • Đạt chuẩn ISO 22000:2018 & FDA Hoa Kỳ • Hotline/Zalo: 0935 052 959 • Email: cskh@yenhami.com",
  } satisfies ContactChannelConfig,
};
