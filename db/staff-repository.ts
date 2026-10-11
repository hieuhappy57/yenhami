import crypto from "node:crypto";
import { getSqliteDb } from "@/db";

export const STAFF_ROLES = ["OWNER", "MANAGER", "SALES", "KITCHEN", "MARKETING"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export interface PublicStaff {
  id: string;
  username: string;
  email: string | null;
  displayName: string;
  role: StaffRole;
  roles: StaffRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
let schemaReadyForPath = "";

function dbPathKey() {
  return process.env.HAMI_DB_PATH || "default";
}

function ensureSchema() {
  const db = getSqliteDb();
  if (schemaReadyForPath === dbPathKey()) return db;
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_roles (
      staff_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('OWNER','MANAGER','SALES','KITCHEN','MARKETING')),
      PRIMARY KEY (staff_id, role),
      FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS staff_sessions (
      token_hash TEXT PRIMARY KEY,
      staff_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (staff_id) REFERENCES staff_users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS staff_sessions_staff_idx ON staff_sessions(staff_id);
    CREATE TABLE IF NOT EXISTS staff_login_attempts (
      attempt_key TEXT PRIMARY KEY,
      failed_attempts INTEGER NOT NULL,
      blocked_until TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  const columns = db.prepare("PRAGMA table_info(staff_users)").all() as Array<{ name: string }>;
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("email")) db.exec("ALTER TABLE staff_users ADD COLUMN email TEXT");
  if (!names.has("updated_at")) db.exec("ALTER TABLE staff_users ADD COLUMN updated_at TEXT");
  db.prepare("UPDATE staff_users SET updated_at = COALESCE(updated_at, created_at)").run();
  db.prepare(`
    INSERT OR IGNORE INTO staff_roles (staff_id, role)
    SELECT id, CASE WHEN role = 'OPS_ADMIN' THEN 'OWNER' ELSE role END
    FROM staff_users WHERE role IN ('OWNER','MANAGER','SALES','KITCHEN','MARKETING','OPS_ADMIN')
  `).run();
  try {
    const legacyDefault = "4fb8e53366c3f2c1aa9ff72dd095ec5f68e514d0161652e3f33350460581035a";
    const rows = db.prepare("SELECT id FROM staff_users WHERE password_hash = ?").all(legacyDefault) as Array<{ id: string }>;
    if (rows.length > 0) {
      const modernHash = hashStaffPassword("HaMi@2026!");
      const stmt = db.prepare("UPDATE staff_users SET password_hash = ? WHERE id = ?");
      for (const r of rows) {
        stmt.run(modernHash, r.id);
      }
    }
  } catch {}
  const staffCount = (db.prepare("SELECT COUNT(*) as cnt FROM staff_users").get() as { cnt: number }).cnt;
  if (staffCount === 0 && process.env.HAMI_DISABLE_DEFAULT_STAFF !== "1") {
    const defaultMasterPassword = process.env.HAMI_ADMIN_PASSWORD || "HaMi@2026!";
    const defaultMasterHash = hashStaffPassword(defaultMasterPassword);
    const nowIso = new Date().toISOString();
    const insertStaff = db.prepare(`
      INSERT INTO staff_users (id, username, email, display_name, role, password_hash, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `);
    const defaultStaff = [
      { id: "staff-admin-1", username: "hami_staff", email: null, displayName: "Điều phối Bếp & CSKH Hà Mi", role: "OWNER" },
      { id: "staff-1", username: "hieunv@yenhami.com", email: "hieunv@yenhami.com", displayName: "Nguyễn Văn Hiếu", role: "OWNER" },
      { id: "staff-2", username: "vietdh1985@gmail.com", email: "vietdh1985@gmail.com", displayName: "Đặng Hữu Việt", role: "MANAGER" },
      { id: "staff-3", username: "bep@yenhami.com", email: "bep@yenhami.com", displayName: "Bộ phận Bếp & Pha chế", role: "KITCHEN" },
      { id: "staff-4", username: "cskh@yenhami.com", email: "cskh@yenhami.com", displayName: "Bộ phận CSKH & Tư vấn", role: "SALES" },
      { id: "staff-5", username: "marketing@yenhami.com", email: "marketing@yenhami.com", displayName: "Bộ phận Marketing & Nội dung", role: "MARKETING" },
    ];
    for (const s of defaultStaff) {
      insertStaff.run(s.id, s.username, s.email, s.displayName, s.role, defaultMasterHash, nowIso, nowIso);
    }
    const insertRole = db.prepare("INSERT OR IGNORE INTO staff_roles (staff_id, role) VALUES (?, ?)");
    for (const s of defaultStaff) {
      insertRole.run(s.id, s.role);
    }
  }
  schemaReadyForPath = dbPathKey();
  return db;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function validateRoles(input: unknown): StaffRole[] {
  if (!Array.isArray(input)) throw new Error("Cần chọn ít nhất một vai trò hợp lệ.");
  const roles = [...new Set(input.map(String))].filter((role): role is StaffRole =>
    STAFF_ROLES.includes(role as StaffRole),
  );
  if (!roles.length || roles.length !== input.length) throw new Error("Vai trò nhân viên không hợp lệ.");
  return roles;
}

function toPublicStaff(row: Record<string, unknown>, roles: StaffRole[]): PublicStaff {
  return {
    id: String(row.id),
    username: String(row.username),
    email: row.email ? String(row.email) : null,
    displayName: String(row.display_name),
    role: roles[0],
    roles,
    isActive: Number(row.is_active) === 1,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at || row.created_at),
  };
}

function rolesFor(staffId: string): StaffRole[] {
  const db = ensureSchema();
  return (db.prepare("SELECT role FROM staff_roles WHERE staff_id = ? ORDER BY CASE role WHEN 'OWNER' THEN 1 WHEN 'MANAGER' THEN 2 WHEN 'SALES' THEN 3 WHEN 'KITCHEN' THEN 4 WHEN 'MARKETING' THEN 5 END").all(staffId) as Array<{ role: StaffRole }>).map((row) => row.role);
}

export function hashStaffPassword(password: string): string {
  if (password.length < 8 || password.length > 1024) throw new Error("Mật khẩu phải dài từ 8 đến 1024 ký tự.");
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 32, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return `scrypt$v1$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

export function verifyStaffPassword(password: string, encoded: string): boolean {
  const parts = encoded.split("$");
  if (parts.length !== 7 || parts[0] !== "scrypt" || parts[1] !== "v1") return false;
  const [n, r, p] = parts.slice(2, 5).map(Number);
  if (n !== SCRYPT_N || r !== SCRYPT_R || p !== SCRYPT_P) return false;
  try {
    const salt = Buffer.from(parts[5], "base64url");
    const expected = Buffer.from(parts[6], "base64url");
    if (salt.length !== 16 || expected.length !== 32) return false;
    const actual = crypto.scryptSync(password, salt, expected.length, { N: n, r, p });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function authenticateStaff(username: string, password: string): PublicStaff | null {
  const db = ensureSchema();
  const row = db.prepare("SELECT * FROM staff_users WHERE LOWER(username) = ? AND is_active = 1").get(normalizeUsername(username)) as Record<string, unknown> | undefined;
  if (!row) return null;
  const currentHash = String(row.password_hash);
  let isValid = verifyStaffPassword(password, currentHash);
  if (!isValid && typeof currentHash === "string" && !currentHash.startsWith("scrypt$v1$")) {
    try {
      const legacyCandidate = crypto.scryptSync(password, "hami-local-salt-v1", 32).toString("hex");
      if (Buffer.byteLength(legacyCandidate) === Buffer.byteLength(currentHash) && crypto.timingSafeEqual(Buffer.from(legacyCandidate), Buffer.from(currentHash))) {
        isValid = true;
        const upgraded = hashStaffPassword(password);
        db.prepare("UPDATE staff_users SET password_hash = ? WHERE id = ?").run(upgraded, String(row.id));
      }
    } catch {}
  }
  if (!isValid) return null;
  const roles = rolesFor(String(row.id));
  return roles.length ? toPublicStaff(row, roles) : null;
}

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createStaffSession(staffId: string): { token: string; expiresAt: string } {
  const db = ensureSchema();
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare("INSERT INTO staff_sessions (token_hash, staff_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(tokenHash(token), staffId, expiresAt, now.toISOString());
  return { token, expiresAt };
}

export function getStaffBySessionToken(token: string): PublicStaff | null {
  const db = ensureSchema();
  const row = db.prepare(`
    SELECT u.* FROM staff_sessions s JOIN staff_users u ON u.id = s.staff_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.is_active = 1
  `).get(tokenHash(token), new Date().toISOString()) as Record<string, unknown> | undefined;
  if (!row) return null;
  const roles = rolesFor(String(row.id));
  return roles.length ? toPublicStaff(row, roles) : null;
}

export function revokeStaffSession(token: string) {
  ensureSchema().prepare("UPDATE staff_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE token_hash = ?").run(new Date().toISOString(), tokenHash(token));
}

export function revokeAllStaffSessions(staffId: string) {
  ensureSchema().prepare("UPDATE staff_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE staff_id = ?").run(new Date().toISOString(), staffId);
}

export function listStaff(): PublicStaff[] {
  const db = ensureSchema();
  return (db.prepare("SELECT * FROM staff_users ORDER BY display_name, username").all() as Record<string, unknown>[]).map((row) => toPublicStaff(row, rolesFor(String(row.id))));
}

export function createStaff(input: { username: string; email?: string | null; displayName: string; password: string; roles: unknown }): PublicStaff {
  const db = ensureSchema();
  const roles = validateRoles(input.roles);
  const username = normalizeUsername(input.username);
  const displayName = input.displayName.trim();
  if (!username || username.length > 120 || !displayName || displayName.length > 160) throw new Error("Thông tin nhân viên không hợp lệ.");
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = hashStaffPassword(input.password);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO staff_users (id, username, email, display_name, role, password_hash, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)").run(id, username, input.email?.trim().toLowerCase() || null, displayName, roles[0], passwordHash, now, now);
    const addRole = db.prepare("INSERT INTO staff_roles (staff_id, role) VALUES (?, ?)");
    roles.forEach((role) => addRole.run(id, role));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return listStaff().find((staff) => staff.id === id)!;
}

export function updateStaff(staffId: string, input: { username?: string; email?: string | null; displayName?: string; password?: string; roles?: unknown; isActive?: boolean }): PublicStaff {
  const db = ensureSchema();
  const current = listStaff().find((staff) => staff.id === staffId);
  if (!current) throw new Error("Không tìm thấy nhân viên.");
  const roles = input.roles === undefined ? current.roles : validateRoles(input.roles);
  const isActive = input.isActive ?? current.isActive;
  const username = input.username === undefined ? current.username : normalizeUsername(input.username);
  const displayName = input.displayName === undefined ? current.displayName : input.displayName.trim();
  if (!username || !displayName) throw new Error("Thông tin nhân viên không hợp lệ.");
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    if (current.isActive && current.roles.includes("OWNER") && (!isActive || !roles.includes("OWNER"))) {
      const activeOwnerCount = (db.prepare("SELECT COUNT(DISTINCT u.id) AS count FROM staff_users u JOIN staff_roles r ON r.staff_id = u.id WHERE u.is_active = 1 AND r.role = 'OWNER'").get() as { count: number }).count;
      if (activeOwnerCount <= 1) throw new Error("Không thể vô hiệu hóa hoặc hạ quyền chủ sở hữu đang hoạt động cuối cùng.");
    }
    db.prepare("UPDATE staff_users SET username = ?, email = ?, display_name = ?, role = ?, is_active = ?, password_hash = COALESCE(?, password_hash), updated_at = ? WHERE id = ?").run(username, input.email === undefined ? current.email : input.email?.trim().toLowerCase() || null, displayName, roles[0], isActive ? 1 : 0, input.password === undefined ? null : hashStaffPassword(input.password), now, staffId);
    db.prepare("DELETE FROM staff_roles WHERE staff_id = ?").run(staffId);
    const addRole = db.prepare("INSERT INTO staff_roles (staff_id, role) VALUES (?, ?)");
    roles.forEach((role) => addRole.run(staffId, role));
    db.prepare("UPDATE staff_sessions SET revoked_at = COALESCE(revoked_at, ?) WHERE staff_id = ?").run(now, staffId);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return listStaff().find((staff) => staff.id === staffId)!;
}

export function bootstrapOwnerFromEnvironment(): PublicStaff | null {
  const db = ensureSchema();
  const activeOwner = db.prepare("SELECT 1 FROM staff_users u JOIN staff_roles r ON r.staff_id = u.id WHERE u.is_active = 1 AND r.role = 'OWNER' LIMIT 1").get();
  if (activeOwner || !process.env.HAMI_ADMIN_PASSWORD) return null;
  return createStaff({ username: process.env.HAMI_ADMIN_USERNAME || "admin", displayName: "Hà Mi Owner", password: process.env.HAMI_ADMIN_PASSWORD, roles: ["OWNER"] });
}

export function consumeLoginAttempt(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const db = ensureSchema();
  const now = new Date();
  const row = db.prepare("SELECT * FROM staff_login_attempts WHERE attempt_key = ?").get(key) as Record<string, unknown> | undefined;
  const blockedUntil = row?.blocked_until ? new Date(String(row.blocked_until)) : null;
  return { allowed: !blockedUntil || blockedUntil <= now, retryAfterSeconds: blockedUntil ? Math.max(0, Math.ceil((blockedUntil.getTime() - now.getTime()) / 1000)) : 0 };
}

export function recordLoginFailure(key: string) {
  const db = ensureSchema();
  const now = new Date();
  const row = db.prepare("SELECT failed_attempts, updated_at FROM staff_login_attempts WHERE attempt_key = ?").get(key) as { failed_attempts: number; updated_at: string } | undefined;
  const reset = !row || now.getTime() - new Date(row.updated_at).getTime() > 15 * 60 * 1000;
  const failures = (reset ? 0 : Number(row.failed_attempts)) + 1;
  const blockedUntil = failures >= 5 ? new Date(now.getTime() + 15 * 60 * 1000).toISOString() : null;
  db.prepare("INSERT INTO staff_login_attempts (attempt_key, failed_attempts, blocked_until, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(attempt_key) DO UPDATE SET failed_attempts=excluded.failed_attempts, blocked_until=excluded.blocked_until, updated_at=excluded.updated_at").run(key, failures, blockedUntil, now.toISOString());
}

export function clearLoginFailures(key: string) {
  ensureSchema().prepare("DELETE FROM staff_login_attempts WHERE attempt_key = ?").run(key);
}
