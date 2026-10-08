import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/seo";
import { getAllPosts, getAllProducts, syncDbFromCloud } from "@/db";

export const revalidate = 3600;

const POLICY_SLUGS = ["giao-nhan", "thanh-toan", "doi-huy", "quyen-rieng-tu"];

function validDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return undefined;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()) || date.getTime() > Date.now()) return undefined;
  // Date.parse normalizes impossible dates such as February 30.
  const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) return undefined;
  return date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await syncDbFromCloud();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/yen-tuoi-chung-nong"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/gui-qua"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/dat-hang"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/bai-viet"),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/ve-ha-mi"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/lien-he"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/tuyen-dung"),
      changeFrequency: "weekly",
      priority: 0.65,
    },
  ];

  const products = getAllProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/san-pham/${product.slug}`),
    changeFrequency: "weekly",
    priority: product.id.startsWith("cat-") ? 0.85 : 0.9,
  }));

  const posts = getAllPosts(true);
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const lastModified = validDate(post.updatedAt) ?? validDate(post.createdAt);
    return {
      url: absoluteUrl(`/bai-viet/${post.slug}`),
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.75,
    };
  });

  const policyRoutes: MetadataRoute.Sitemap = POLICY_SLUGS.map((slug) => ({
    url: absoluteUrl(`/chinh-sach/${slug}`),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...postRoutes, ...policyRoutes];
}
