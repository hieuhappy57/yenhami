import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { SEO_CONFIG, absoluteUrl } from "@/config/seo";
import type { PostRecord, ProductRecord } from "@/db/schema";

export function OrganizationAndLocalBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SEO_CONFIG.siteUrl}/#organization`,
        name: BRAND_CONFIG.brandName,
        alternateName: "Yến Tươi Chưng Nóng Hà Mi",
        url: SEO_CONFIG.siteUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/ha-mi-logo-web-640.png"),
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BRAND_CONFIG.contact.hotlineTel || "0935052959",
          contactType: "customer service",
          areaServed: "VN",
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
        priceRange: "295000VND - 5500000VND",
        servesCuisine: "Yến Tươi Chưng Nóng & Yến Sào Thượng Hạng",
        address: {
          "@type": "PostalAddress",
          streetAddress: BRAND_CONFIG.contact.addressDisplay,
          addressLocality: "Đà Nẵng",
          addressRegion: "Đà Nẵng",
          addressCountry: "VN",
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
