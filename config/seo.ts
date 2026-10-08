import type { Metadata } from "next";
import { BRAND_CONFIG } from "./brand";
import { isPreviewDeployment } from "@/lib/deployment-policy";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://yenhami.com"
).replace(/\/$/, "");

export const IS_PREVIEW_DEPLOYMENT = isPreviewDeployment(process.env.VERCEL_ENV);

export const GEO_CONFIG = {
  region: "VN-DN",
  placename: "Đà Nẵng, Việt Nam",
  latitude: 16.0544,
  longitude: 108.2022,
  positionString: "16.0544;108.2022",
  icbmString: "16.0544, 108.2022",
  serviceRadiusMeters: 25000,
  servedDistricts: [
    "Quận Hải Châu",
    "Quận Thanh Khê",
    "Quận Sơn Trà",
    "Quận Ngũ Hành Sơn",
    "Quận Cẩm Lệ",
    "Quận Liên Chiểu",
    "Huyện Hòa Vang",
  ],
};

export const GEO_META_TAGS: Record<string, string> = {
  "geo.region": GEO_CONFIG.region,
  "geo.placename": GEO_CONFIG.placename,
};

export const SEO_CONFIG = {
  siteUrl: SITE_URL,
  siteName: BRAND_CONFIG.brandName,
  shortName: BRAND_CONFIG.shortName,
  locale: "vi_VN",
  defaultTitle: "Yến Sào Đà Nẵng | Hà Mi",
  titleTemplate: "%s | Yến Sào Hà Mi",
  defaultDescription:
    "Yến Sào Hà Mi tại Đà Nẵng: yến tươi chưng nóng, yến hũ chưng sẵn, yến tinh chế và quà tặng. Xem sản phẩm và gửi yêu cầu đặt hàng để Hà Mi xác nhận.",
  defaultOgImage: "/brand/hero-desktop-clean.jpg",
  geo: GEO_CONFIG,
  keywords: [
    "yến sào hà mi",
    "yến sào đà nẵng",
    "yến tươi chưng nóng",
    "yến chưng nóng đà nẵng",
    "yến chưng nóng giao ngay đà nẵng",
    "yến chưng thố sứ",
    "quà biếu sức khỏe đà nẵng",
    "set quà yến sào",
    "yến hũ chưng sẵn",
    "yến sào tinh chế",
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
  const fullSocialTitle = title.includes(SEO_CONFIG.siteName)
    ? title
    : `${title} | ${SEO_CONFIG.siteName}`;
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
    other: {
      ...GEO_META_TAGS,
    },
    openGraph: {
      title: fullSocialTitle,
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
      title: fullSocialTitle,
      description,
      images: [ogImageUrl],
    },
    robots: noIndex || IS_PREVIEW_DEPLOYMENT
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
