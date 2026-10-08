import type { Metadata } from "next";
import { Be_Vietnam_Pro, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingActionRail } from "@/components/FloatingActionRail";
import { MobileStickyCartBar } from "@/components/MobileStickyCartBar";
import { OrganizationAndLocalBusinessJsonLd } from "@/components/SeoJsonLd";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { SEO_CONFIG, absoluteUrl } from "@/config/seo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const brandSerif = Playfair_Display({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
  variable: "--font-brand-serif",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: SEO_CONFIG.titleTemplate,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: SEO_CONFIG.keywords,
  applicationName: SEO_CONFIG.siteName,
  authors: [{ name: SEO_CONFIG.siteName, url: SEO_CONFIG.siteUrl }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  alternates: {
    canonical: SEO_CONFIG.siteUrl,
  },
  verification: SEO_CONFIG.verification,
  icons: {
    icon: [
      { url: "/brand/ha-mi-favicon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/brand/ha-mi-favicon-512.png"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [
      {
        url: absoluteUrl(SEO_CONFIG.defaultOgImage),
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.defaultTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [absoluteUrl(SEO_CONFIG.defaultOgImage)],
  },
  robots: {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${brandSerif.variable} ${beVietnamPro.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#2B433A] font-sans antialiased selection:bg-[#155132] selection:text-[#FFFCF4]">
        <OrganizationAndLocalBusinessJsonLd />
        <AnalyticsScripts />
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <FloatingActionRail />
          <MobileStickyCartBar />
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
