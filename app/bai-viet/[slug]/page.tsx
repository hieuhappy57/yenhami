import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Sparkles, Phone } from "lucide-react";
import { getAllPosts, getPostBySlug, syncDbFromCloud } from "@/db";
import { ArticleJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";
import { BRAND_CONFIG } from "@/config/brand";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await syncDbFromCloud();
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    path: `/bai-viet/${post.slug}`,
    image: post.coverImageUrl,
    type: "article",
    publishedTime: post.createdAt,
    modifiedTime: post.updatedAt || post.createdAt,
    keywords: [post.category.toLowerCase(), post.title.toLowerCase()],
  });
}

export default async function BaiVietDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await syncDbFromCloud();
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  const relatedPosts = getAllPosts(true)
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const paragraphs = post.content
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#FDFBF7] pb-14">
      <ArticleJsonLd post={post} />
      <div className="mx-auto max-w-4xl px-4 pt-6 md:px-8">
        <Link
          href="/bai-viet"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF4EB] px-4 py-1.5 text-xs font-bold text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại Cẩm nang Yến Sào Hà Mi
        </Link>

        <article className="mt-5">
          {/* Hero Cover Image */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-[#F8F5EC] shadow-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAlt || post.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Editorial Content Card */}
          <div className="mt-6 rounded-3xl bg-white p-6 sm:p-10 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE9DD] px-3.5 py-1 font-bold text-[#7C4D2B]">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
                {post.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[#7C4D2B] font-medium">
                <Calendar className="h-3.5 w-3.5" />
                Cập nhật: {new Date(post.updatedAt).toLocaleDateString("vi-VN")}
              </span>
            </div>

            <h1 className="mt-3.5 font-serif-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B1B1B] leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <div className="mt-5 rounded-2xl bg-[#FAF4EB] p-4 sm:p-5 text-sm sm:text-base font-medium leading-relaxed text-[#1B4332]">
                {post.excerpt}
              </div>
            )}

            <div className="mt-6 space-y-4 text-sm sm:text-base leading-relaxed text-[#2B433A]">
              {paragraphs.map((para, idx) => {
                if (para.startsWith("## ")) {
                  return (
                    <h2
                      key={idx}
                      className="pt-3 font-serif-display text-xl sm:text-2xl font-bold text-[#1B4332]"
                    >
                      {para.replace(/^##\s+/, "")}
                    </h2>
                  );
                }
                if (para.startsWith("### ")) {
                  return (
                    <h3
                      key={idx}
                      className="pt-2 font-serif-display text-lg sm:text-xl font-bold text-[#7C4D2B]"
                    >
                      {para.replace(/^###\s+/, "")}
                    </h3>
                  );
                }
                if (para.startsWith("- ")) {
                  const text = para.replace(/^-\s+/, "");
                  const colonIdx = text.indexOf(":");
                  if (colonIdx > 0 && colonIdx < 80) {
                    const lead = text.slice(0, colonIdx + 1);
                    const rest = text.slice(colonIdx + 1);
                    return (
                      <div key={idx} className="flex items-start gap-2.5 pl-1">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                        <p>
                          <strong className="font-bold text-[#1B4332]">{lead}</strong>
                          {rest}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start gap-2.5 pl-1">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                      <p>{text}</p>
                    </div>
                  );
                }
                return <p key={idx}>{para}</p>;
              })}
            </div>

            {/* Langfarm-style Warm Peach CTA Banner at bottom of article */}
            <div className="mt-10 rounded-3xl bg-[#FAD4B8] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-xl">
                <span className="inline-block rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-bold text-[#7C4D2B]">
                  Nóng Thơm Trọn Vị – Vẹn Nguyên Dưỡng Chất
                </span>
                <p className="font-serif-display text-lg sm:text-xl font-bold text-[#1B1B1B]">
                  Đặt Yến Tươi Chưng Nóng Thố Sứ 200ml — Giao Ngay Trong 2H
                </p>
                <p className="text-xs sm:text-sm text-[#2B433A]">
                  Mỗi thố 200ml chứa đến 35g yến tươi thật nguyên tổ, giá chỉ từ 295.000đ/thố. Miễn phí giao hàng nội thành Đà Nẵng khi đặt từ 2 thố.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/dat-hang"
                  className="rounded-full bg-[#1B4332] px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-[#133023] transition"
                >
                  Đặt Giao Nóng 2H →
                </Link>
                <a
                  href={`tel:${BRAND_CONFIG.contact.hotlineTel}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#1B4332]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#7C4D2B]" />
                  {BRAND_CONFIG.contact.hotlineDisplay}
                </a>
              </div>
            </div>
          </div>
        </article>

        {/* Borderless Related Posts (Langfarm Style) */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif-display text-2xl font-bold text-[#1B1B1B]">
              Bài viết cùng chuyên mục
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/bai-viet/${rel.slug}`}
                  className="group block space-y-2.5"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#F8F5EC]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.coverImageUrl}
                      alt={rel.coverImageAlt || rel.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#7C4D2B]">
                      {rel.category}
                    </span>
                    <h3 className="mt-0.5 font-serif-display text-base font-bold text-[#1B1B1B] group-hover:text-[#1B4332] line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
