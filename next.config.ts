import type { NextConfig } from "next";
import { isPreviewDeployment } from "./lib/deployment-policy";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return isPreviewDeployment(process.env.VERCEL_ENV) ? [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }] : [];
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...(process.env.VERCEL==="1" || process.env.HAMI_STATIC_MEDIA_R2==="1" ? [
          {source:"/brand/:path*",destination:"/api/media/static/brand/:path*"},
          {source:"/bai-viet/:file(.*\\.(?:png|jpg|jpeg|webp|gif|avif))",destination:"/api/media/static/bai-viet/:file"},
          {source:"/assets/brand/:path*",destination:"/api/media/static/assets/brand/:path*"},
          {source:"/assets/bai-viet/:path*",destination:"/api/media/static/assets/bai-viet/:path*"},
        ] : []),
        {
          source: "/quan-tri",
          destination: "/admin.html",
        },
        {
          source: "/admin",
          destination: "/admin.html",
        },
      ],
    };
  },
};

export default nextConfig;
