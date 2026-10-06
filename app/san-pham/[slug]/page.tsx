import React from "react";
import { notFound } from "next/navigation";
import { getAllProducts, getProductBySlug } from "@/db";
import { ProductDetailClient } from "@/components/ProductDetailClient";
import { ProductMenuSection } from "@/components/ProductMenuSection";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const related = getAllProducts().filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <div>
      <ProductDetailClient product={product} />
      <div className="border-t border-[#BD9342]/30 bg-[#FFFCF4]/40">
        <ProductMenuSection
          products={related}
          title="Các món khác trong Menu Yến Tươi Chưng Nóng"
          subtitle="Khách có thể kết hợp nhiều vị khác nhau trong cùng một yêu cầu đặt món."
        />
      </div>
    </div>
  );
}
