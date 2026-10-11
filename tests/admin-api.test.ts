import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSqliteDb } from "@/db";
import { authenticateStaff, bootstrapOwnerFromEnvironment, createStaff, createStaffSession, getStaffBySessionToken, listStaff } from "@/db/staff-repository";
import { assertAuthoritativeStorage, PersistenceUnavailableError } from "@/lib/authoritative-write";
import { guardMutationOrigin, hasForbiddenCommercialProductFields, privateJsonHeaders, staffCan, staffCanChangeOrderStatus } from "@/lib/staff-access";

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

test("serverless ephemeral production writes allow verified storage", () => {
  process.env.HAMI_BLOCK_MUTATIONS = "1";
  assert.throws(() => assertAuthoritativeStorage(), PersistenceUnavailableError);
  delete process.env.HAMI_BLOCK_MUTATIONS;
  assert.doesNotThrow(() => assertAuthoritativeStorage());
});

test("RBAC matrix enforces strict role permissions across all 5 roles", () => {
  const kitchen = createStaff({ username: "kitchen-test@example.test", displayName: "Bếp", password: "valid-pwd-1234", roles: ["KITCHEN"] });
  const sales = createStaff({ username: "sales-test@example.test", displayName: "Sales", password: "valid-pwd-1234", roles: ["SALES"] });
  const manager = createStaff({ username: "manager-test@example.test", displayName: "Quản lý", password: "valid-pwd-1234", roles: ["MANAGER"] });
  const owner = createStaff({ username: "owner-test@example.test", displayName: "Chủ", password: "valid-pwd-1234", roles: ["OWNER"] });
  const marketing = createStaff({ username: "mkt-test@example.test", displayName: "Marketing", password: "valid-pwd-1234", roles: ["MARKETING"] });

  // Kitchen: can read orders & prepare, cannot write or collect or refund
  assert.equal(staffCan(kitchen, "orders.read"), true);
  assert.equal(staffCan(kitchen, "orders.prepare"), true);
  assert.equal(staffCan(kitchen, "orders.write"), false);
  assert.equal(staffCan(kitchen, "payments.collect"), false);
  assert.equal(staffCan(kitchen, "payments.refund"), false);

  // Sales: can read/write orders, collect payment, read customers. Cannot prepare dishes, refund, or manage commercial catalog
  assert.equal(staffCan(sales, "orders.read"), true);
  assert.equal(staffCan(sales, "orders.write"), true);
  assert.equal(staffCan(sales, "payments.collect"), true);
  assert.equal(staffCan(sales, "customers.read"), true);
  assert.equal(staffCan(sales, "orders.prepare"), false);
  assert.equal(staffCan(sales, "payments.refund"), false);
  assert.equal(staffCan(sales, "catalog.commercial.write"), false);
  assert.equal(staffCanChangeOrderStatus(sales, "PREPARING"), false);
  assert.equal(staffCanChangeOrderStatus(sales, "DELIVERING"), false);
  assert.equal(staffCanChangeOrderStatus(sales, "COMPLETED"), true);
  assert.equal(staffCanChangeOrderStatus(kitchen, "PREPARING"), true);
  assert.equal(staffCanChangeOrderStatus(kitchen, "DELIVERING"), true);
  assert.equal(staffCanChangeOrderStatus(kitchen, "COMPLETED"), false);
  assert.equal(staffCanChangeOrderStatus(sales, "CANCELLED"), false);
  assert.equal(staffCanChangeOrderStatus(manager, "CANCELLED"), true);

  // Marketing: content write only
  assert.equal(staffCan(marketing, "content.write"), true);
  assert.equal(staffCan(marketing, "orders.read"), false);
  assert.equal(staffCan(marketing, "customers.read"), false);

  // Manager: full operational powers including refund and commercial pricing, but not staff.manage
  assert.equal(staffCan(manager, "payments.refund"), true);
  assert.equal(staffCan(manager, "catalog.commercial.write"), true);
  assert.equal(staffCan(manager, "orders.prepare"), true);
  assert.equal(staffCan(manager, "staff.manage"), false);

  // Owner: supreme powers including staff.manage
  assert.equal(staffCan(owner, "staff.manage"), true);
  assert.equal(staffCan(owner, "settings.sensitive"), true);
});

