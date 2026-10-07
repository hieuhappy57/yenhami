import fs from "node:fs";
import path from "node:path";
import { SEO_CONFIG, SITE_URL, buildPageMetadata } from "../config/seo";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import manifest from "../app/manifest";
import { getAllPosts, getAllProducts } from "../db/index";

interface AuditCheckResult {
  category: string;
  target: string;
  passed: boolean;
  detail: string;
}

async function runSeoAudit() {
  const results: AuditCheckResult[] = [];
  const rootDir = process.cwd();

  const record = (
    category: string,
    target: string,
    passed: boolean,
    detail: string
  ) => {
    results.push({ category, target, passed, detail });
  };

  console.log("=================================================================");
  console.log("🔍 BÁO CÁO KIỂM TRA TỐI ƯU SEO — YẾN SÀO HÀ MI (ha-mi-website)");
  console.log(`🌐 Tên miền cấu hình (SITE_URL): ${SITE_URL}`);
  console.log("=================================================================\n");

  // 1. Kiểm tra Cấu hình SEO Trung tâm
  record(
    "1. Cấu hình Gốc",
    "SITE_URL hợp lệ (HTTPS)",
    SITE_URL.startsWith("https://"),
    `SITE_URL = ${SITE_URL}`
  );
  record(
    "1. Cấu hình Gốc",
    "Tiêu đề mặc định (Default Title)",
    SEO_CONFIG.defaultTitle.length >= 30 && SEO_CONFIG.defaultTitle.length <= 80,
    `${SEO_CONFIG.defaultTitle.length} ký tự: "${SEO_CONFIG.defaultTitle}"`
  );
  record(
    "1. Cấu hình Gốc",
    "Mô tả mặc định (Default Description)",
    SEO_CONFIG.defaultDescription.length >= 80 &&
      SEO_CONFIG.defaultDescription.length <= 220,
    `${SEO_CONFIG.defaultDescription.length} ký tự`
  );
  record(
    "1. Cấu hình Gốc",
    "Bộ từ khóa thương hiệu & địa phương",
    SEO_CONFIG.keywords.length >= 8,
    `${SEO_CONFIG.keywords.length} từ khóa mục tiêu`
  );

  // 2. Kiểm tra Robots.txt
  const robotsConfig = robots();
  const rules = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules[0]
    : robotsConfig.rules;
  const disallowList = Array.isArray(rules?.disallow)
    ? rules.disallow
    : rules?.disallow
      ? [rules.disallow]
      : [];

  record(
    "2. Robots & Sitemap",
    "robots.txt chặn các trang nội bộ (/quan-tri, /api/, /yeu-cau-da-nhan)",
    disallowList.includes("/quan-tri") &&
      disallowList.includes("/api/") &&
      disallowList.includes("/yeu-cau-da-nhan"),
    `Disallow: ${disallowList.join(", ")}`
  );
  record(
    "2. Robots & Sitemap",
    "robots.txt khai báo Sitemap URL chuẩn",
    robotsConfig.sitemap === `${SITE_URL}/sitemap.xml`,
    `Sitemap: ${robotsConfig.sitemap}`
  );

  // 3. Kiểm tra Sitemap.xml động
  const sitemapEntries = await sitemap();
  const products = getAllProducts();
  const posts = getAllPosts(true);

  record(
    "2. Robots & Sitemap",
    "Sitemap.xml bao phủ đầy đủ Trang tĩnh + Sản phẩm + Bài viết + Chính sách",
    sitemapEntries.length >= 8 + products.length + posts.length + 4,
    `Tổng cộng ${sitemapEntries.length} URLs trong sitemap.xml (${products.length} sản phẩm, ${posts.length} bài viết)`
  );

  // 4. Kiểm tra Web App Manifest
  const manifestConfig = manifest();
  record(
    "3. Mobile & PWA",
    "Web App Manifest (/manifest.webmanifest)",
    Boolean(manifestConfig.name && manifestConfig.icons && manifestConfig.icons.length >= 2),
    `theme_color=${manifestConfig.theme_color}, icons=${manifestConfig.icons?.length ?? 0}`
  );

  // 5. Kiểm tra Metadata & Canonical các sản phẩm và bài viết
  let validProductMetaCount = 0;
  for (const p of products) {
    const meta = buildPageMetadata({
      title: `${p.name} — ${p.categoryLabel}`,
      description: `${p.shortDescription} Thành phần: ${p.ingredients.join(", ")}.`,
      path: `/san-pham/${p.slug}`,
      image: p.imageUrl,
    });
    const canonical = meta.alternates?.canonical;
    if (canonical === `${SITE_URL}/san-pham/${p.slug}` && meta.openGraph) {
      validProductMetaCount++;
    }
  }
  record(
    "4. Dynamic Metadata",
    "Metadata & Canonical cho toàn bộ trang Sản phẩm (/san-pham/[slug])",
    validProductMetaCount === products.length,
    `${validProductMetaCount}/${products.length} sản phẩm có Canonical + OpenGraph hợp lệ`
  );

  let validPostMetaCount = 0;
  for (const post of posts) {
    const meta = buildPageMetadata({
      title: post.title,
      description: post.excerpt || post.title,
      path: `/bai-viet/${post.slug}`,
      image: post.coverImageUrl,
      type: "article",
    });
    const canonical = meta.alternates?.canonical;
    if (canonical === `${SITE_URL}/bai-viet/${post.slug}` && meta.openGraph) {
      validPostMetaCount++;
    }
  }
  record(
    "4. Dynamic Metadata",
    "Metadata & Canonical cho toàn bộ Bài viết (/bai-viet/[slug])",
    validPostMetaCount === posts.length,
    `${validPostMetaCount}/${posts.length} bài viết có Canonical + Article OpenGraph hợp lệ`
  );

  // 6. Quét mã nguồn kiểm tra thẻ H1, JSON-LD Schema.org và Analytics
  const pageFilesToCheck = [
    { route: "/", file: "app/page.tsx", expectJsonLd: "FaqJsonLd" },
    { route: "/yen-tuoi-chung-nong", file: "app/yen-tuoi-chung-nong/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
    { route: "/gui-qua", file: "app/gui-qua/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
    { route: "/ve-ha-mi", file: "app/ve-ha-mi/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
    { route: "/lien-he", file: "app/lien-he/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
    { route: "/bai-viet", file: "app/bai-viet/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
    { route: "/bai-viet/[slug]", file: "app/bai-viet/[slug]/page.tsx", expectJsonLd: "ArticleJsonLd" },
    { route: "/san-pham/[slug]", file: "app/san-pham/[slug]/page.tsx", expectJsonLd: "ProductJsonLd" },
    { route: "/tuyen-dung", file: "app/tuyen-dung/page.tsx", expectJsonLd: "BreadcrumbJsonLd" },
  ];

  for (const item of pageFilesToCheck) {
    const fullPath = path.join(rootDir, item.file);
    const content = fs.readFileSync(fullPath, "utf8");
    const hasJsonLd = content.includes(item.expectJsonLd);
    record(
      "5. Schema JSON-LD",
      `Route ${item.route} nhúng ${item.expectJsonLd}`,
      hasJsonLd,
      hasJsonLd ? `Đã gắn <${item.expectJsonLd} />` : `Thiếu ${item.expectJsonLd}`
    );
  }

  const layoutContent = fs.readFileSync(path.join(rootDir, "app/layout.tsx"), "utf8");
  record(
    "5. Schema JSON-LD",
    "Root Layout nhúng OrganizationAndLocalBusinessJsonLd",
    layoutContent.includes("OrganizationAndLocalBusinessJsonLd"),
    "Khai báo Organization + FoodEstablishment + WebSite"
  );
  record(
    "6. Công cụ Đo lường",
    "Root Layout tích hợp AnalyticsScripts (GA4, GTM, FB Pixel)",
    layoutContent.includes("AnalyticsScripts"),
    "Tự động kích hoạt khi cấu hình NEXT_PUBLIC_GA_ID / GTM_ID / FB_PIXEL_ID"
  );

  // In kết quả
  const passedCount = results.filter((r) => r.passed).length;
  const score = Math.round((passedCount / results.length) * 100);

  for (const r of results) {
    const icon = r.passed ? "✅" : "❌";
    console.log(`${icon} [${r.category}] ${r.target}`);
    console.log(`   ↳ ${r.detail}`);
  }

  console.log("\n=================================================================");
  console.log(
    `🏆 ĐIỂM SỨC KHỎE KỸ THUẬT SEO: ${score}/100 (${passedCount}/${results.length} hạng mục đạt chuẩn)`
  );
  console.log("=================================================================");

  if (passedCount < results.length) {
    process.exitCode = 1;
  }
}

runSeoAudit().catch((err) => {
  console.error("Lỗi khi chạy SEO Audit:", err);
  process.exitCode = 1;
});
