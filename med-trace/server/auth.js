// Password hashing and session tokens for the account store.
// Passwords are never stored or compared in plain text: each one gets a random
// salt and a scrypt hash, and comparison is timing-safe.
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';

const SECRET = process.env.SESSION_SECRET || 'medtrace-dev-secret-change-me';
const KEYLEN = 64;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const expected = Buffer.from(parts[2], 'hex');
  if (!expected.length) return false;
  const actual = scryptSync(password, parts[1], expected.length);
  return timingSafeEqual(expected, actual);
}

// Stateless signed token: "<userId>.<expiry>.<hmac>". Survives a server restart,
// so a signed-in session is not lost when the process reloads.
export function signToken(userId, ttlMs = WEEK_MS) {
  const exp = Date.now() + ttlMs;
  const payload = `${userId}.${exp}`;
  const sig = createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = createHmac('sha256', SECRET).update(`${userId}.${exp}`).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (!Number.isFinite(Number(exp)) || Number(exp) < Date.now()) return null;
  return Number(userId);
}

// Rules the signup form and the API both state, so the messages stay in step.
export function passwordProblem(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password)) return 'Password must include at least one letter.';
  if (!/\d/.test(password)) return 'Password must include at least one number.';
  return null;
}
