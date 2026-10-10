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
