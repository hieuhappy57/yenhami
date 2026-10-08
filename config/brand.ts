export interface ContactChannelConfig {
  hotlineDisplay: string | null;
  hotlineTel: string | null;
  emailDisplay: string;
  zaloUrl: string | null;
  messengerUrl: string | null;
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
  contact: {
    hotlineDisplay: process.env.NEXT_PUBLIC_HAMI_HOTLINE_DISPLAY || "0935 052 959",
    hotlineTel: process.env.NEXT_PUBLIC_HAMI_HOTLINE_TEL || "0935052959",
    emailDisplay: process.env.NEXT_PUBLIC_HAMI_EMAIL || "cskh@yenhami.com",
    zaloUrl: process.env.NEXT_PUBLIC_HAMI_ZALO_URL || "https://zalo.me/0935052959",
    messengerUrl: process.env.NEXT_PUBLIC_HAMI_MESSENGER_URL || null,
    addressDisplay:
      process.env.NEXT_PUBLIC_HAMI_ADDRESS ||
      "Thôn Bà Rén, Xã Xuân Phú, TP. Đà Nẵng",
    serviceHoursDisplay:
      process.env.NEXT_PUBLIC_HAMI_HOURS || "08:00 – 21:00 hàng ngày",
    legalEntityDisplay:
      process.env.NEXT_PUBLIC_HAMI_LEGAL ||
      "Yến Sào Hà Mi (yenhami.com) • Đạt chuẩn ISO 22000:2018 & FDA Hoa Kỳ • Hotline/Zalo: 0935 052 959 • Email: cskh@yenhami.com",
  } satisfies ContactChannelConfig,
};
