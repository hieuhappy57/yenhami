"use client";

import React, { useState } from "react";
import { Star, Quote, CheckCircle2, Heart } from "lucide-react";

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
    date: "3 ngày trước",
    productName: "Thố Yến Táo Đỏ Hạt Sen (200ml)",
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
    role: "Bồi bổ mẹ sau xuất viện",
    category: "recovery",
    rating: 5,
    date: "1 tuần trước",
    productName: "Thố Yến Thảo Mộc Bồi Bổ (200ml)",
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
    date: "2 tuần trước",
    productName: "Yến Chưng Đông Trùng (Ăn kiêng)",
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
    date: "2 tuần trước",
    productName: "Set Quà Yến Thượng Hạng Tri Ân",
    avatarBg: "bg-[#8A6632] text-[#FFFCF4]",
    avatarText: "HL",
    highlight: "Bao bì sang trọng, đối tác rất ưng ý",
    review:
      "Công ty mình đặt 10 set quà biếu gửi tặng đối tác dịp tri ân. Từ hộp quà ép kim vàng, túi xách cao cấp cho đến thố sứ và chất lượng yến sào bên trong đều đạt chuẩn thượng hạng. Đối tác nhận quà khen nức nở. Đội ngũ tư vấn nhiệt tình, giao đúng hẹn từng địa chỉ.",
  },
];

const CATEGORY_TABS = [
  { key: "all", label: "Tất cả" },
  { key: "mom", label: "Mẹ bầu & Sau sinh" },
  { key: "recovery", label: "Bồi bổ phục hồi" },
  { key: "elder", label: "Người lớn tuổi" },
  { key: "gift", label: "Quà tặng đối tác" },
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
      className="py-8 sm:py-12 md:py-14 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto"
    >
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2FCF3] border border-[#155132]/15 px-3.5 py-1 text-xs font-bold text-[#155132] mb-2.5">
          <Heart className="w-3.5 h-3.5 fill-[#155132] text-[#155132]" />
          <span>Cảm Nhận Thực Tế Từ Khách Hàng</span>
        </div>
        <h2
          id="customer-reviews-heading"
          className="font-serif-display text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#155132] tracking-tight leading-tight"
        >
          Khách Hàng Nói Gì Về Yến Sào Hà Mi
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#50575E] leading-relaxed">
          Sự tín nhiệm của các gia đình tại Đà Nẵng là động lực để bếp Hà Mi luôn giữ trọn vị yến tươi nguyên chất chưng nóng mỗi ngày.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-semibold transition-all ${
                isActive
                  ? "bg-[#155132] text-white shadow-xs"
                  : "bg-[#FFFDF9] text-[#50575E] border border-[#E8DEC8] hover:bg-[#FAF5E8] hover:text-[#155132]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Reviews Cards: Swipeable rail on mobile, neat grid on tablet & desktop */}
      <div
        className={
          filteredReviews.length === 1
            ? "max-w-md mx-auto"
            : "flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-5"
        }
      >
        {filteredReviews.map((item) => (
          <article
            key={item.id}
            className={`flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] border border-[#E8DEC8]/90 p-4 sm:p-5 shadow-[0_2px_12px_rgba(21,81,50,0.04)] hover:shadow-[0_8px_20px_rgba(21,81,50,0.08)] hover:border-[#D4AF37]/80 transition-all duration-200 relative group ${
              filteredReviews.length > 1
                ? "w-[84vw] max-w-[320px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                : "w-full"
            }`}
          >
            {/* Top Row: Stars + Verified Badge + Quote */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-[#D4AF37]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-[#155132] bg-[#E2FCF3] px-1.5 py-0.5 rounded-sm">
                    Đã dùng
                  </span>
                </div>
                <Quote className="w-5 h-5 text-[#D4AF37]/35 group-hover:text-[#D4AF37]/75 transition-colors shrink-0" />
              </div>

              {/* Highlight Punchline */}
              <h3 className="font-serif-display text-sm sm:text-[15px] font-bold text-[#155132] mb-1.5 leading-snug">
                &ldquo;{item.highlight}&rdquo;
              </h3>

              {/* Review Text */}
              <p className="text-xs sm:text-[13px] text-[#2B433A]/90 leading-relaxed italic mb-3.5 line-clamp-4 min-h-[4.5rem]">
                &ldquo;{item.review}&rdquo;
              </p>
            </div>

            {/* Bottom Row: Product Used + Author Info */}
            <div className="pt-3 border-t border-[#E8DEC8]/70">
              <div className="mb-2.5">
                <span className="inline-block rounded-md bg-[#FAF4EB] border border-[#E8DEC8]/80 px-2 py-0.5 text-[11px] font-semibold text-[#7A5410] truncate max-w-full">
                  🍲 {item.productName}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${item.avatarBg}`}
                >
                  {item.avatarText}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#1D2327] truncate">
                      {item.author}
                    </h4>
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-[#155132] shrink-0"
                      aria-label="Khách hàng đã mua hàng"
                    />
                  </div>
                  <p className="text-[11px] text-[#7A5410] font-medium truncate">
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
