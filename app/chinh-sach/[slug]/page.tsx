import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { buildPageMetadata } from "@/config/seo";

const POLICIES: Record<
  string,
  {
    title: string;
    subtitle: string;
    sections: { heading: string; body: string }[];
  }
> = {
  "giao-nhan": {
    title: "Chính Sách Giao Nhận & Giữ Ấm 2H",
    subtitle:
      "Quy định về vùng phục vụ giao nóng trong 2 giờ, ưu đãi miễn phí giao hàng và bảo quản thố yến sứ 200ml.",
    sections: [
      {
        heading: "1. Chưng mới theo đơn & Giao ấm nóng trong 2 giờ",
        body: "Yến Tươi Chưng Nóng (35g yến tươi thật/thố 200ml) được chưng thủ công tươi nóng ngay khi nhận đơn và giao ấm nóng trong vòng 2 giờ tại Đà Nẵng. Đặt từ 2 thố trở lên được miễn phí giao hàng trong bán kính 5km.",
      },
      {
        heading: "2. Phân vùng phục vụ tại Đà Nẵng",
        body: "Khu vực trung tâm được áp dụng biểu phí giao tiêu chuẩn (miễn phí khi đặt từ 2 thố trong bán kính 5km). Với các khu vực xa trung tâm (như Cẩm Lệ, Liên Chiểu), Hà Mi tiếp nhận yêu cầu và báo phí giao thực tế khi gọi xác nhận. Các khu vực ngoài bán kính giữ nóng tiêu chuẩn sẽ được thông báo rõ để khách hàng chủ động.",
      },
      {
        heading: "3. Kiểm tra khi nhận hàng",
        body: "Khi nhận thố yến, người nhận vui lòng kiểm tra tem niêm phong, độ ấm của thố sứ và thiệp quà đi kèm (nếu có).",
      },
    ],
  },
  "thanh-toan": {
    title: "Quy Trình Xác Nhận & Thanh Toán",
    subtitle:
      "Website nhận yêu cầu đặt món — chỉ hướng dẫn thanh toán sau khi Hà Mi đã xác nhận đơn.",
    sections: [
      {
        heading: "1. Chưa thu tiền tự động khi gửi yêu cầu",
        body: "Để đảm bảo khung giờ giao hàng thuận tiện nhất và kiểm tra địa chỉ thuộc vùng giao nóng, website Yến Sào Hà Mi không tự động thu tiền trực tuyến tại bước gửi biểu mẫu.",
      },
      {
        heading: "2. Xác nhận tổng tiền tại máy chủ",
        body: "Mọi đơn giá món yến, phụ phí hộp quà và phí giao hàng đều được kiểm tra lại tại máy chủ. Sau khi nhân viên Hà Mi gọi xác nhận đơn hàng, khách hàng sẽ nhận hướng dẫn thanh toán chuyển khoản hoặc thanh toán khi nhận hàng tùy theo loại đơn (mua dùng hoặc gửi quà).",
      },
    ],
  },
  "doi-huy": {
    title: "Chính Sách Thay Đổi & Hủy Yêu Cầu",
    subtitle:
      "Hỗ trợ điều chỉnh khung giờ hoặc hủy yêu cầu trước khi bếp lên lửa chưng yến.",
    sections: [
      {
        heading: "1. Thay đổi hoặc hủy trước khi bếp chưng",
        body: "Vì sản phẩm là Yến Tươi Chưng Nóng chế biến mới ngay khi nhận đơn, khách hàng có thể thay đổi khẩu vị, giờ giao hoặc hủy yêu cầu hoàn toàn miễn phí khi đơn đang ở trạng thái 'Chờ Hà Mi xác nhận' hoặc trước khi bếp bắt đầu chưng.",
      },
      {
        heading: "2. Giải phóng hạn mức khung giờ giao hàng",
        body: "Khi một yêu cầu được hủy hợp lệ, hệ thống tự động hoàn trả số lượng thố vào hạn mức của khung giờ giao hàng trong ngày đó để phục vụ các khách hàng khác.",
      },
    ],
  },
  "quyen-rieng-tu": {
    title: "Bảo Mật Thông Tin Người Mua & Người Nhận Quà",
    subtitle:
      "Cam kết bảo vệ thông tin liên hệ, địa chỉ và lời nhắn thiệp quà của khách hàng.",
    sections: [
      {
        heading: "1. Mục đích sử dụng thông tin",
        body: "Họ tên, số điện thoại và địa chỉ của người đặt cũng như người nhận quà chỉ được sử dụng duy nhất cho mục đích liên hệ xác nhận đơn, chuẩn bị thiệp quà và giao thố yến.",
      },
      {
        heading: "2. Bảo mật tra cứu đơn hàng",
        body: "Mỗi yêu cầu đặt món được cấp một Mã yêu cầu kèm Mã bảo mật tra cứu riêng (lookupToken). Người chỉ biết mã tham chiếu mà không có mã bảo mật sẽ không thể xem được thông tin người mua, người nhận hay lời chúc trên thiệp.",
      },
      {
        heading: "3. Tùy chọn ẩn giá trên phiếu giao quà",
        body: "Khi chọn chế độ 'Gửi quà biếu', khách hàng có thể bật tùy chọn ẩn toàn bộ giá tiền trên phiếu giao hàng gửi tới người nhận.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) {
    return buildPageMetadata({
      title: "Chính Sách Phục Vụ",
      description: "Quy định giao nhận, thanh toán và bảo mật tại Yến Sào Hà Mi.",
      path: `/chinh-sach/${slug}`,
    });
  }
  return buildPageMetadata({
    title: policy.title,
    description: policy.subtitle,
    path: `/chinh-sach/${slug}`,
  });
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="bg-[#FDFBF7] max-w-3xl mx-auto px-4 py-10 md:py-14 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Trang chủ</span>
      </Link>

      <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="rounded-2xl bg-[#FFE9DD] p-5 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7C4D2B] bg-white/85 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" />
            Chính sách phục vụ Hà Mi
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1B1B1B]">
            {policy.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#2B433A]">{policy.subtitle}</p>
        </div>

        <div className="space-y-5">
          {policy.sections.map((sec) => (
            <section key={sec.heading} className="rounded-2xl bg-[#FAF4EB] p-5 space-y-1.5">
              <h2 className="font-serif-display text-lg font-bold text-[#1B4332]">
                {sec.heading}
              </h2>
              <p className="text-xs sm:text-sm text-[#2B433A] leading-relaxed">{sec.body}</p>
            </section>
          ))}
        </div>

        <div className="pt-4 border-t border-[#E6DAC6] flex flex-wrap gap-2">
          {Object.entries(POLICIES).map(([key, item]) => (
            <Link
              key={key}
              href={`/chinh-sach/${key}`}
              className={`text-xs px-4 py-2 rounded-full transition ${
                key === slug
                  ? "bg-[#1B4332] text-white font-bold"
                  : "bg-[#FAF4EB] text-[#2B433A] hover:bg-[#FFE9DD]"
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
