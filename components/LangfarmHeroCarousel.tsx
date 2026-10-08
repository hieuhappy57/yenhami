"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  kicker: string;
  title: string;
  mobileTitle: string;
  desktopImage: string;
  mobileImage: string;
  ctaLabel: string;
  ctaHref: string;
  isAnchor?: boolean;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-fresh-bowl",
    kicker: "Yến Sào Hà Mi trân trọng giới thiệu",
    title: "Yến Tươi Chưng Nóng Thố Sứ — Giao Ngay 2H",
    mobileTitle: "Yến Tươi Chưng Nóng",
    desktopImage: "/brand/banners/hero-slide-1-tho-su-v2.webp",
    mobileImage: "/brand/banners/hero-slide-1-tho-su-mobile-v3.webp",
    ctaLabel: "Đặt giao nóng 2H",
    ctaHref: "#menu-chu-luc",
    isAnchor: true,
  },
  {
    id: "slide-gift-set",
    kicker: "Món quà sức khỏe ấm lòng cho mẹ bầu, người bệnh & ông bà",
    title: "Bộ Sưu Tập Set Quà Sen Vàng & Đàn Én",
    mobileTitle: "Set Quà Yến Sào",
    desktopImage: "/brand/banners/hero-slide-2-set-qua-sen-vang-v3.webp",
    mobileImage: "/brand/banners/hero-slide-2-set-qua-sen-vang-mobile-v2.webp",
    ctaLabel: "Khám phá ngay",
    ctaHref: "#danh-muc-set-qua",
    isAnchor: true,
  },
  {
    id: "slide-iso-fda",
    kicker: "Chuẩn Quốc tế ISO 22000:2018 & FDA Hoa Kỳ",
    title: "35g Yến Việt Nguyên Tổ • Nhặt Sạch Nước RO",
    mobileTitle: "Yến Việt Nguyên Tổ",
    desktopImage: "/brand/banners/hero-slide-3-yen-viet-nguyen-to-v2.webp",
    mobileImage: "/brand/banners/hero-slide-3-yen-viet-nguyen-to-mobile-v2.webp",
    ctaLabel: "Tìm hiểu thêm",
    ctaHref: "/ve-ha-mi",
    isAnchor: false,
  },
];

export function LangfarmHeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = HERO_SLIDES[activeIndex];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section
      aria-label="Giới thiệu Yến Sào Hà Mi - Yến Tươi Chưng Nóng Giao Ngay 2H"
      data-testid="hero-section"
      className="relative w-full max-w-[1440px] mx-auto overflow-hidden bg-[#155132]"
    >
      <h1 className="sr-only">
        Yến Sào Hà Mi - Yến Tươi Chưng Nóng Tại Đà Nẵng
      </h1>
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[580px]">
        {/* Slide Image */}
        <picture className="block w-full h-full">
          <source media="(min-width: 768px)" srcSet={currentSlide.desktopImage} />
          <img
            src={currentSlide.mobileImage}
            alt={currentSlide.title}
            fetchPriority="high"
            width={1640}
            height={680}
            className="w-full h-full object-cover object-center transition-all duration-500"
          />
        </picture>

        {/* Langfarm-style dark bottom vignette so white serif typography pops cleanly without any box covering the photo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
        />

        {/* Top-Right Gold Brand Seal (Langfarm signature touch) */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#F7DF94] via-[#D9AE54] to-[#AA7C2C] p-1 shadow-lg flex items-center justify-center border border-white/60">
          <img
            src="/brand/ha-mi-logo-web-640.png"
            alt="Huy hiệu Yến Sào Hà Mi"
            className="w-full h-full object-contain rounded-full bg-[#FFFCF4] p-0.5"
          />
        </div>

        {/* Prev / Next Carousel Controls (Desktop) */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Slide trước"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Slide tiếp theo"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/55 text-white items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Bottom Overlay: Left Serif Title + Right Gold Pill CTA */}
        <div className="absolute inset-x-0 bottom-0 z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pb-8 sm:pb-11 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="hidden sm:block font-serif-display text-sm sm:text-xl md:text-2xl text-white/95 drop-shadow-sm">
              {currentSlide.kicker}
            </p>
            <h2 className="mt-1 font-serif-display text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight drop-shadow-md [text-wrap:balance]">
                <span className="hidden sm:inline">{currentSlide.title}</span>
                <span className="sm:hidden">{currentSlide.mobileTitle}</span>
            </h2>
          </div>

          <div className="shrink-0">
            {currentSlide.isAnchor ? (
              <a
                href={currentSlide.ctaHref}
                data-testid="hero-cta-choose-dish"
                className="inline-flex items-center justify-center min-h-[42px] sm:min-h-[48px] px-6 sm:px-8 py-2.5 rounded-full bg-gradient-to-r from-[#E6C56F] via-[#F9E498] to-[#C89B3C] text-[#4A3208] font-serif-display font-bold text-sm sm:text-lg shadow-lg border border-[#FFF5D6] hover:brightness-105 transition-all"
              >
                {currentSlide.ctaLabel}
              </a>
            ) : (
              <Link
                href={currentSlide.ctaHref}
                data-testid="hero-cta-choose-dish"
                className="inline-flex items-center justify-center min-h-[42px] sm:min-h-[48px] px-6 sm:px-8 py-2.5 rounded-full bg-gradient-to-r from-[#E6C56F] via-[#F9E498] to-[#C89B3C] text-[#4A3208] font-serif-display font-bold text-sm sm:text-lg shadow-lg border border-[#FFF5D6] hover:brightness-105 transition-all"
              >
                {currentSlide.ctaLabel}
              </Link>
            )}
          </div>
        </div>

        {/* Bottom-Center Pagination Dots (Langfarm style pill indicator) */}
        <div className="absolute bottom-2.5 sm:bottom-3.5 inset-x-0 z-10 flex items-center justify-center gap-2">
          {HERO_SLIDES.map((s, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                aria-label={`Chuyển đến slide ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  isActive
                    ? "w-7 bg-[#6EC3B5]"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
