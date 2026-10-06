import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const POLICIES: Record<
  string,
  {
    title: string;
    subtitle: string;
    sections: { heading: string; body: string }[];
  }
> = {
  "giao-nhan": {
    title: "Chính Sách Giao Nhận & Giữ Ấm",
    subtitle:
      "Quy định về vùng phục vụ giao nóng, khung giờ ca bếp và bảo quản thố yến sứ 200ml.",
    sections: [
      {
        heading: "1. Giao theo khung giờ ca bếp đã xác nhận",
        body: "Yến Tươi Chưng Nóng được chưng mới theo từng ca bếp. Thời gian giao hàng thực tế chỉ được ấn định sau khi nhân viên Hà Mi liên hệ xác nhận yêu cầu đặt món với khách hàng.",
      },
      {
        heading: "2. Phân vùng phục vụ tại Đà Nẵng",
        body: "Khu vực trung tâm được áp dụng biểu phí giao tiêu chuẩn. Với các khu vực xa trung tâm (như Cẩm Lệ, Liên Chiểu), Hà Mi tiếp nhận yêu cầu và báo phí giao thực tế khi gọi xác nhận. Các khu vực ngoài bán kính giữ nóng tiêu chuẩn sẽ được thông báo rõ để khách hàng chủ động.",
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
        body: "Để tránh trường hợp ca bếp đã đầy hoặc địa chỉ nằm ngoài vùng giao nóng, website Yến Sào Hà Mi không tự động thu tiền trực tuyến tại bước gửi biểu mẫu.",
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
        body: "Vì sản phẩm là Yến Tươi Chưng Nóng chế biến mới theo đơn, khách hàng có thể thay đổi khẩu vị, giờ giao hoặc hủy yêu cầu hoàn toàn miễn phí khi đơn đang ở trạng thái 'Chờ Hà Mi xác nhận' hoặc trước khi bếp bắt đầu chưng.",
      },
      {
        heading: "2. Giải phóng năng lực ca bếp",
        body: "Khi một yêu cầu được hủy hợp lệ, hệ thống tự động hoàn trả số lượng thố vào hạn mức của ca bếp trong ngày đó để phục vụ các khách hàng khác.",
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
    return { title: "Chính sách phục vụ | Yến Sào Hà Mi" };
  }
  return {
    title: `${policy.title} | Yến Sào Hà Mi`,
    description: policy.subtitle,
  };
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
    <div className="max-w-3xl mx-auto px-4 pr-16 md:pr-4 py-10 md:py-14 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#155132] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Trang chủ</span>
      </Link>

      <div className="rounded-3xl border border-[#155132]/20 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-[#155132]/12 pb-5 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#155132]" />
            Chính sách phục vụ Hà Mi
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#155132]">
            {policy.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#2B433A]/85">{policy.subtitle}</p>
        </div>

        <div className="space-y-5">
          {policy.sections.map((sec) => (
            <section key={sec.heading} className="space-y-1.5">
              <h2 className="font-serif-display text-lg font-semibold text-[#155132]">
                {sec.heading}
              </h2>
              <p className="text-sm text-[#2B433A] leading-relaxed">{sec.body}</p>
            </section>
          ))}
        </div>

        <div className="pt-4 border-t border-[#155132]/12 flex flex-wrap gap-2">
          {Object.entries(POLICIES).map(([key, item]) => (
            <Link
              key={key}
              href={`/chinh-sach/${key}`}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                key === slug
                  ? "bg-[#155132] text-[#FFFCF4] border-[#BD9342] font-semibold"
                  : "bg-[#FFFCF4] text-[#2B433A] border-[#155132]/20 hover:border-[#155132]"
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
