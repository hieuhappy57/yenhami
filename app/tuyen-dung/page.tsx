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
    <div className="bg-[#FDFBF7] mx-auto max-w-[1200px] px-4 py-10 md:px-8 space-y-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", path: "/" },
          { name: "Tuyển dụng", path: "/tuyen-dung" },
        ]}
      />
      <div className="rounded-3xl bg-[#FAD4B8] p-6 sm:p-10 text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1 text-xs font-bold text-[#7C4D2B]">
          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
          Cơ Hội Nghề Nghiệp Tại Yến Sào Hà Mi
        </span>
        <h1 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#1B1B1B]">
          Tuyển Dụng & Đồng Hành Cùng Hà Mi
        </h1>
        <p className="max-w-2xl mx-auto text-xs sm:text-base leading-relaxed text-[#2B433A]">
          Chúng tôi tìm kiếm những cộng sự tỉ mỉ, tận tâm và yêu thích giá trị chăm sóc sức khỏe tự nhiên để cùng mang những thố yến tươi chưng nóng chuẩn vị đến từng gia đình Việt.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-3xl bg-[#FAF4EB] p-10 text-center text-sm text-[#2B433A]">
          Hiện tại Yến Sào Hà Mi chưa có vị trí tuyển dụng mới. Bạn có thể gửi thông tin ứng tuyển dự phòng qua Zalo CSKH.
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl bg-white p-6 shadow-2xs sm:p-8 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6DAC6] pb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-[#E2FCF3] px-3 py-1 font-bold text-[#1B4332]">
                      Đang nhận hồ sơ
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#FFE9DD] px-3 py-1 font-semibold text-[#7C4D2B]">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#2B433A]/80">
                      <Clock className="h-3.5 w-3.5 text-[#7C4D2B]" />
                      {job.employmentType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#2B433A]/80">
                      <MapPin className="h-3.5 w-3.5 text-[#7C4D2B]" />
                      {job.location}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-serif-display text-xl font-bold text-[#1B1B1B] sm:text-2xl">
                    {job.title}
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#FAEFCA] px-4 py-2.5 text-right">
                  <span className="block text-[11px] text-[#7C4D2B] font-semibold">
                    Thu nhập & Đãi ngộ
                  </span>
                  <span className="text-sm font-bold text-[#1B1B1B]">
                    {job.salaryRange}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-xs sm:text-sm leading-relaxed text-[#2B433A]">
                <div className="rounded-2xl bg-[#FAF4EB] p-4">
                  <h3 className="font-bold text-[#1B4332]">Mô tả công việc:</h3>
                  <p className="mt-1.5 whitespace-pre-line">{job.description}</p>
                </div>
                <div className="rounded-2xl bg-[#FAF4EB] p-4">
                  <h3 className="font-bold text-[#1B4332]">Yêu cầu ứng viên:</h3>
                  <p className="mt-1.5 whitespace-pre-line">{job.requirements}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#FFE9DD] p-4 text-xs">
                <div className="flex items-center gap-2 text-[#1B1B1B] font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#1B4332] shrink-0" />
                  <span>
                    Ứng tuyển nhanh bằng cách nhắn tin trực tiếp qua Zalo hoặc gọi Hotline nhân sự Hà Mi.
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <a
                    href={site.zaloUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1B4332] px-4 py-2 font-bold text-white"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-[#F3D78A]" />
                    Ứng tuyển qua Zalo
                  </a>
                  <a
                    href={`tel:${site.hotlineTel}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-bold text-[#1B4332]"
                  >
                    <Phone className="h-3.5 w-3.5 text-[#7C4D2B]" />
                    Gọi {site.hotlineDisplay}
                  </a>
                  <a
                    href="mailto:cskh@yenhami.com"
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-bold text-[#1B4332]"
                  >
                    Email: cskh@yenhami.com
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
