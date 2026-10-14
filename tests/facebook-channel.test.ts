import { it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BRAND_CONFIG } from "../config/brand";

it("links the approved Facebook page and configures Messenger", () => {
  assert.equal(BRAND_CONFIG.contact.facebookUrl, "https://www.facebook.com/yenhamidanang/");
  assert.equal(BRAND_CONFIG.contact.messengerUrl, process.env.NEXT_PUBLIC_HAMI_MESSENGER_URL || "https://m.me/yenhamidanang");
});

it("exposes Facebook contact links and organization identity without a tracking embed", () => {
  for (const file of ["components/SiteFooter.tsx", "app/lien-he/page.tsx"]) {
    const source = fs.readFileSync(file, "utf8");
    assert.match(source, /href=\{BRAND_CONFIG.contact.facebookUrl\}/);
    assert.match(source, /rel="noopener noreferrer"/);
    assert.doesNotMatch(source, /facebook.com\/plugins|<iframe/);
  }
  assert.match(fs.readFileSync("components/SeoJsonLd.tsx", "utf8"), /sameAs: \[BRAND_CONFIG.contact.facebookUrl/);
});
