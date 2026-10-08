import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/seo";
import { getAllPosts, getAllProducts } from "@/db";

export const revalidate = 3600;

const POLICY_SLUGS = ["giao-nhan", "thanh-toan", "doi-huy", "quyen-rieng-tu"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/yen-tuoi-chung-nong"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/gui-qua"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/dat-hang"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/bai-viet"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ve-ha-mi"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/lien-he"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/tuyen-dung"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
  ];

  const products = getAllProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/san-pham/${product.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: product.id.startsWith("cat-") ? 0.85 : 0.9,
  }));

  const posts = getAllPosts(true);
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/bai-viet/${post.slug}`),
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const policyRoutes: MetadataRoute.Sitemap = POLICY_SLUGS.map((slug) => ({
    url: absoluteUrl(`/chinh-sach/${slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes, ...policyRoutes];
}
