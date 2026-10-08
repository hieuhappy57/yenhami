import type { NextConfig } from "next";
import { isPreviewDeployment } from "./lib/deployment-policy";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    unoptimized: true,
  },
  async headers() {
    return isPreviewDeployment(process.env.VERCEL_ENV) ? [{
      source: "/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }] : [];
  },
};

export default nextConfig;
