import type { Metadata } from "next";
import { buildPageMetadata } from "@/config/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Quản Trị Vận Hành & Nội Dung",
  description: "Hệ thống quản trị nội bộ Yến Sào Hà Mi.",
  path: "/quan-tri",
  noIndex: true,
});

export default function QuanTriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
