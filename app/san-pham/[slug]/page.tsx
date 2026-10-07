import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug, syncDbFromCloud } from "@/db";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductMenuSection } from "@/components/ProductMenuSection";
import { ProductJsonLd } from "@/components/SeoJsonLd";
import { buildPageMetadata } from "@/config/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await syncDbFromCloud();
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return buildPageMetadata({
      title: "Sản phẩm Yến Sào Hà Mi",
      description:
        "Khám phá thực đơn Yến Tươi Chưng Nóng thố sứ 200ml (35g yến tươi thật), Set Quà Biếu Hoa Sen Vàng và Yến Sào Tinh Chế thượng hạng từ Yến Sào Hà Mi.",
      path: `/san-pham/${slug}`,
    });
  }

  const priceText = product.priceVnd
    ? `${product.priceVnd.toLocaleString("vi-VN")}đ`
    : "Liên hệ";

  return buildPageMetadata({
    title: `${product.name} (${priceText}) — ${product.categoryLabel}`,
    description: `${product.shortDescription} Thành phần: ${product.ingredients.join(", ")}. Khẩu vị: ${product.tasteProfile}. Đặt giao nóng 2H tại Đà Nẵng.`,
    path: `/san-pham/${product.slug}`,
    image: product.imageUrl,
    keywords: [
      product.name.toLowerCase(),
      product.categoryLabel.toLowerCase(),
      ...product.ingredients.map((i) => i.toLowerCase()),
    ],
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await syncDbFromCloud();
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const related = getAllProducts().filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <div>
      <ProductJsonLd product={product} />
      <ProductDetailClient product={product} />
      <div className="border-t border-[#BD9342]/30 bg-[#FFFCF4]/40">
        <ProductMenuSection
          products={related}
          title="Các món khác trong Menu Yến Tươi Chưng Nóng"
          subtitle="Khách có thể kết hợp nhiều vị khác nhau trong cùng một đơn đặt món. Đặt từ 2 thố trở lên miễn phí giao hàng trong bán kính 5km."
        />
      </div>
    </div>
  );
}
