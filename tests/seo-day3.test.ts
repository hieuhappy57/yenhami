import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { isPreviewDeployment } from "../lib/deployment-policy";

function load(file: string, env = "production", overrides: Record<string, unknown> = {}) {
  const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
  } });
  const module = { exports: {} as Record<string, any> };
  const brand = { brandName: "Yến Sào Hà Mi", shortName: "Hà Mi",
    contact: { addressDisplay: "180 Hoàng Minh Giám, Hòa Xuân, Đà Nẵng, Việt Nam" } };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, URL,
    process: { env: { VERCEL_ENV: env } },
    require: (name: string) => {
      if (name in overrides) return overrides[name];
      if (name === "./brand" || name === "@/config/brand") return { BRAND_CONFIG: brand };
      if (name === "@/lib/deployment-policy") return { isPreviewDeployment };
      if (name === "@/config/seo") return load("config/seo.ts", env);
      if (name === "@/db") return {};
      if (name.startsWith("@/components/") || name === "lucide-react" ||
        name === "react" || name === "next/link" || name === "next/navigation") return {};
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename: file });
  return module.exports;
}

describe("Commercial metadata", () => {
  it("uses focused home copy without unverified numeric, health or certificate claims", () => {
    const seo = load("config/seo.ts");
    assert.equal(seo.SEO_CONFIG.defaultTitle, "Yến Sào Đà Nẵng | Hà Mi");
    assert.doesNotMatch(seo.SEO_CONFIG.defaultDescription, /ISO|FDA|35g|295|2H|2 giờ|mẹ bầu|người bệnh/i);
    assert.match(seo.SEO_CONFIG.defaultDescription, /Hà Mi xác nhận/);
    assert.ok(!seo.SEO_CONFIG.keywords.some((word: string) => /ISO|FDA|bà bầu|thăm bệnh/i.test(word)));
    assert.equal("geo.position" in seo.GEO_META_TAGS, false);
    assert.equal("ICBM" in seo.GEO_META_TAGS, false);
  });
  it("exports unique local page metadata with correct canonical and preview policies", () => {
    const pages = [
      ["yen-tuoi-chung-nong", "Yến Tươi Chưng Nóng Đà Nẵng"],
      ["gui-qua", "Quà Tặng Yến Sào Đà Nẵng"],
      ["lien-he", "Liên Hệ Yến Sào Hà Mi Tại Đà Nẵng"],
    ];
    const descriptions = new Set<string>();
    for (const [slug, title] of pages) {
      for (const env of ["production", "preview"]) {
        const meta = load(`app/${slug}/page.tsx`, env).metadata;
        assert.equal(meta.title, title);
        assert.equal(meta.alternates.canonical, `https://yenhami.com/${slug}`);
        assert.equal(meta.robots.index, env === "production");
        assert.doesNotMatch(meta.description, /ISO|FDA|35g|295|2H|2 giờ/i);
        descriptions.add(meta.description);
        if (slug === "lien-he") assert.match(meta.description, /180 Hoàng Minh Giám/);
      }
    }
    assert.equal(descriptions.size, 3);
  });
  it("preserves zero/known prices and does not promise hot delivery for jars", async () => {
    const product = { slug: "jar", name: "Yến Hũ", categoryLabel: "Yến hũ chưng sẵn",
      ingredients: ["Yến"], tasteProfile: "Thanh", shortDescription: "Hũ yến", imageUrl: "/jar.webp",
      priceVnd: null as number | null | undefined };
    const page = load("app/san-pham/[slug]/page.tsx", "production", {
      "@/db": { syncDbFromCloud: async () => {}, getProductBySlug: () => product },
    });
    for (const price of [0, 185000, null, undefined, NaN, Infinity, -1]) {
      product.priceVnd = price;
      const meta = await page.generateMetadata({ params: Promise.resolve({ slug: "jar" }) });
      const expected = typeof price === "number" && Number.isFinite(price) && price >= 0
        ? `${price.toLocaleString("vi-VN")}đ` : "Liên hệ";
      assert.ok(meta.title.includes(`(${expected})`));
      assert.doesNotMatch(meta.description, /2H|giao nóng/i);
      assert.equal(meta.alternates.canonical, "https://yenhami.com/san-pham/jar");
    }
  });
  it("links existing home categories to commercial pages without adding sections", () => {
    const source = fs.readFileSync("app/page.tsx", "utf8");
    assert.match(source, /title: "Yến Tươi Chưng Nóng"[^}]+href: "\/yen-tuoi-chung-nong"/);
    assert.match(source, /title: "Set Quà Thượng Hạng"[^}]+href: "\/gui-qua"/);
    const llms = fs.readFileSync("app/llms.txt/route.ts", "utf8");
    assert.match(llms, /\*\*Địa bàn:\*\* Đà Nẵng, Việt Nam/);
    assert.doesNotMatch(llms, /GEO_CONFIG\.(latitude|longitude)/);
  });
});
