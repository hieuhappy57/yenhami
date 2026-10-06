import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Sparkles } from "lucide-react";
import { getAllPosts } from "@/db";

export const dynamic = "force-dynamic";

export default function BaiVietPage() {
  const posts = getAllPosts(true);

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 pr-16 md:px-8 md:pr-20">
      <div className="rounded-3xl border border-[#BD9342]/35 bg-[#FFFCF4] p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155132]/10 border border-[#BD9342]/45 px-3.5 py-1 text-xs font-semibold text-[#155132]">
          <Sparkles className="h-3.5 w-3.5 text-[#BD9342]" />
          Cẩm Nang Dinh Dưỡng & Tin Tức Hà Mi
        </span>
        <h1 className="mt-3 font-serif-display text-3xl font-semibold text-[#155132] sm:text-4xl">
          Bài Viết & Kiến Thức Yến Sào
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#2B433A]/85 sm:text-base">
          Chia sẻ bí quyết thưởng thức yến tươi chưng nóng đúng thời điểm vàng,
          cách phân biệt tổ yến nguyên chất và gợi ý chọn quà biếu sức khỏe tinh tế.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#155132]/25 bg-white p-10 text-center text-sm text-[#2B433A]">
          Chưa có bài viết nào được đăng tải.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-[#155132]/15 bg-white shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link
                href={`/bai-viet/${post.slug}`}
                className="relative aspect-[16/10] w-full overflow-hidden bg-[#F5F0E3]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#155132]/90 px-3 py-1 text-[11px] font-semibold text-[#FFFCF4]">
                  {post.category}
                </span>
              </Link>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#8A6632]">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <Link href={`/bai-viet/${post.slug}`}>
                    <h2 className="mt-2 font-serif-display text-lg font-semibold text-[#155132] group-hover:text-[#8A6632] line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2 text-xs leading-relaxed text-[#2B433A]/85 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#155132]/10">
                  <Link
                    href={`/bai-viet/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#155132] hover:text-[#8A6632]"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#BD9342]" />
                    Đọc chi tiết bài viết
                    <ArrowRight className="h-3.5 w-3.5" />
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
