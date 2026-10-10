import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/seo";

const INTERNAL_DISALLOW = [
  "/quan-tri",
  "/admin",
  "/admin.html",
  "/admin-demo.html",
  "/api/",
  "/yeu-cau-da-nhan",
  "/gio-hang",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: INTERNAL_DISALLOW,
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: INTERNAL_DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
