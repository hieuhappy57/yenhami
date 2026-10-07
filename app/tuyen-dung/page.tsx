import React from "react";
import type { Metadata } from "next";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  getAllJobPostings,
  getSiteContentSettings,
  syncDbFromCloud,
} from "@/db";
import { BreadcrumbJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Tuyển Dụng & Cơ Hội Nghề Nghiệp Tại Đà Nẵng",
  description:
    "Đồng hành cùng Yến Sào Hà Mi mang những thố yến tươi chưng nóng chuẩn vị và quà tặng sức khỏe tinh khiết đến từng gia đình Việt.",
  path: "/tuyen-dung",
});

export default async function TuyenDungPage() {
  await syncDbFromCloud();
  const jobs = getAllJobPostings(true);
  const site = getSiteContentSettings();

  return (
    <div className="mx-auto max-w-[1160px] px-4 py-10 md:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Tuyển dụng", path: "/tuyen-dung" },
        ]}
      />
      <div className="rounded-3xl border border-[#BD9342]/35 bg-[#FFFCF4] p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#155132]/10 border border-[#BD9342]/45 px-3.5 py-1 text-xs font-semibold text-[#155132]">
          <Sparkles className="h-3.5 w-3.5 text-[#BD9342]" />
          Cơ Hội Nghề Nghiệp Tại Yến Sào Hà Mi
        </span>
        <h1 className="mt-3 font-serif-display text-3xl font-semibold text-[#155132] sm:text-4xl">
          Tuyển Dụng & Đồng Hành Cùng Hà Mi
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#2B433A]/85 sm:text-base">
          Chúng tôi tìm kiếm những cộng sự tỉ mỉ, tận tâm và yêu thích giá trị
          chăm sóc sức khỏe tự nhiên để cùng mang những thố yến tươi chưng nóng
          chuẩn vị đến từng gia đình Việt.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#155132]/25 bg-white p-10 text-center text-sm text-[#2B433A]">
          Hiện tại Yến Sào Hà Mi chưa có vị trí tuyển dụng mới. Bạn có thể gửi
          thông tin ứng tuyển dự phòng qua Zalo CSKH.
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl border border-[#155132]/15 bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#155132]/10 pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 font-bold text-emerald-800">
                      Đang nhận hồ sơ
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#8A6632]">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#2B433A]/80">
                      <Clock className="h-3.5 w-3.5 text-[#BD9342]" />
                      {job.employmentType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#2B433A]/80">
                      <MapPin className="h-3.5 w-3.5 text-[#BD9342]" />
                      {job.location}
                    </span>
                  </div>
                  <h2 className="mt-2 font-serif-display text-xl font-semibold text-[#155132] sm:text-2xl">
                    {job.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#FFFCF4] border border-[#BD9342]/45 px-4 py-2.5 text-right">
                  <span className="block text-[11px] text-[#2B433A]/75">
                    Thu nhập & Đãi ngộ
                  </span>
                  <span className="text-sm font-bold text-[#155132]">
                    {job.salaryRange}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 text-xs sm:text-sm leading-relaxed text-[#2B433A]">
                <div>
                  <h3 className="font-bold text-[#155132]">Mô tả công việc:</h3>
                  <p className="mt-1.5 whitespace-pre-line">{job.description}</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#155132]">Yêu cầu ứng viên:</h3>
                  <p className="mt-1.5 whitespace-pre-line">
                    {job.requirements}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFFCF4] border border-[#155132]/15 p-4 text-xs">
                <div className="flex items-center gap-2 text-[#155132] font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#BD9342] shrink-0" />
                  <span>
                    Ứng tuyển nhanh bằng cách nhắn tin trực tiếp qua Zalo hoặc gọi
                    Hotline nhân sự Hà Mi.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={site.zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#155132] border border-[#BD9342] px-4 py-2 font-bold text-[#FFFCF4]"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#BD9342]" />
                    Ứng tuyển qua Zalo
                  </a>
                  <a
                    href={`tel:${site.hotlineTel}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#155132]/30 bg-white px-4 py-2 font-bold text-[#155132]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#BD9342]" />
                    Gọi {site.hotlineDisplay}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
