import type { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/config/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SEO_CONFIG.defaultTitle,
    short_name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#FFFCF4",
    theme_color: "#155132",
    lang: "vi",
    icons: [
      {
        src: "/brand/ha-mi-favicon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
