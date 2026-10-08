import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { GEO_CONFIG, SEO_CONFIG, absoluteUrl } from "@/config/seo";
import type { PostRecord, ProductRecord } from "@/db/schema";

export function OrganizationAndLocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SEO_CONFIG.siteUrl}/#organization`,
        name: BRAND_CONFIG.brandName,
        alternateName: ["Yến Tươi Chưng Nóng Hà Mi", "Yến Sào Hà Mi Đà Nẵng"],
        url: SEO_CONFIG.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/ha-mi-logo-web-640.png"),
        },
        description: SEO_CONFIG.defaultDescription,
        knowsAbout: [
          "Yến tươi chưng nóng thố sứ 200ml",
          "Giao yến chưng nóng hỏa tốc 2 giờ tại Đà Nẵng",
          "Yến sào tinh chế chuẩn ISO 22000:2018 & FDA Hoa Kỳ",
          "Quà biếu sức khỏe cho mẹ bầu, người bệnh, người cao tuổi",
          "Set quà tặng yến sào thượng hạng",
        ],
        hasCredential: [
          {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "Food Safety Management System",
            name: "ISO 22000:2018",
          },
          {
            "@type": "EducationalOccupationalCredential",
            credentialCategory: "International Registration",
            name: "FDA Hoa Kỳ (US Food and Drug Administration)",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BRAND_CONFIG.contact.hotlineTel || "0935052959",
          email: BRAND_CONFIG.contact.emailDisplay || "cskh@yenhami.com",
          contactType: "customer service",
          areaServed: ["VN-DN", "VN"],
          availableLanguage: ["Vietnamese"],
        },
        sameAs: BRAND_CONFIG.contact.zaloUrl
          ? [BRAND_CONFIG.contact.zaloUrl]
          : [],
      },
      {
        "@type": ["LocalBusiness", "HealthFoodStore", "FoodEstablishment"],
        "@id": `${SEO_CONFIG.siteUrl}/#localbusiness`,
        name: BRAND_CONFIG.brandName,
        image: absoluteUrl(SEO_CONFIG.defaultOgImage),
        url: SEO_CONFIG.siteUrl,
        telephone: BRAND_CONFIG.contact.hotlineDisplay || "0935 052 959",
        email: BRAND_CONFIG.contact.emailDisplay || "cskh@yenhami.com",
        priceRange: "295000VND - 5500000VND",
        servesCuisine: "Yến Tươi Chưng Nóng & Yến Sào Thượng Hạng",
        address: {
          "@type": "PostalAddress",
          streetAddress: BRAND_CONFIG.contact.addressDisplay,
          addressLocality: "Đà Nẵng",
          addressRegion: "Đà Nẵng",
          postalCode: "550000",
          addressCountry: "VN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: GEO_CONFIG.latitude,
          longitude: GEO_CONFIG.longitude,
        },
        areaServed: [
          {
            "@type": "City",
            name: "Đà Nẵng",
            sameAs: "https://vi.wikipedia.org/wiki/%C4%90%C3%A0_N%E1%BA%B5ng",
          },
          ...GEO_CONFIG.servedDistricts.map((district) => ({
            "@type": "AdministrativeArea",
            name: `${district}, Đà Nẵng`,
          })),
          {
            "@type": "GeoCircle",
            geoMidpoint: {
              "@type": "GeoCoordinates",
              latitude: GEO_CONFIG.latitude,
              longitude: GEO_CONFIG.longitude,
            },
            geoRadius: GEO_CONFIG.serviceRadiusMeters,
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Danh mục sản phẩm Yến Sào Hà Mi",
          itemListElement: [
            {
              "@type": "OfferCatalog",
              name: "Yến Tươi Chưng Nóng Thố Sứ 200ml (35g yến tươi thật) — Giao Nóng 2H Đà Nẵng",
              url: absoluteUrl("/yen-tuoi-chung-nong"),
            },
            {
              "@type": "OfferCatalog",
              name: "Set Quà Biếu Yến Sào Hoa Sen & Đàn Én Thượng Hạng",
              url: absoluteUrl("/gui-qua"),
            },
          ],
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "08:00",
            closes: "21:00",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SEO_CONFIG.siteUrl}/#website`,
        url: SEO_CONFIG.siteUrl,
        name: SEO_CONFIG.siteName,
        description: SEO_CONFIG.defaultDescription,
        inLanguage: "vi-VN",
        publisher: {
          "@id": `${SEO_CONFIG.siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ProductJsonLd({ product }: { product: ProductRecord }) {
  const productUrl = absoluteUrl(`/san-pham/${product.slug}`);
  const availability =
    product.status === "AVAILABLE"
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description: `${product.shortDescription} Thành phần: ${product.ingredients.join(", ")}. Khẩu vị: ${product.tasteProfile}.`,
        image: [absoluteUrl(product.imageUrl)],
        sku: product.id,
        category: product.categoryLabel,
        brand: {
          "@type": "Brand",
          name: BRAND_CONFIG.brandName,
        },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: "VND",
          price: product.priceVnd ?? 295000,
          availability,
          itemCondition: "https://schema.org/NewCondition",
          areaServed: {
            "@type": "City",
            name: "Đà Nẵng",
          },
          seller: {
            "@type": "Organization",
            name: BRAND_CONFIG.brandName,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Thực đơn & Sản phẩm",
            item: absoluteUrl("/yen-tuoi-chung-nong"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: productUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleJsonLd({ post }: { post: PostRecord }) {
  const postUrl = absoluteUrl(`/bai-viet/${post.slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#article`,
        headline: post.title,
        description: post.excerpt || post.title,
        image: [absoluteUrl(post.coverImageUrl)],
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        articleSection: post.category,
        inLanguage: "vi-VN",
        contentLocation: {
          "@type": "Place",
          name: "Đà Nẵng, Việt Nam",
        },
        author: {
          "@type": "Organization",
          name: BRAND_CONFIG.brandName,
          url: SEO_CONFIG.siteUrl,
        },
        publisher: {
          "@type": "Organization",
          name: BRAND_CONFIG.brandName,
          logo: {
            "@type": "ImageObject",
            url: absoluteUrl("/brand/ha-mi-logo-web-640.png"),
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Bài viết & Kiến thức",
            item: absoluteUrl("/bai-viet"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
