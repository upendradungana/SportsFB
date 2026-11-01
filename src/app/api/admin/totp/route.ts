import { z } from "zod"; import QRCode from "qrcode"; import { sql } from "drizzle-orm"; import { cookies } from "next/headers"; import { db } from "@/db";
import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard"; import { limited } from "@/lib/ratelimit";
import { check, mfaCookie, newSecretB32, open, seal, uri } from "@/lib/totp";
// Needs an ADMIN OAuth session (allowlisted email) but NOT the MFA cookie: this route issues it.
export const POST = api(async (req) => {
  const s = (await auth())?.user as any;
  if (!s?.id || s.blocked || s.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN");
  if (await limited("totp", s.id, 5, "1 m")) throw new HttpError(429, "RATE_LIMITED");
  const b = z.discriminatedUnion("action", [z.object({ action: z.literal("setup") }), z.object({ action: z.literal("verify"), code: z.string().regex(/^\d{6}$/) })]).parse(await req.json());
  const row = (await db.execute(sql`SELECT totp_secret_enc, totp_enabled, totp_last_step FROM users WHERE id = ${s.id}::uuid`)).rows[0] as any;
  if (b.action === "setup") {
    if (row.totp_enabled) throw new HttpError(409, "ALREADY_ENROLLED"); // re-enrolment needs DB access, not just a Google session
    const sec = newSecretB32();
    await db.execute(sql`UPDATE users SET totp_secret_enc = ${seal(sec)} WHERE id = ${s.id}::uuid`);
    return Response.json({ qr: await QRCode.toDataURL(uri(sec, s.email)), secret: sec }, { headers: { "Cache-Control": "no-store" } });
  }
  if (!row.totp_secret_enc) throw new HttpError(409, "NOT_ENROLLED");
  const step = check(open(row.totp_secret_enc), s.email, b.code);
  if (step === null) throw new HttpError(401, "BAD_CODE");
  const ok = await db.execute(sql`UPDATE users SET totp_enabled = true, totp_last_step = ${step} WHERE id = ${s.id}::uuid AND (totp_last_step IS NULL OR totp_last_step < ${step}) RETURNING id`);
  if (!ok.rows[0]) throw new HttpError(401, "CODE_REUSED");
  (await cookies()).set("admin_mfa", mfaCookie(s.id), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 3600 });
  return Response.json({ ok: true });
});
export const GET = api(async () => {
  const s = (await auth())?.user as any;
  if (!s?.id || s.blocked || s.role !== "ADMIN") throw new HttpError(403, "FORBIDDEN");
  const r = (await db.execute(sql`SELECT totp_enabled FROM users WHERE id = ${s.id}::uuid`)).rows[0] as any;
  return Response.json({ enrolled: !!r.totp_enabled }, { headers: { "Cache-Control": "no-store" } });
});
