import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Flame,
  HeartHandshake,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Về Yến Sào Hà Mi — Chuẩn ISO 22000:2018 & FDA Hoa Kỳ | lehami.vn",
  description:
    "Tìm hiểu câu chuyện thương hiệu Yến Sào Hà Mi: Yến sào thật – Tinh khiết – Thượng hạng, nhà máy đạt chuẩn ISO 22000:2018 và chứng nhận FDA Hoa Kỳ.",
};

export default function VeHaMiPage() {
  return (
    <div className="max-w-[1060px] mx-auto px-4 pr-16 md:pr-4 py-10 md:py-14 space-y-10">
      {/* 1. Hero Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#155132]/15 pb-8">
        <div className="lg:col-span-7 space-y-3.5">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#8A6632] bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 rounded-full">
            Món quà của sự an tâm • Chạm đến sự bình yên
          </span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#155132]">
            Yến Sào Hà Mi — Chất Từng Sợi Yến
          </h1>
          <p className="text-sm sm:text-base text-[#2B433A]/90 leading-relaxed">
            Hà Mi toàn tâm toàn ý ghi lại tinh túy của thiên nhiên và giữ trọn dưỡng
            chất tự nhiên trong từng sợi yến để mang đến cho bạn và những người thân
            yêu sự bồi bổ thuần khiết trong từng ngụm yến.
          </p>
          <div className="rounded-xl bg-[#FFFCF4] border border-[#BD9342]/40 p-4 text-xs sm:text-sm font-semibold text-[#155132]">
            Điều làm nên sự khác biệt của Hà Mi: YẾN SÀO THẬT – TINH KHIẾT – THƯỢNG HẠNG –
            DINH DƯỠNG CAO – LỢI ÍCH THỰC CHO SỨC KHỎE!
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/85 leading-relaxed">
            Hoạt động dựa trên nguyên tắc{" "}
            <strong className="text-[#155132]">Tự nhiên – Chất lượng – Minh bạch</strong>,
            Hà Mi nỗ lực trở thành lựa chọn hàng đầu của những khách hàng quý trọng các
            sản phẩm tự nhiên và luôn quan tâm đến sự khỏe mạnh bền vững.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <img
            src="/brand/catalog/set-qua-hop-sen-en.jpg"
            alt="Hộp quà Yến Sào Thượng Hạng Hà Mi"
            className="w-full h-48 sm:h-56 object-cover rounded-xl border border-[#BD9342]/35"
          />
          <img
            src="/brand/catalog/yen-tinh-che-to-yen.jpg"
            alt="Tổ yến tinh chế nguyên bản Hà Mi"
            className="w-full h-48 sm:h-56 object-cover rounded-xl border border-[#BD9342]/35"
          />
        </div>
      </div>

      {/* 2. Nguồn nguyên liệu & Năng lực sản xuất (ISO 22000:2018 & FDA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white border border-[#155132]/15 p-6 space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-2 text-[#155132]">
            <Sparkles className="w-5 h-5 text-[#BD9342]" />
            <h2 className="font-serif-display text-xl font-bold">Nguồn nguyên liệu tuyển chọn</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Hà Mi tự hào là đơn vị trực tiếp khai thác và hợp tác với{" "}
            <strong>hàng trăm nhà yến đạt chuẩn</strong> tại các vùng chim yến nổi tiếng
            của Việt Nam, nơi có tổ yến cho hàm lượng protein cao. Chúng tôi giữ vững
            cam kết kiên định về chất lượng tốt nhất thông qua các tiêu chuẩn thu mua
            khắt khe.
          </p>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Về quy trình sơ chế Yến Tinh Chế, Hà Mi áp dụng phương pháp{" "}
            <strong>làm ẩm nhẹ và rút lông đại thủ công</strong> để hạn chế tối đa việc
            tổ yến tiếp xúc với nước — hoàn toàn không chất tẩy trắng, không chất độn
            (mủ trôm), không thêm muối hay đường.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#155132]/15 p-6 space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-2 text-[#155132]">
            <Award className="w-5 h-5 text-[#BD9342]" />
            <h2 className="font-serif-display text-xl font-bold">
              Năng lực sản xuất • ISO 22000:2018 & FDA
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Hà Mi vận hành các cơ sở sản xuất yến sào và các sản phẩm thực phẩm liên
            quan đạt tiêu chuẩn quản lý quốc tế{" "}
            <strong className="text-[#155132]">ISO 22000:2018</strong> và được khẳng
            định thêm bởi chứng nhận{" "}
            <strong className="text-[#155132]">
              FDA của Cục Quản lý Thực phẩm và Dược phẩm Hoa Kỳ
            </strong>
            .
          </p>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Nhà máy được trang bị các phòng chức năng chuyên dụng và{" "}
            <strong>hệ thống lọc nước đóng chai RO tinh khiết toàn diện</strong>, được
            sử dụng xuyên suốt từ khâu sơ chế yến thô đến khi ra thành phẩm.
          </p>
        </div>
      </div>

      {/* 3. Nhân sự, Triết lý & Tầm nhìn thị trường */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/35 p-6 space-y-2.5">
          <div className="inline-flex items-center gap-2 text-[#155132]">
            <HeartHandshake className="w-5 h-5 text-[#155132]" />
            <h2 className="font-serif-display text-xl font-bold">Nhân sự & Triết lý</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Yếu tố con người nằm ở trung tâm của Hà Mi. Đội ngũ tận tụy gồm những chuyên
            gia đam mê, được đào tạo bài bản với chuyên môn sâu rộng và tinh thần trách
            nhiệm cao. Hà Mi tin rằng chỉ khi tình yêu được nuôi dưỡng và tinh chế trong
            từng sợi yến, sản phẩm mới có thể đến tay khách hàng ở hình thái quý giá và
            giá trị nhất.
          </p>
        </div>

        <div className="rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/35 p-6 space-y-2.5">
          <div className="inline-flex items-center gap-2 text-[#155132]">
            <ShieldCheck className="w-5 h-5 text-[#155132]" />
            <h2 className="font-serif-display text-xl font-bold">Tầm nhìn & Thị trường</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed">
            Hà Mi sở hữu công thức độc quyền cho dòng Yến chưng sẵn & Yến tươi chưng
            nóng không chất bảo quản. Sản phẩm được tin chọn bởi khách hàng cá nhân,
            các tập đoàn, tổ chức tài chính và công ty dược phẩm hàng đầu Việt Nam làm
            quà tặng doanh nghiệp cao cấp, đồng thời từng bước vươn ra thị trường xuất
            khẩu quốc tế.
          </p>
        </div>
      </div>

      {/* 4. Hệ sinh thái 4 dòng sản phẩm & Liên hệ chính thức */}
      <div className="rounded-2xl bg-white border border-[#155132]/20 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#155132]/10 pb-4">
          <div>
            <h2 className="font-serif-display text-2xl font-bold text-[#155132]">
              Thông tin liên hệ chính thức — Yến Sào Hà Mi
            </h2>
            <p className="text-xs sm:text-sm text-[#8A6632] mt-0.5">
              Món quà an yên — Khẽ chạm vào miền an nhiên
            </p>
          </div>
          <Link
            href="/dat-hang"
            className="inline-flex items-center justify-center min-h-[42px] px-5 py-2 rounded-lg bg-[#155132] border border-[#BD9342] text-xs sm:text-sm font-bold text-[#FFFCF4] hover:bg-[#0e3b23]"
          >
            Đặt món trực tuyến →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-[#2B433A]">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#155132] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#155132]">Địa chỉ:</strong>
              <span>Thôn Bà Rén, Xã Xuân Phú, Thành phố Đà Nẵng, Việt Nam</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-[#155132] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#155132]">Hotline tư vấn & đặt hàng:</strong>
              <a
                href="tel:0935052959"
                className="font-semibold text-[#8A6632] hover:underline"
              >
                0935 052 959
              </a>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Flame className="w-4 h-4 text-[#155132] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#155132]">Website & Giờ phục vụ:</strong>
              <span>lehami.vn • Giao hàng 08:00 – 21:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
