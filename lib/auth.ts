import crypto from "crypto";

const SESSION_COOKIE = "wt_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET env var is not set");
  return s;
}

function getPasswordHash(): { salt: string; hash: string } {
  const stored = process.env.PASSWORD_HASH;
  if (!stored) throw new Error("PASSWORD_HASH env var is not set");
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) throw new Error("PASSWORD_HASH env var is malformed");
  return { salt, hash };
}

// Verify a submitted password against the PBKDF2 hash stored in env.
export function verifyPassword(password: string): boolean {
  const { salt, hash } = getPasswordHash();
  const derived = crypto
    .pbkdf2Sync(password, Buffer.from(salt, "hex"), 210_000, 32, "sha256")
    .toString("hex");
  const a = Buffer.from(derived, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Session token = random opaque id + expiry, HMAC-signed. Never derived from
// the password itself — this avoids the "session ID = hash(password)" flaw.
export function createSessionToken(): string {
  const id = crypto.randomBytes(24).toString("hex");
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${id}.${exp}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, expStr, sig] = parts;
  const payload = `${id}.${expStr}`;
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;
  const exp = parseInt(expStr, 10);
  if (Number.isNaN(exp) || Date.now() > exp) return false;
  return true;
}

export { SESSION_COOKIE, SESSION_TTL_MS };
