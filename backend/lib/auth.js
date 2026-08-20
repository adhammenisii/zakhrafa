import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSetting, setSetting } from "../db.js";

const PASSWORD_KEY = "admin_password_hash";
const BCRYPT_ROUNDS = 12;

export const MIN_PASSWORD_LENGTH = 10;

/**
 * The password lives as a bcrypt hash in the settings table so it can be changed from the
 * admin panel. ADMIN_PASSWORD in .env is only the bootstrap value: it's used until the
 * first successful login, which migrates it into a hash. After that .env is ignored.
 */
export async function verifyPassword(plain) {
  if (typeof plain !== "string" || plain.length === 0) return false;

  const hash = await getSetting(PASSWORD_KEY);
  if (hash) return bcrypt.compare(plain, hash);

  const bootstrap = process.env.ADMIN_PASSWORD || "";
  if (!bootstrap || !timingSafeEqual(plain, bootstrap)) return false;

  // First successful login on a fresh database — move the env value into a hash so the
  // panel's "change password" flow has something to compare against from here on.
  await setPassword(bootstrap);
  return true;
}

export async function setPassword(plain) {
  const hash = await bcrypt.hash(plain, BCRYPT_ROUNDS);
  await setSetting(PASSWORD_KEY, hash);
}

// Returns an error string if the new password is too weak, or null if it's acceptable.
export function passwordProblem(plain) {
  if (typeof plain !== "string" || plain.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (!/[a-z]/i.test(plain) || !/\d/.test(plain)) {
    return "Password must contain both letters and numbers";
  }
  return null;
}

// Comparison whose duration doesn't depend on how many leading characters matched.
// Both sides are hashed first so differing lengths don't throw.
function timingSafeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// --- login throttling -------------------------------------------------------

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map(); // ip -> { count, firstAt, lockedUntil }

// In-memory, so it resets when the server restarts and isn't shared across instances.
// That's an acceptable trade for a single small service — it still turns an unlimited
// online guessing attack into a handful of tries per quarter hour.
export function loginThrottle(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = attempts.get(ip);

  if (record?.lockedUntil && record.lockedUntil > now) {
    const minutes = Math.ceil((record.lockedUntil - now) / 60000);
    return res.status(429).json({ error: `Too many attempts. Try again in ${minutes} minute(s).` });
  }
  if (record && now - record.firstAt > WINDOW_MS) attempts.delete(ip);

  res.locals.recordLoginFailure = () => {
    const current = attempts.get(ip) || { count: 0, firstAt: now };
    current.count += 1;
    if (current.count >= MAX_ATTEMPTS) current.lockedUntil = now + WINDOW_MS;
    attempts.set(ip, current);
  };
  res.locals.clearLoginFailures = () => attempts.delete(ip);

  next();
}

// Drop stale entries so the map can't grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of attempts) {
    if (now - record.firstAt > WINDOW_MS && (!record.lockedUntil || record.lockedUntil < now)) {
      attempts.delete(ip);
    }
  }
}, WINDOW_MS).unref();
