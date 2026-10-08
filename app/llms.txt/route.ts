import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { GEO_CONFIG, SEO_CONFIG, absoluteUrl } from "@/config/seo";
import {
  getAllPosts,
  getAllProducts,
  getServiceZones,
  syncDbFromCloud,
} from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await syncDbFromCloud();
  const products = getAllProducts();
  const freshBowls = products.filter((p) => !p.id.startsWith("cat-"));
  const catalogItems = products.filter((p) => p.id.startsWith("cat-"));
  const posts = getAllPosts(true);
  const zones = getServiceZones();

  const lines: string[] = [
    `# ${BRAND_CONFIG.brandName} — ${BRAND_CONFIG.flagshipLine}`,
    "",
    `> ${SEO_CONFIG.defaultDescription}`,
    "",
    "## Thông tin Thương hiệu & Liên hệ Chính thức (Entity & NAP)",
    `- **Tên thương hiệu:** ${BRAND_CONFIG.brandName} (${BRAND_CONFIG.shortName})`,
    `- **Website chính thức:** ${SEO_CONFIG.siteUrl}`,
    `- **Định vị chủ lực:** Yến Tươi Chưng Nóng Thố Sứ 200ml (35g yến tươi thật) — Giao ấm nóng trong 2 giờ tại Đà Nẵng & Quà biếu sức khỏe thượng hạng`,
    `- **Chứng nhận chất lượng:** Đạt chuẩn Quốc tế ISO 22000:2018 & Đăng ký FDA Hoa Kỳ`,
    `- **Hotline / Zalo đặt món:** ${BRAND_CONFIG.contact.hotlineDisplay} (${BRAND_CONFIG.contact.zaloUrl})`,
    `- **Email CSKH:** ${BRAND_CONFIG.contact.emailDisplay}`,
    `- **Địa chỉ:** ${BRAND_CONFIG.contact.addressDisplay}`,
    `- **Địa bàn:** Đà Nẵng, Việt Nam`,
    `- **Giờ mở cửa / Ca bếp:** ${BRAND_CONFIG.contact.serviceHoursDisplay}`,
    `- **Khu vực giao nóng 2H tại Đà Nẵng:** ${GEO_CONFIG.servedDistricts.join(", ")}`,
    "",
    "## Các Trang Chính (Key Pages)",
    `- [Trang chủ Yến Sào Hà Mi](${absoluteUrl("/")})`,
    `- [Thực đơn Yến Tươi Chưng Nóng & Sản phẩm](${absoluteUrl("/yen-tuoi-chung-nong")})`,
    `- [Set Quà Biếu Yến Sào Thượng Hạng & Thiệp Viết Tay](${absoluteUrl("/gui-qua")})`,
    `- [Đặt Món Giao Nóng 2H Tại Đà Nẵng](${absoluteUrl("/dat-hang")})`,
    `- [Cẩm Nang Dinh Dưỡng & Kiến Thức Yến Sào](${absoluteUrl("/bai-viet")})`,
    `- [Về Yến Sào Hà Mi (ISO 22000:2018 & FDA Hoa Kỳ)](${absoluteUrl("/ve-ha-mi")})`,
    `- [Khu Vực Giao Nóng Đà Nẵng & Liên Hệ](${absoluteUrl("/lien-he")})`,
    `- [Hồ sơ dữ liệu đầy đủ cho AI (llms-full.txt)](${absoluteUrl("/llms-full.txt")})`,
    "",
    "## Menu 8 Món Yến Tươi Chưng Nóng Thố Sứ 200ml (35g Yến Tươi Thật)",
    ...freshBowls.map((p) => {
      const price =
        typeof p.priceVnd === "number" && Number.isFinite(p.priceVnd) && p.priceVnd >= 0
          ? `${p.priceVnd.toLocaleString("vi-VN")}đ`
          : "Liên hệ";
      return `- [${p.name}](${absoluteUrl(`/san-pham/${p.slug}`)}): ${price} — ${p.shortDescription} (Thành phần: ${p.ingredients.join(", ")})`;
    }),
    "",
    "## Dòng Set Quà Biếu, Yến Hũ Chưng Sẵn & Yến Sào Tinh Chế",
    ...catalogItems.map((p) => {
      const price =
        typeof p.priceVnd === "number" && Number.isFinite(p.priceVnd) && p.priceVnd >= 0
          ? `${p.priceVnd.toLocaleString("vi-VN")}đ`
          : "Liên hệ";
      return `- [${p.name}](${absoluteUrl(`/san-pham/${p.slug}`)}): ${price} — ${p.shortDescription}`;
    }),
    "",
    "## Khu Vực Phục Vụ Giao Nóng Tại Đà Nẵng",
    ...zones.map(
      (z) =>
        `- **${z.district}** (${z.wardSample}): Thời gian chuẩn bị ~${z.leadTimeMinutes} phút — ${z.note}`
    ),
    "",
    "## Cẩm Nang Dinh Dưỡng & Bài Viết Chuyên Sâu",
    ...posts.map(
      (post) =>
        `- [${post.title}](${absoluteUrl(`/bai-viet/${post.slug}`)}): ${post.excerpt}`
    ),
    "",
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
