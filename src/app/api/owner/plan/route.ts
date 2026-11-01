import { z } from "zod"; import { sql } from "drizzle-orm"; import { after } from "next/server"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
import { effectivePlan, PLANS } from "@/lib/plans"; import { sanitizeImage } from "@/lib/img"; import { limited } from "@/lib/ratelimit"; import { notifyAdmins } from "@/lib/notify";
export const runtime = "nodejs";
export const GET = api(async () => {
  const u = await requireRole("OWNER");
  const [ep, used, hist, ver] = await Promise.all([effectivePlan(u.id),
    db.execute(sql`SELECT count(*)::int AS n FROM facilities WHERE owner_id = ${u.id}::uuid AND approval_status <> 'REJECTED'`),
    db.execute(sql`SELECT id, plan, status, amount_nu, expires_at, created_at FROM subscriptions WHERE owner_id = ${u.id}::uuid ORDER BY created_at DESC LIMIT 10`),
    db.execute(sql`SELECT is_verified_owner AS v FROM users WHERE id = ${u.id}::uuid`)]);
  return Response.json({ plan: ep.plan, max: ep.max, expires_at: ep.expires_at, used: used.rows[0].n, verified: ver.rows[0].v, history: hist.rows, plans: PLANS, bank: process.env.PLATFORM_BANK_DETAILS ?? "" }, { headers: { "Cache-Control": "no-store" } });
});
export const POST = api(async (req) => {
  const u = await requireRole("OWNER"); if (await limited("planpay", u.id, 3, "1 h")) throw new HttpError(429, "RATE_LIMITED");
  const f = await req.formData(), plan = z.enum(["PLUS", "PRO"]).parse(f.get("plan")), img = await sanitizeImage(f.get("file"));
  const r = await db.execute(sql`INSERT INTO subscriptions (owner_id, status, plan, amount_nu, receipt_b64, receipt_hash)
    SELECT ${u.id}::uuid, 'PENDING', ${plan}, ${PLANS[plan].nu}, ${img.b64}, ${img.hash}
    WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE owner_id = ${u.id}::uuid AND status = 'PENDING') AND EXISTS (SELECT 1 FROM users WHERE id = ${u.id}::uuid AND is_verified_owner) RETURNING id`)
    .catch((e: any) => { if (e?.code === "23505") throw new HttpError(409, "DUPLICATE_RECEIPT"); throw e; });
  if (!r.rows[0]) throw new HttpError(409, "PLAN_NOT_AVAILABLE");
  after(() => notifyAdmins("Plan payment to verify", `${PLANS[plan].name} plan`, "/admin?tab=payments"));
  return Response.json({ ok: true });
});
