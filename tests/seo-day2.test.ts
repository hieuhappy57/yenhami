import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { isPreviewDeployment } from "../lib/deployment-policy";

function loadSource(file: string, dependencies: Record<string, unknown>, env: Record<string, string> = {}) {
  const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
  } });
  const module = { exports: {} as Record<string, any> };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, process: { env }, URL, Date,
    require: (name: string) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
  }, { filename: file });
  return module.exports;
}

describe("Preview indexing policy", () => {
  it("recognizes only explicit Vercel preview deployments", () => {
    assert.equal(isPreviewDeployment("preview"), true);
    for (const env of [undefined, "", "production", "development"]) {
      assert.equal(isPreviewDeployment(env), false);
    }
  });
  it("returns preview HTTP headers without blocking production or standalone builds", async () => {
    for (const env of ["preview", "production", "development", ""]) {
      const config = loadSource("next.config.ts", {
        "./lib/deployment-policy": { isPreviewDeployment },
      }, { VERCEL_ENV: env, NODE_ENV: "production" }).default;
      const headers = JSON.parse(JSON.stringify(await config.headers()));
      assert.deepEqual(headers, env === "preview" ? [{ source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      }] : []);
    }
  });
  it("keeps canonical on the confirmed domain and isolates page robots per environment", () => {
    for (const env of ["preview", "production", ""]) {
      const seo = loadSource("config/seo.ts", {
        "./brand": { BRAND_CONFIG: { brandName: "Ha Mi", shortName: "Ha Mi" } },
        "@/lib/deployment-policy": { isPreviewDeployment },
      }, { VERCEL_ENV: env });
      const page = seo.buildPageMetadata({ title: "Test", description: "Test", path: "/yen-tuoi-chung-nong" });
      assert.equal(page.alternates.canonical, "https://yenhami.com/yen-tuoi-chung-nong");
      assert.equal(page.robots.index, env !== "preview");
      assert.equal(page.robots.googleBot.index, env !== "preview");
      assert.equal(seo.buildPageMetadata({ title: "Private", description: "Private",
        path: "/quan-tri", noIndex: true }).robots.index, false);
    }
  });
  it("preserves root canonical and production robots while protecting the preview homepage", () => {
    for (const preview of [false, true]) {
      const noop = () => ({ variable: "font" });
      const dependencies: Record<string, unknown> = {
        "next/font/google": { Be_Vietnam_Pro: noop, Playfair_Display: noop, Plus_Jakarta_Sans: noop },
        "./globals.css": {},
        "@/config/seo": { GEO_META_TAGS: {}, IS_PREVIEW_DEPLOYMENT: preview,
          SEO_CONFIG: { siteUrl: "https://yenhami.com" }, absoluteUrl: (p: string) => `https://yenhami.com${p}` },
      };
      for (const component of ["CartProvider", "SiteHeader", "SiteFooter", "FloatingActionRail",
        "MobileStickyCartBar", "SeoJsonLd", "AnalyticsScripts"]) {
        dependencies[`@/components/${component}`] = {};
      }
      const metadata = loadSource("app/layout.tsx", dependencies).metadata;
      assert.equal(metadata.robots.index, !preview);
      assert.equal(metadata.robots.googleBot.index, !preview);
      assert.equal(metadata.alternates.canonical, "https://yenhami.com");
    }
  });
});

describe("Sitemap source consistency", () => {
  it("syncs before reading published data and emits only valid known modification dates", async () => {
    const calls: string[] = [];
    const posts = [
      { slug: "updated", updatedAt: "2026-01-03T10:00:00Z", createdAt: "2026-01-01" },
      { slug: "fallback", updatedAt: "invalid", createdAt: "2026-01-01" },
      { slug: "unknown", updatedAt: "invalid", createdAt: "" },
      { slug: "future", updatedAt: "2099-01-01", createdAt: "" },
      { slug: "impossible", updatedAt: "2026-02-30", createdAt: "" },
      { slug: "offset", updatedAt: "2026-01-02T00:30:00+07:00", createdAt: "" },
    ];
    const sitemap = loadSource("app/sitemap.ts", {
      "@/config/seo": { absoluteUrl: (p: string) => `https://yenhami.com${p}` },
      "@/db": {
        syncDbFromCloud: async () => { await Promise.resolve(); calls.push("sync"); },
        getAllProducts: () => { assert.equal(calls.at(-1), "sync"); calls.push("products");
          return [{ id: "fixture", slug: "product" }]; },
        getAllPosts: (published: boolean) => { assert.equal(published, true); calls.push("posts"); return posts; },
      },
    }).default;
    const first = await sitemap();
    const second = await sitemap();
    assert.deepEqual(calls, ["sync", "products", "posts", "sync", "products", "posts"]);
    assert.equal(first.length, 8 + 1 + posts.length + 4);
    assert.equal(JSON.stringify(first), JSON.stringify(second));
    for (const entry of first) {
      if (!entry.url.includes("/bai-viet/")) assert.equal("lastModified" in entry, false);
    }
    const bySlug = (slug: string) => first.find((entry: any) => entry.url.endsWith(`/bai-viet/${slug}`));
    assert.equal(bySlug("updated").lastModified.toISOString(), "2026-01-03T10:00:00.000Z");
    assert.equal(bySlug("fallback").lastModified.toISOString(), "2026-01-01T00:00:00.000Z");
    assert.equal(bySlug("offset").lastModified.toISOString(), "2026-01-01T17:30:00.000Z");
    for (const slug of ["unknown", "future", "impossible"]) {
      assert.equal("lastModified" in bySlug(slug), false);
    }
  });
});
