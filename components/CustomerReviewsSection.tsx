"use client";

import React, { useState } from "react";
import { Star, Quote, CheckCircle2, Heart, Award, ShieldCheck } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  district: string;
  role: string;
  category: "all" | "mom" | "recovery" | "elder" | "gift";
  rating: number;
  date: string;
  productName: string;
  avatarBg: string;
  avatarText: string;
  review: string;
  highlight: string;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Chị Minh Thư",
    district: "Hải Châu, Đà Nẵng",
    role: "Mẹ bầu tháng thứ 6",
    category: "mom",
    rating: 5,
    date: "Đánh giá 3 ngày trước",
    productName: "Thố Yến Tươi Chưng Táo Đỏ Hạt Sen (200ml)",
    avatarBg: "bg-[#155132] text-[#F9E498]",
    avatarText: "MT",
    highlight: "Yến thơm dịu không tanh, giao nóng hổi",
    review:
      "Thời gian ốm nghén mình rất nhạy cảm với mùi tanh, nhưng thố yến chưng hạt sen táo đỏ của Hà Mi thơm dịu tự nhiên, ngọt thanh dễ ăn. Shipper giao tới thố sứ vẫn còn nóng bốc khói, sợi yến nở dày đặc chứ không bị vụn nát. Ăn đều đặn mỗi tuần thấy da dẻ hồng hào và đỡ mệt hẳn.",
  },
  {
    id: "rev-2",
    author: "Anh Quốc Huy",
    district: "Sơn Trà, Đà Nẵng",
    role: "Mua bồi bổ mẹ sau phẫu thuật",
    category: "recovery",
    rating: 5,
    date: "Đánh giá 1 tuần trước",
    productName: "Thố Yến Chưng Thảo Mộc Bồi Bổ (200ml)",
    avatarBg: "bg-[#7C4D2B] text-white",
    avatarText: "QH",
    highlight: "Sợi mềm dễ nuốt, mẹ ăn ngon miệng",
    review:
      "Mẹ mình mới xuất viện sau phẫu thuật, bác sĩ khuyên bổ sung yến tươi. Mình đặt giao gấp trong 2 tiếng, tiệm chuẩn bị nhanh và rất chu đáo, bọc túi giữ nhiệt và thố sứ rất vệ sinh. Yến chưng mềm sợi, vị thanh nhẹ dễ nuốt nên mẹ ăn hết trọn một thố. Cảm ơn tiệm vì sự tận tâm!",
  },
  {
    id: "rev-3",
    author: "Cô Thanh Mai",
    district: "Cẩm Lệ, Đà Nẵng",
    role: "Khách hàng 62 tuổi",
    category: "elder",
    rating: 5,
    date: "Đánh giá 2 tuần trước",
    productName: "Yến Tươi Chưng Đông Trùng Hạ Thảo (Vị ăn kiêng)",
    avatarBg: "bg-[#1B4332] text-[#E8DEC8]",
    avatarText: "TM",
    highlight: "Ngọt thanh vừa vặn, ngủ sâu giấc hơn",
    review:
      "Tôi lớn tuổi và đường huyết cao nên dặn tiệm chưng nhạt đường phèn ăn kiêng. Bếp làm đúng y yêu cầu, sợi yến dai mềm tự nhiên, đông trùng thơm ngậy không bị gắt. Dùng buổi tối thấy cơ thể ấm áp, giấc ngủ sâu hơn hẳn và sáng dậy người nhẹ nhõm, khoan khoái.",
  },
  {
    id: "rev-4",
    author: "Chị Hoàng Lan",
    district: "Ngũ Hành Sơn, Đà Nẵng",
    role: "Quản lý doanh nghiệp",
    category: "gift",
    rating: 5,
    date: "Đánh giá 2 tuần trước",
    productName: "Set Quà Yến Thượng Hạng Tri Ân Đối Tác",
    avatarBg: "bg-[#8A6632] text-[#FFFCF4]",
    avatarText: "HL",
    highlight: "Bao bì sang trọng, đối tác rất ưng ý",
    review:
      "Công ty mình đặt 10 set quà biếu gửi tặng đối tác dịp tri ân. Từ hộp quà ép kim vàng, túi xách cao cấp cho đến thố sứ và chất lượng yến sào bên trong đều đạt chuẩn thượng hạng. Đối tác nhận quà khen nức nở. Đội ngũ tư vấn nhiệt tình, giao đúng hẹn từng địa chỉ.",
  },
];

const CATEGORY_TABS = [
  { key: "all", label: "Tất cả đánh giá" },
  { key: "mom", label: "Mẹ bầu & Sau sinh" },
  { key: "recovery", label: "Bồi bổ phục hồi" },
  { key: "elder", label: "Người lớn tuổi" },
  { key: "gift", label: "Quà tặng thượng hạng" },
] as const;

export function CustomerReviewsSection() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredReviews =
    activeTab === "all"
      ? REVIEWS_DATA
      : REVIEWS_DATA.filter((item) => item.category === activeTab);

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className="py-12 md:py-20 px-4 lg:px-8 max-w-[1440px] mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E2FCF3] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#155132] mb-3">
          <Heart className="w-3.5 h-3.5 fill-[#155132] text-[#155132]" />
          <span>Khách Hàng Nói Gì Về Yến Sào Hà Mi</span>
        </div>
        <h2
          id="customer-reviews-heading"
          className="font-serif-display text-2xl sm:text-3xl lg:text-[40px] font-bold text-[#1D2327] tracking-tight leading-tight"
        >
          Đánh Giá & Cảm Nhận Thực Tế
        </h2>
        <p className="mt-2.5 text-xs sm:text-base text-[#50575E] leading-relaxed">
          Sự hài lòng và tín nhiệm của các gia đình tại Đà Nẵng là động lực để bếp Hà Mi luôn giữ trọn vị yến tươi nguyên chất chưng nóng mỗi ngày.
        </p>

        {/* Trust Badges Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-5 border-t border-[#E8DEC8]/80 text-xs sm:text-sm text-[#2B433A]">
          <div className="flex items-center gap-1.5 font-semibold">
            <div className="flex text-[#D4AF37]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
              ))}
            </div>
            <span className="font-bold text-[#155132]">4.9 / 5.0</span>
            <span className="text-[#6C757D] font-normal">(Hơn 3.500+ thố yến trao tay)</span>
          </div>
          <span className="hidden sm:inline text-[#D4AF37]">•</span>
          <div className="flex items-center gap-1.5 font-medium text-[#155132]">
            <ShieldCheck className="w-4 h-4 text-[#155132]" />
            <span>100% Yến tươi thật chưng nóng</span>
          </div>
          <span className="hidden sm:inline text-[#D4AF37]">•</span>
          <div className="flex items-center gap-1.5 font-medium text-[#155132]">
            <Award className="w-4 h-4 text-[#155132]" />
            <span>Thố sứ bảo toàn dưỡng chất</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#155132] text-white shadow-xs"
                  : "bg-[#F8F5EC] text-[#50575E] hover:bg-[#EAE4D3] hover:text-[#1D2327]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredReviews.map((item) => (
          <article
            key={item.id}
            className="flex flex-col justify-between rounded-3xl bg-[#FAF4EB]/80 border border-[#E8DEC8]/90 p-5 sm:p-6 shadow-[0_4px_16px_rgba(27,67,50,0.04)] hover:shadow-[0_8px_24px_rgba(27,67,50,0.08)] hover:bg-[#FAF4EB] transition-all relative group"
          >
            {/* Top Row: Stars + Quote Icon */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-0.5 text-[#D4AF37]">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-[#D4AF37]/40 group-hover:text-[#D4AF37]/80 transition-colors" />
              </div>

              {/* Highlight Punchline */}
              <h3 className="font-serif-display text-base font-bold text-[#155132] mb-2 leading-snug">
                &ldquo;{item.highlight}&rdquo;
              </h3>

              {/* Review Text */}
              <p className="text-xs sm:text-sm text-[#2B433A]/90 leading-relaxed italic mb-4">
                &ldquo;{item.review}&rdquo;
              </p>
            </div>

            {/* Bottom Row: Product Used + Author Info */}
            <div className="pt-4 border-t border-[#E8DEC8]/80">
              <div className="mb-3">
                <span className="inline-block rounded-lg bg-[#E2FCF3] px-2.5 py-1 text-[11px] font-semibold text-[#155132]">
                  🍲 {item.productName}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${item.avatarBg}`}
                >
                  {item.avatarText}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1D2327] truncate">
                      {item.author}
                    </h4>
                    <span title="Khách hàng đã mua hàng" className="inline-flex items-center">
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-[#155132] shrink-0"
                        aria-label="Khách hàng đã mua hàng"
                      />
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7C4D2B] font-medium truncate">
                    {item.role} • {item.district}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
