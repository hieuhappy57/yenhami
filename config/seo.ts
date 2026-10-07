import type { Metadata } from "next";
import { BRAND_CONFIG } from "./brand";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://yenhami.vercel.app"
).replace(/\/$/, "");

export const SEO_CONFIG = {
  siteUrl: SITE_URL,
  siteName: BRAND_CONFIG.brandName,
  shortName: BRAND_CONFIG.shortName,
  locale: "vi_VN",
  defaultTitle:
    "Yến Sào Hà Mi — Yến Tươi Chưng Nóng Giao Ngay 2H Tại Đà Nẵng",
  titleTemplate: "%s | Yến Sào Hà Mi",
  defaultDescription:
    "Thố yến tươi chưng nóng 200ml (35g yến tươi thật) từ 295.000đ, giao ấm nóng 2H tại Đà Nẵng. Quà biếu mẹ bầu, người bệnh, ông bà chuẩn ISO 22000 & FDA Hoa Kỳ.",
  defaultOgImage: "/brand/hero-desktop-clean.jpg",
  keywords: [
    "yến sào hà mi",
    "yến tươi chưng nóng",
    "yến chưng nóng đà nẵng",
    "yến chưng thố sứ",
    "quà biếu sức khỏe đà nẵng",
    "set quà yến sào",
    "yến hũ chưng sẵn",
    "yến sào tinh chế",
    "yến chưng cho bà bầu",
    "yến chưng thăm bệnh",
    "yến sào chuẩn ISO 22000",
    "yến sào FDA Hoa Kỳ",
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || "",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
    fbPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
  },
};

export function absoluteUrl(path = "/"): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  keywords,
  noIndex = false,
}: PageSeoInput): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const ogImageUrl = absoluteUrl(image || SEO_CONFIG.defaultOgImage);
  const mergedKeywords = keywords
    ? Array.from(new Set([...keywords, ...SEO_CONFIG.keywords]))
    : SEO_CONFIG.keywords;

  return {
    title,
    description,
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SEO_CONFIG.siteName}`,
      description,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime,
            modifiedTime,
            authors: [SEO_CONFIG.siteName],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SEO_CONFIG.siteName}`,
      description,
      images: [ogImageUrl],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
