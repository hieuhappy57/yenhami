import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { buildProductOffer } from "../lib/product-offer";

function loadSource(relativePath: string, dependencies: Record<string, unknown>) {
  const source = fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true,
    },
  });
  const module = { exports: {} as Record<string, any> };
  vm.runInNewContext(outputText, {
    module, exports: module.exports,
    require: (name: string) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
  }, { filename: relativePath });
  return module.exports;
}

describe("Product offers", () => {
  const offer = (priceVnd: number | null | undefined, status = "AVAILABLE") =>
    buildProductOffer({ priceVnd, status }, "https://example.com/product", "Ha Mi");

  it("omits unknown and invalid prices without inventing a fallback", () => {
    for (const price of [null, undefined, NaN, Infinity, -Infinity, -1]) {
      assert.equal(offer(price), undefined);
    }
  });
  it("preserves actual prices including zero and stock mapping", () => {
    for (const price of [0, 185000, 295000]) {
      assert.equal(offer(price)?.price, price);
      assert.equal(offer(price)?.priceCurrency, "VND");
    }
    assert.equal(offer(185000)?.availability, "https://schema.org/InStock");
    assert.equal(offer(185000, "SOLD_OUT")?.availability, "https://schema.org/OutOfStock");
  });
});

describe("Public article route", () => {
  function loadPost(post: Record<string, unknown> | null) {
    return loadSource("app/bai-viet/[slug]/page.tsx", {
      react: { createElement: (...args: unknown[]) => args },
      "next/link": () => null,
      "next/navigation": { notFound: () => { throw new Error("NOT_FOUND"); } },
      "lucide-react": {},
      "@/db": { syncDbFromCloud: async () => {}, getPostBySlug: () => post, getAllPosts: () => [] },
      "@/components/SeoJsonLd": {},
      "@/config/seo": { buildPageMetadata: (input: unknown) => input },
      "@/config/brand": { BRAND_CONFIG: { contact: {} } },
    });
  }
  it("blocks drafts and missing posts in metadata and page rendering", async () => {
    for (const post of [null, { isPublished: false, title: "Private draft" }]) {
      const route = loadPost(post);
      const request = () => ({ params: Promise.resolve({ slug: "test" }) });
      await assert.rejects(route.generateMetadata(request()), /NOT_FOUND/);
      await assert.rejects(route.default(request()), /NOT_FOUND/);
    }
  });
  it("keeps published posts accessible with their own metadata", async () => {
    const route = loadPost({ isPublished: true, id: "fixture", slug: "public", title: "Public",
      excerpt: "Verified", content: "Text", category: "Products", coverImageUrl: "/test.jpg",
      createdAt: "2026-10-08", updatedAt: "2026-10-08" });
    const request = () => ({ params: Promise.resolve({ slug: "public" }) });
    assert.equal((await route.generateMetadata(request())).title, "Public");
    assert.ok(await route.default(request()));
  });
});

describe("Rendered structured data", () => {
  const brand = { brandName: "Ha Mi", contact: {
    addressDisplay: "180 Hoàng Minh Giám, Hòa Xuân, Đà Nẵng, Việt Nam",
  } };
  const schemaModule = () => loadSource("components/SeoJsonLd.tsx", {
    react: { createElement: (_type: unknown, props: unknown) => props },
    "@/config/brand": { BRAND_CONFIG: brand },
    "@/config/seo": { GEO_CONFIG: { servedDistricts: [] },
      SEO_CONFIG: { siteUrl: "https://example.com" },
      absoluteUrl: (value: string) => `https://example.com${value}` },
    "@/lib/product-offer": { buildProductOffer },
  });
  it("keeps Product and breadcrumbs but omits an unpriced Offer", () => {
    const render = schemaModule().ProductJsonLd;
    const product = { slug: "test", name: "Test", ingredients: [], status: "AVAILABLE", priceVnd: null };
    const read = (price: number | null) => JSON.parse(render({ product: { ...product, priceVnd: price } })
      .dangerouslySetInnerHTML.__html);
    assert.equal(read(null)["@graph"][0]["@type"], "Product");
    assert.equal("offers" in read(null)["@graph"][0], false);
    assert.equal(read(null)["@graph"][1]["@type"], "BreadcrumbList");
    assert.equal(read(185000)["@graph"][0].offers.price, 185000);
  });
  it("uses main store address without unverified city-center coordinates", () => {
    const props = schemaModule().OrganizationAndLocalBusinessJsonLd();
    const local = JSON.parse(props.dangerouslySetInnerHTML.__html)["@graph"][1];
    assert.equal(local.address.streetAddress, brand.contact.addressDisplay);
    assert.equal("geo" in local, false);
    assert.equal(local.areaServed.some((area: Record<string, unknown>) => area["@type"] === "GeoCircle"), false);
  });
});
