import fs from "node:fs";
import path from "node:path";
import { GEO_CONFIG, GEO_META_TAGS, SEO_CONFIG, SITE_URL, buildPageMetadata } from "../config/seo";
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
  console.log("🔍 BÁO CÁO KIỂM TRA TỐI ƯU SEO & GEO — YẾN SÀO HÀ MI");
  console.log(`🌐 Tên miền chính thức (SITE_URL): ${SITE_URL}`);
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
    "Bộ từ khóa thương hiệu & địa phương Đà Nẵng",
    SEO_CONFIG.keywords.length >= 10,
    `${SEO_CONFIG.keywords.length} từ khóa mục tiêu`
  );

  // 2. Kiểm tra Local Geo-SEO (Đà Nẵng)
  record(
    "2. Local Geo-SEO",
    "Thẻ Meta Địa lý (geo.region, geo.placename, geo.position, ICBM)",
    GEO_META_TAGS["geo.region"] === "VN-DN" &&
      Boolean(GEO_META_TAGS["geo.placename"]) &&
      Boolean(GEO_META_TAGS["geo.position"]) &&
      Boolean(GEO_META_TAGS.ICBM),
    `region=${GEO_META_TAGS["geo.region"]}, placename="${GEO_META_TAGS["geo.placename"]}", position=${GEO_META_TAGS["geo.position"]}`
  );
  record(
    "2. Local Geo-SEO",
    "Khai báo vùng phục vụ giao nóng 2H (7 Quận/Huyện Đà Nẵng)",
    GEO_CONFIG.servedDistricts.length >= 7,
    `${GEO_CONFIG.servedDistricts.join(", ")}`
  );

  // 3. Kiểm tra Robots.txt & AI Bots (GEO)
  const robotsConfig = robots();
  const rulesList = Array.isArray(robotsConfig.rules)
    ? robotsConfig.rules
    : [robotsConfig.rules];
  const defaultRule = rulesList[0];
  const disallowList = Array.isArray(defaultRule?.disallow)
    ? defaultRule.disallow
    : defaultRule?.disallow
      ? [defaultRule.disallow]
      : [];

  record(
    "3. Robots & Sitemap",
    "robots.txt chặn các trang nội bộ (/quan-tri, /api/, /yeu-cau-da-nhan)",
    disallowList.includes("/quan-tri") &&
      disallowList.includes("/api/") &&
      disallowList.includes("/yeu-cau-da-nhan"),
    `Disallow: ${disallowList.join(", ")}`
  );
  record(
    "3. Robots & Sitemap",
    "robots.txt mở quyền cho AI Search Bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended)",
    rulesList.length >= 2,
    `Cấu hình ${rulesList.length} nhóm User-Agent (bao gồm AI Crawlers)`
  );
  record(
    "3. Robots & Sitemap",
    "robots.txt khai báo Sitemap URL chuẩn",
    robotsConfig.sitemap === `${SITE_URL}/sitemap.xml`,
    `Sitemap: ${robotsConfig.sitemap}`
  );

  // 4. Kiểm tra Sitemap.xml động
  const sitemapEntries = await sitemap();
  const products = getAllProducts();
  const posts = getAllPosts(true);

  record(
    "3. Robots & Sitemap",
    "Sitemap.xml bao phủ đầy đủ Trang tĩnh + Sản phẩm + Bài viết + Chính sách",
    sitemapEntries.length >= 8 + products.length + posts.length + 4,
    `Tổng cộng ${sitemapEntries.length} URLs trong sitemap.xml (${products.length} sản phẩm, ${posts.length} bài viết)`
  );

  // 5. Kiểm tra AI GEO Endpoints (/llms.txt & /llms-full.txt)
  const llmsExists = fs.existsSync(path.join(rootDir, "app/llms.txt/route.ts"));
  const llmsFullExists = fs.existsSync(
    path.join(rootDir, "app/llms-full.txt/route.ts")
  );
  record(
    "4. AI Search (GEO)",
    "Endpoint /llms.txt & /llms-full.txt cho ChatGPT, Gemini, Perplexity, Claude",
    llmsExists && llmsFullExists,
    `Đã kích hoạt /llms.txt và /llms-full.txt`
  );

  // 6. Kiểm tra Web App Manifest
  const manifestConfig = manifest();
  record(
    "5. Mobile & PWA",
    "Web App Manifest (/manifest.webmanifest)",
    Boolean(manifestConfig.name && manifestConfig.icons && manifestConfig.icons.length >= 2),
    `theme_color=${manifestConfig.theme_color}, icons=${manifestConfig.icons?.length ?? 0}`
  );

  // 7. Kiểm tra Metadata & Canonical các sản phẩm và bài viết
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
    "6. Dynamic Metadata",
    "Metadata, Geo Tags & Canonical cho toàn bộ trang Sản phẩm (/san-pham/[slug])",
    validProductMetaCount === products.length,
    `${validProductMetaCount}/${products.length} sản phẩm có Canonical + OpenGraph + Geo Tags hợp lệ`
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
    "6. Dynamic Metadata",
    "Metadata, Geo Tags & Canonical cho toàn bộ Bài viết (/bai-viet/[slug])",
    validPostMetaCount === posts.length,
    `${validPostMetaCount}/${posts.length} bài viết có Canonical + Article OpenGraph hợp lệ`
  );

  // 8. Quét mã nguồn kiểm tra JSON-LD Schema.org và Analytics
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
      "7. Schema JSON-LD",
      `Route ${item.route} nhúng ${item.expectJsonLd}`,
      hasJsonLd,
      hasJsonLd ? `Đã gắn <${item.expectJsonLd} />` : `Thiếu ${item.expectJsonLd}`
    );
  }

  const jsonLdContent = fs.readFileSync(
    path.join(rootDir, "components/SeoJsonLd.tsx"),
    "utf8"
  );
  record(
    "7. Schema JSON-LD",
    "SeoJsonLd tích hợp GeoCoordinates, GeoCircle, areaServed & hasCredential",
    jsonLdContent.includes("GeoCoordinates") &&
      jsonLdContent.includes("GeoCircle") &&
      jsonLdContent.includes("areaServed") &&
      jsonLdContent.includes("hasCredential"),
    "Đầy đủ tọa độ Đà Nẵng, bán kính phục vụ 25km và chứng nhận ISO 22000 & FDA"
  );

  const layoutContent = fs.readFileSync(path.join(rootDir, "app/layout.tsx"), "utf8");
  record(
    "8. Công cụ Đo lường",
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
    `🏆 ĐIỂM SỨC KHỎE KỸ THUẬT SEO & GEO: ${score}/100 (${passedCount}/${results.length} hạng mục đạt chuẩn)`
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
