import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getSqliteDb } from "@/db";
import { authenticateStaff, createStaff, createStaffSession, getStaffBySessionToken, hashStaffPassword, listStaff, updateStaff, verifyStaffPassword } from "@/db/staff-repository";
import { guardMutationOrigin, staffCan } from "@/lib/staff-access";

const testDir = fs.mkdtempSync(path.join(os.tmpdir(), "hami-staff-auth-"));

before(() => {
  process.env.HAMI_DB_PATH = path.join(testDir, "auth.sqlite");
  const db = getSqliteDb();
  listStaff();
  db.exec("DELETE FROM staff_sessions; DELETE FROM staff_roles; DELETE FROM staff_users;");
});

after(() => {
  delete process.env.HAMI_DB_PATH;
  fs.rmSync(testDir, { recursive: true, force: true });
});

test("password hashes are individually salted and legacy hashes are refused", () => {
  const first = hashStaffPassword("correct horse battery staple");
  const second = hashStaffPassword("correct horse battery staple");
  assert.notEqual(first, second);
  assert.equal(verifyStaffPassword("correct horse battery staple", first), true);
  assert.equal(verifyStaffPassword("wrong password here", first), false);
  assert.equal(verifyStaffPassword("correct horse battery staple", "f".repeat(64)), false);
});

test("credentials are per-account and multi-role capabilities are additive", () => {
  const owner = createStaff({ username: "owner@example.test", displayName: "Owner", password: "owner password 1234", roles: ["OWNER"] });
  const staff = createStaff({ username: "multi@example.test", displayName: "Multi", password: "multi password 1234", roles: ["KITCHEN", "MARKETING"] });
  assert.equal(authenticateStaff(staff.username, "owner password 1234"), null);
  const authenticated = authenticateStaff(staff.username, "multi password 1234");
  assert.deepEqual(authenticated?.roles.sort(), ["KITCHEN", "MARKETING"]);
  assert.equal(staffCan(authenticated!, "orders.prepare"), true);
  assert.equal(staffCan(authenticated!, "content.write"), true);
  assert.equal(staffCan(authenticated!, "payments.collect"), false);
  assert.equal(owner.roles.includes("OWNER"), true);
});

test("role edits revoke active sessions and current roles are read from storage", () => {
  const staff = authenticateStaff("multi@example.test", "multi password 1234")!;
  const { token } = createStaffSession(staff.id);
  assert.deepEqual(getStaffBySessionToken(token)?.roles.sort(), ["KITCHEN", "MARKETING"]);
  updateStaff(staff.id, { roles: ["MARKETING"] });
  assert.equal(getStaffBySessionToken(token), null);
});

test("last active owner cannot be deactivated or demoted", () => {
  const db = getSqliteDb();
  const owner = authenticateStaff("owner@example.test", "owner password 1234")!;
  assert.throws(() => updateStaff(owner.id, { isActive: false }), /cuối cùng/);
  assert.equal(Number((db.prepare("SELECT is_active FROM staff_users WHERE id = ?").get(owner.id) as { is_active: number }).is_active), 1);
  assert.throws(() => updateStaff(owner.id, { roles: ["MANAGER"] }), /cuối cùng/);
});

test("mutation origin guard requires an exact same-origin browser request", () => {
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/staff", { method: "PATCH" })), false);
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/staff", { method: "PATCH", headers: { origin: "https://yenhami.com" } })), true);
  assert.equal(guardMutationOrigin(new Request("https://yenhami.com/api/admin/staff", { method: "PATCH", headers: { origin: "https://evil.example" } })), false);
});
