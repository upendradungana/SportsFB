import * as OTPAuth from "otpauth";
import crypto from "node:crypto";
const key = () => { const k = Buffer.from(process.env.TOTP_ENC_KEY ?? "", "hex"); if (k.length !== 32) throw new Error("TOTP_ENC_KEY must be 64 hex chars"); return k; };
export function seal(t: string) { const iv = crypto.randomBytes(12), c = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([c.update(t, "utf8"), c.final()]); return Buffer.concat([iv, c.getAuthTag(), ct]).toString("base64"); }
export function open(s: string) { const b = Buffer.from(s, "base64"), d = crypto.createDecipheriv("aes-256-gcm", key(), b.subarray(0, 12));
  d.setAuthTag(b.subarray(12, 28)); return Buffer.concat([d.update(b.subarray(28)), d.final()]).toString("utf8"); }
export const newSecretB32 = () => new OTPAuth.Secret({ size: 20 }).base32;
const mk = (b32: string, email: string) => new OTPAuth.TOTP({ issuer: "SportsFB", label: email, digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(b32) });
export const uri = (b32: string, email: string) => mk(b32, email).toString();
/** Returns the matched 30s step (for replay protection) or null. */
export function check(b32: string, email: string, code: string) {
  const d = mk(b32, email).validate({ token: code, window: 1 });
  return d === null ? null : Math.floor(Date.now() / 30000) + d;
}
const sig = (s: string) => crypto.createHmac("sha256", process.env.AUTH_SECRET!).update(s).digest("hex");
export function mfaCookie(uid: string) { const exp = Date.now() + 60 * 60 * 1000; const p = `${uid}.${exp}`; return `${p}.${sig(p)}`; }
export function mfaValid(v: string | undefined, uid: string) {
  if (!v) return false; const [u, exp, s] = v.split("."); const p = `${u}.${exp}`;
  return u === uid && Number(exp) > Date.now() && !!s && s.length === sig(p).length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sig(p)));
}
