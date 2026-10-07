import type { Metadata } from "next";
import DatHangPage from "@/app/dat-hang/page";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildPageMetadata({
  title: "Giỏ Hàng & Đặt Món Yến Tươi Chưng Nóng",
  description: "Kiểm tra giỏ hàng và gửi yêu cầu đặt món Yến Tươi Chưng Nóng Hà Mi.",
  path: "/dat-hang",
  noIndex: true,
});

export default DatHangPage;
