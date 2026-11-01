import { z } from "zod"; import { after } from "next/server"; import { notifyUser } from "@/lib/notify"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const POST = api(async (req) => {
  const a = await requireRole("ADMIN");
  const b = z.object({ id: z.uuid(), action: z.enum(["APPROVE_FACILITY", "REJECT_FACILITY", "EXTEND_SUB", "EXPIRE_SUB"]) }).parse(await req.json());
  const aud = sql`INSERT INTO audit_logs (actor_id, subject_id, action, metadata) SELECT ${a.id}::uuid, owner_id, ${b.action}, jsonb_build_object('ref', ${b.id}::text)`;
  const q = b.action === "APPROVE_FACILITY" || b.action === "REJECT_FACILITY"
    ? sql`WITH t AS (UPDATE facilities SET approval_status = ${b.action === "APPROVE_FACILITY" ? "APPROVED" : "REJECTED"} WHERE id = ${b.id}::uuid RETURNING owner_id) ${aud} FROM t RETURNING id, subject_id`
    : b.action === "EXTEND_SUB"
    ? sql`WITH t AS (INSERT INTO subscriptions (owner_id, status, expires_at) SELECT id, 'ACTIVE', GREATEST(now(), COALESCE((SELECT max(expires_at) FROM subscriptions WHERE owner_id = ${b.id}::uuid AND status = 'ACTIVE'), now())) + interval '30 days'
        FROM users WHERE id = ${b.id}::uuid AND role = 'OWNER' RETURNING owner_id) ${aud} FROM t RETURNING id, subject_id`
    : sql`WITH t AS (UPDATE subscriptions SET status = 'EXPIRED', expires_at = now() WHERE owner_id = ${b.id}::uuid AND status = 'ACTIVE' RETURNING owner_id) ${aud} FROM (SELECT DISTINCT owner_id FROM t) t RETURNING id, subject_id`;
  const r = await db.execute(q); if (!r.rows[0]) throw new HttpError(404, "NOT_APPLICABLE");
  const owner = r.rows[0].subject_id as string, yes = b.action === "APPROVE_FACILITY";
  if (b.action === "APPROVE_FACILITY" || b.action === "REJECT_FACILITY") after(() => notifyUser(owner, yes ? "Facility approved" : "Facility rejected", yes ? "Your facility is now visible to players." : "Your facility was not approved. Edit it and resubmit.", "/owner/facilities"));
  return Response.json({ ok: true });
});
