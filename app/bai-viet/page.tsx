import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Sparkles } from "lucide-react";
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

export default async function BaiVietPage() {
  await syncDbFromCloud();
  const posts = getAllPosts(true);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Cẩm nang & Bài viết", path: "/bai-viet" },
        ]}
      />
      <div className="rounded-3xl border border-[#BD9342]/35 bg-[#FFFCF4] p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155132]/10 border border-[#BD9342]/45 px-3.5 py-1 text-xs font-semibold text-[#155132]">
          <Sparkles className="h-3.5 w-3.5 text-[#BD9342]" />
          Cẩm Nang Dinh Dưỡng & Quà Biếu Sức Khỏe Hà Mi
        </span>
        <h1 className="mt-3 font-serif-display text-3xl font-semibold text-[#155132] sm:text-4xl">
          Cẩm Nang Yến Tươi Chưng Nóng & Chăm Sóc Sức Khỏe Gia Đình
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#2B433A]/90 sm:text-base">
          Chia sẻ kiến thức dinh dưỡng chuẩn khoa học về thố yến tươi chưng nóng 200ml (35g yến tươi thật),
          thời điểm vàng bồi bổ cho mẹ bầu, người bệnh, ông bà cao tuổi và dịch vụ giao ấm nóng trong 2 giờ tại Đà Nẵng.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#155132]/25 bg-white p-10 text-center text-sm text-[#2B433A]">
          Chưa có bài viết nào được đăng tải.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[#155132]/15 bg-white shadow-xs transition hover:-translate-y-0.5 hover:border-[#BD9342] hover:shadow-md"
            >
              <Link
                href={`/bai-viet/${post.slug}`}
                className="relative aspect-[16/9] w-full overflow-hidden bg-[#F5F0E3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#155132]/90 px-3 py-1 text-[11px] font-semibold text-[#FFFCF4]">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A6632]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Link href={`/bai-viet/${post.slug}`}>
                    <h2 className="mt-2 font-serif-display text-xl font-semibold text-[#155132] group-hover:text-[#8A6632] line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#2B433A]/85 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#155132]/10">
                  <Link
                    href={`/bai-viet/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#155132] hover:text-[#8A6632]"
                  >
                    <BookOpen className="h-4 w-4 text-[#BD9342]" />
                    Đọc chi tiết bài viết
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
