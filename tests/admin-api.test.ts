import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSqliteDb } from "@/db";
import { authenticateStaff, bootstrapOwnerFromEnvironment, createStaff, createStaffSession, getStaffBySessionToken, listStaff } from "@/db/staff-repository";
import { assertAuthoritativeStorage, PersistenceUnavailableError } from "@/lib/authoritative-write";
import { guardMutationOrigin, hasForbiddenCommercialProductFields, privateJsonHeaders, staffCan } from "@/lib/staff-access";

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-admin-api-"));
const previous = { dbPath: process.env.HAMI_DB_PATH, adminPassword: process.env.HAMI_ADMIN_PASSWORD, adminUsername: process.env.HAMI_ADMIN_USERNAME, vercel: process.env.VERCEL };

before(() => {
  process.env.HAMI_DB_PATH = path.join(testDir, "admin-api.sqlite");
  listStaff();
  getSqliteDb().exec("DELETE FROM staff_sessions; DELETE FROM staff_roles; DELETE FROM staff_users;");
  delete process.env.HAMI_ADMIN_PASSWORD;
  delete process.env.HAMI_ADMIN_USERNAME;
  delete process.env.VERCEL;
});

after(() => {
  for (const [key, value] of Object.entries(previous)) {
    const envKey = key === "dbPath" ? "HAMI_DB_PATH" : key === "adminPassword" ? "HAMI_ADMIN_PASSWORD" : key === "adminUsername" ? "HAMI_ADMIN_USERNAME" : "VERCEL";
    if (value === undefined) delete process.env[envKey]; else process.env[envKey] = value;
  }
  fs.rmSync(testDir, { recursive: true, force: true });
});

test("owner bootstrap is unavailable without an explicit password", () => {
  assert.equal(bootstrapOwnerFromEnvironment(), null);
  assert.deepEqual(listStaff(), []);
});

test("explicit one-time bootstrap creates a scrypt owner and cannot run twice", () => {
  process.env.HAMI_ADMIN_USERNAME = "initial-owner@example.test";
  process.env.HAMI_ADMIN_PASSWORD = "bootstrap password 1234";
  const owner = bootstrapOwnerFromEnvironment();
  assert.equal(owner?.username, "initial-owner@example.test");
  assert.deepEqual(owner?.roles, ["OWNER"]);
  assert.equal(bootstrapOwnerFromEnvironment(), null);
  assert.equal(authenticateStaff("initial-owner@example.test", "bootstrap password 1234")?.id, owner?.id);
});

test("active account and current roles remain authoritative for sessions", () => {
  const marketing = createStaff({ username: "marketing-api@example.test", displayName: "Marketing API", password: "marketing password 1234", roles: ["MARKETING"] });
  const session = createStaffSession(marketing.id);
  const current = getStaffBySessionToken(session.token)!;
  assert.equal(staffCan(current, "content.write"), true);
  assert.equal(staffCan(current, "catalog.commercial.write"), false);
  assert.equal(staffCan(current, "orders.read"), false);
});

test("marketing product payload rejects commercial fields, including false and null values", () => {
  assert.equal(hasForbiddenCommercialProductFields({ name: "Yến", shortDescription: "Nội dung" }), false);
  assert.equal(hasForbiddenCommercialProductFields({ name: "Yến", priceVnd: null }), true);
  assert.equal(hasForbiddenCommercialProductFields({ isAvailable: false }), true);
  assert.equal(hasForbiddenCommercialProductFields({ variants: [] }), true);
});

test("admin JSON policy is private and mutation origin matching is exact", () => {
  const headers = new Headers(privateJsonHeaders());
  assert.match(headers.get("cache-control") || "", /private/);
  assert.match(headers.get("cache-control") || "", /no-store/);
  assert.equal(headers.get("vary"), "Cookie");
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/catalog", { method: "PATCH", headers: { origin: "https://yenhami.com" } })), true);
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/catalog", { method: "PATCH" })), false);
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/catalog", { method: "PATCH", headers: { origin: "http://yenhami.com" } })), false);
});

test("serverless ephemeral production writes fail closed", () => {
  process.env.VERCEL = "1";
  assert.throws(() => assertAuthoritativeStorage(), PersistenceUnavailableError);
  delete process.env.VERCEL;
  assert.doesNotThrow(() => assertAuthoritativeStorage());
});
