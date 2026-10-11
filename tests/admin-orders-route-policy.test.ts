import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { privateJsonHeaders, readBoundedJson } from "../lib/staff-access";

describe("admin orders route transport policy", () => {
  it("marks success and error JSON responses private and non-cacheable", async () => {
    const headers = new Headers(privateJsonHeaders());
    assert.match(headers.get("cache-control") || "", /private/);
    assert.match(headers.get("cache-control") || "", /no-store/);
    assert.equal(headers.get("pragma"), "no-cache");
  });

  it("accepts bounded JSON and rejects declared or actual bodies over 64 KB", async () => {
    assert.deepEqual(await readBoundedJson(new Request("http://localhost/api/admin/orders", {
      method: "POST", body: JSON.stringify({ action: "status" }),
    }), 64 * 1024), { action: "status" });

    await assert.rejects(readBoundedJson(new Request("http://localhost/api/admin/orders", {
      method: "POST", headers: { "content-length": String(65 * 1024) }, body: "{}",
    }), 64 * 1024), (error: unknown) => Boolean(error && typeof error === "object" && "status" in error && error.status === 413));

    await assert.rejects(readBoundedJson(new Request("http://localhost/api/admin/orders", {
      method: "POST", body: JSON.stringify({ value: "x".repeat(65 * 1024) }),
    }), 64 * 1024), (error: unknown) => Boolean(error && typeof error === "object" && "status" in error && error.status === 413));
  });
});
