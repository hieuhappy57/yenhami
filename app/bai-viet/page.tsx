import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";
import { getAllPosts, syncDbFromCloud } from "@/db";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Cẩm Nang Yến Sào & Dinh Dưỡng Sức Khỏe Đà Nẵng",
  description:
    "Kiến thức khoa học về yến tươi chưng nóng thố sứ 200ml (35g yến tươi), dịch vụ giao nóng hỏa tốc 2 giờ tại Đà Nẵng, thời điểm vàng dùng yến cho mẹ bầu, người bệnh, ông bà và nghệ thuật chọn quà biếu sức khỏe.",
  path: "/bai-viet",
  image: "/bai-viet/banner_bai_1_yen_tuoi_tho_su.jpg",
});

const TOPIC_PILLS = [
  { label: "Dinh Dưỡng Thố Sứ 200ml", bgColor: "#FFE9DD" },
  { label: "Giao Nóng Hỏa Tốc 2H Đà Nẵng", bgColor: "#E2FCF3" },
  { label: "Mẹ Bầu • Người Bệnh • Ông Bà", bgColor: "#FAEFCA" },
  { label: "Nghệ Thuật Quà Biếu Sức Khỏe", bgColor: "#F5E2F9" },
];

export default async function BaiVietPage() {
  await syncDbFromCloud();
  const posts = getAllPosts(true);

  return (
    <div className="bg-[#FDFBF7] pb-14">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Cẩm nang & Bài viết", path: "/bai-viet" },
        ]}
      />

      {/* 1. LANGFARM-STYLE EDITORIAL HEADER BANNER */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="rounded-3xl bg-[#FAD4B8] p-6 sm:p-10 md:p-12 text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-4 py-1 text-xs font-bold text-[#7C4D2B]">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            Cẩm Nang Dinh Dưỡng & Quà Biếu Sức Khỏe Hà Mi
          </span>
          <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1B1B1B] max-w-3xl mx-auto leading-tight">
            Cẩm Nang Yến Tươi Chưng Nóng & Chăm Sóc Sức Khỏe Gia Đình
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-base leading-relaxed text-[#2B433A]">
            Chia sẻ kiến thức dinh dưỡng chuẩn khoa học về thố yến tươi chưng nóng 200ml (35g yến tươi thật), thời điểm vàng bồi bổ cho mẹ bầu, người bệnh, ông bà cao tuổi và dịch vụ giao ấm nóng trong 2 giờ tại Đà Nẵng.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            {TOPIC_PILLS.map((pill) => (
              <span
                key={pill.label}
                style={{ backgroundColor: pill.bgColor }}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#1B1B1B] shadow-2xs"
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BORDERLESS EDITORIAL BLOG GRID (LANGFARM STYLE) */}
      <section className="max-w-[1280px] mx-auto px-4 md:px-8 pt-10">
        {posts.length === 0 ? (
          <div className="rounded-3xl bg-[#FAF4EB] p-10 text-center text-sm text-[#2B433A]">
            Chưa có bài viết nào được đăng tải.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col justify-between"
              >
                <div>
                  <Link
                    href={`/bai-viet/${post.slug}`}
                    className="relative block aspect-[16/10] w-full overflow-hidden rounded-3xl bg-[#F8F5EC] mb-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageUrl}
                      alt={post.coverImageAlt || post.title}
                      width={640}
                      height={400}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-[#1B4332]/90 backdrop-blur-xs px-3.5 py-1 text-xs font-semibold text-[#FFFCF4]">
                      {post.category}
                    </span>
                  </Link>

                  <div className="space-y-2 px-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#7C4D2B]">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <Link href={`/bai-viet/${post.slug}`}>
                      <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1B1B1B] group-hover:text-[#1B4332] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-xs sm:text-sm leading-relaxed text-[#4A4A4A] line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="mt-4 px-1">
                  <Link
                    href={`/bai-viet/${post.slug}`}
                    aria-label={`Đọc chi tiết: ${post.title}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-2 text-xs sm:text-sm font-bold text-[#1B4332] group-hover:bg-[#1B4332] group-hover:text-white transition-colors"
                  >
                    <span>Đọc chi tiết bài viết</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
