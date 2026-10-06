import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/db";

export const dynamic = "force-dynamic";

export default async function BaiVietDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getAllPosts(true)
    .filter((p) => p.id !== post.id)
    .slice(0, 2);

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-8">
      <Link
        href="/bai-viet"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#155132] hover:text-[#8A6632]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách Bài viết & Cẩm nang
      </Link>

      <article className="mt-4 overflow-hidden rounded-3xl border border-[#155132]/15 bg-white shadow-xs">
        <div className="relative aspect-[16/9] w-full bg-[#F5F0E3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFCF4] border border-[#BD9342]/45 px-3 py-1 font-semibold text-[#155132]">
              <Sparkles className="h-3.5 w-3.5 text-[#BD9342]" />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[#8A6632]">
              <Calendar className="h-3.5 w-3.5" />
              Cập nhật:{" "}
              {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
            </span>
          </div>

          <h1 className="mt-3 font-serif-display text-2xl font-semibold text-[#155132] sm:text-3xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 rounded-2xl border-l-4 border-[#BD9342] bg-[#FFFCF4] p-4 text-sm font-medium leading-relaxed text-[#155132]">
              {post.excerpt}
            </p>
          )}

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#2B433A] sm:text-base">
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#BD9342]/40 bg-[#FFFCF4] p-5">
            <div>
              <p className="font-serif-display text-base font-bold text-[#155132]">
                Đặt Yến Tươi Chưng Nóng & Set Quà Biếu Hà Mi
              </p>
              <p className="text-xs text-[#2B433A]/85">
                Chưng mới mỗi ngày từ tổ yến nguyên chất — Miễn phí giao hàng khi đặt từ 2 thố.
              </p>
            </div>
            <Link
              href="/dat-hang"
              className="rounded-xl bg-[#155132] border border-[#BD9342] px-5 py-2.5 text-xs font-bold text-[#FFFCF4]"
            >
              Đặt món ngay →
            </Link>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <div className="mt-10">
          <h2 className="font-serif-display text-xl font-semibold text-[#155132]">
            Bài viết liên quan
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/bai-viet/${rel.slug}`}
                className="flex gap-3.5 rounded-2xl border border-[#155132]/15 bg-white p-3.5 hover:border-[#BD9342]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={rel.coverImageUrl}
                  alt={rel.title}
                  className="h-20 w-24 rounded-xl object-cover shrink-0"
                />
                <div>
                  <span className="text-[11px] font-semibold text-[#8A6632]">
                    {rel.category}
                  </span>
                  <h3 className="mt-0.5 text-sm font-bold text-[#155132] line-clamp-2">
                    {rel.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
