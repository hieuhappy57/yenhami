import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingActionRail } from "@/components/FloatingActionRail";
import { MobileStickyCartBar } from "@/components/MobileStickyCartBar";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yến Sào Hà Mi — Yến Tươi Chưng Nóng | Chưng điều lành, trao người thương",
  description:
    "Thố yến tươi chưng nóng chuẩn bị chỉn chu cho những lần thăm hỏi và chăm người thân. Minh bạch thành phần, dễ chọn theo khẩu vị, gửi yêu cầu đặt món và Hà Mi xác nhận.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${plusJakarta.variable} ${beVietnamPro.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-[#2B433A] font-sans antialiased selection:bg-[#155132] selection:text-[#FFFCF4]">
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
