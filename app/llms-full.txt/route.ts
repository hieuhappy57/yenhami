import { NextResponse } from "next/server";
import { BRAND_CONFIG } from "@/config/brand";
import { GEO_CONFIG, SEO_CONFIG, absoluteUrl } from "@/config/seo";
import {
  getAllPosts,
  getAllProducts,
  getDeliverySlots,
  getServiceZones,
  syncDbFromCloud,
} from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await syncDbFromCloud();
  const products = getAllProducts();
  const posts = getAllPosts(true);
  const zones = getServiceZones();
  const slots = getDeliverySlots();

  const sections: string[] = [
    `# Hồ Sơ Dữ Liệu Toàn Diện (Full Knowledge Base) — ${BRAND_CONFIG.brandName}`,
    "",
    `URL chính thức: ${SEO_CONFIG.siteUrl}`,
    `Cập nhật tự động theo cơ sở dữ liệu sản phẩm & cẩm nang của Yến Sào Hà Mi.`,
    "",
    "## 1. Định vị Thương hiệu & Cam kết Chất lượng",
    `- Thương hiệu: ${BRAND_CONFIG.brandName}`,
    `- Khẩu hiệu: ${BRAND_CONFIG.tagline}`,
    `- Dòng sản phẩm chủ lực: ${BRAND_CONFIG.flagshipLine}`,
    `- Cam kết nguyên chất: ${BRAND_CONFIG.purityCommitment}`,
    `- Chứng nhận an toàn quốc tế: ISO 22000:2018 & FDA Hoa Kỳ`,
    `- Hotline / Zalo: ${BRAND_CONFIG.contact.hotlineDisplay} (${BRAND_CONFIG.contact.zaloUrl})`,
    `- Email: ${BRAND_CONFIG.contact.emailDisplay}`,
    `- Địa chỉ: ${BRAND_CONFIG.contact.addressDisplay}`,
    `- Khu vực giao nóng 2H: Thành phố Đà Nẵng (${GEO_CONFIG.servedDistricts.join(", ")})`,
    "",
    "## 2. Chi Tiết Toàn Bộ Sản Phẩm & Bảng Giá",
    ...products.flatMap((p, idx) => {
      const price = p.priceVnd ? `${p.priceVnd.toLocaleString("vi-VN")}đ` : "Liên hệ";
      return [
        `### 2.${idx + 1}. ${p.name}`,
        `- URL: ${absoluteUrl(`/san-pham/${p.slug}`)}`,
        `- Phân nhóm: ${p.categoryLabel}`,
        `- Giá niêm yết: ${price}`,
        `- Dung tích / Quy cách: ${p.volumeMl}ml`,
        `- Thành phần: ${p.ingredients.join(", ")}`,
        `- Khẩu vị: ${p.tasteProfile}`,
        `- Mô tả: ${p.shortDescription}`,
        `- Hướng dẫn dùng: ${p.usageGuide}`,
        `- Bảo quản: ${p.storageGuide}`,
        `- Lưu ý sử dụng: ${p.cautionNote}`,
        "",
      ];
    }),
    "## 3. Khung Giờ Ca Bếp & Phân Vùng Giao Nóng Tại Đà Nẵng",
    "### Các ca bếp chưng mới mỗi ngày:",
    ...slots.map(
      (s) =>
        `- **${s.label}** (${s.timeWindow}): Chuẩn bị trước tối thiểu ${s.minLeadMinutes} phút (Công suất tối đa ${s.maxCapacityBowls} thố/ca)`
    ),
    "",
    "### Phân vùng giao nhận tại Đà Nẵng:",
    ...zones.map(
      (z) =>
        `- **${z.district} (${z.city})** — Phường tiêu biểu: ${z.wardSample} | Thời gian chuẩn bị: ${z.leadTimeMinutes} phút | Ghi chú: ${z.note}`
    ),
    "",
    "## 4. Toàn Văn Cẩm Nang Dinh Dưỡng & Bài Viết Chuyên Sâu",
    ...posts.flatMap((post, idx) => [
      `### 4.${idx + 1}. ${post.title}`,
      `- URL: ${absoluteUrl(`/bai-viet/${post.slug}`)}`,
      `- Chuyên mục: ${post.category}`,
      `- Tóm tắt: ${post.excerpt}`,
      "",
      post.content,
      "",
    ]),
  ];

  return new NextResponse(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
