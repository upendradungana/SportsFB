import { z } from "zod"; import { sql } from "drizzle-orm"; import { after } from "next/server"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard"; import { notifyUser } from "@/lib/notify";
export const POST = api(async (req) => { // activation is only possible here, after an admin looked at the receipt
  const a = await requireRole("ADMIN"), b = z.object({ id: z.uuid(), decision: z.enum(["APPROVE", "REJECT"]) }).parse(await req.json());
  const q = b.decision === "APPROVE" ? sql`
    WITH s AS (SELECT owner_id, plan FROM subscriptions WHERE id = ${b.id}::uuid AND status = 'PENDING'),
    prev AS (SELECT max(expires_at) AS e FROM subscriptions WHERE owner_id = (SELECT owner_id FROM s) AND plan = (SELECT plan FROM s) AND status = 'ACTIVE' AND expires_at > now()),
    ex AS (UPDATE subscriptions SET status = 'EXPIRED' WHERE owner_id = (SELECT owner_id FROM s) AND status = 'ACTIVE' RETURNING 1),
    act AS (UPDATE subscriptions SET status = 'ACTIVE', expires_at = GREATEST(now(), COALESCE((SELECT e FROM prev), now())) + interval '30 days' WHERE id = ${b.id}::uuid AND status = 'PENDING' RETURNING owner_id, plan)
    INSERT INTO audit_logs (actor_id, subject_id, action, metadata) SELECT ${a.id}::uuid, owner_id, 'APPROVE_SUB', jsonb_build_object('plan', plan) FROM act RETURNING subject_id`
  : sql`WITH s AS (UPDATE subscriptions SET status = 'REJECTED' WHERE id = ${b.id}::uuid AND status = 'PENDING' RETURNING owner_id)
    INSERT INTO audit_logs (actor_id, subject_id, action) SELECT ${a.id}::uuid, owner_id, 'REJECT_SUB' FROM s RETURNING subject_id`;
  const r = await db.execute(q); if (!r.rows[0]) throw new HttpError(404, "NOT_APPLICABLE");
  const ok = b.decision === "APPROVE";
  after(() => notifyUser(r.rows[0].subject_id as string, ok ? "Plan activated" : "Plan payment rejected", ok ? "Your plan is active for 30 days." : "We could not verify your payment. Please try again.", "/owner/plan"));
  return Response.json({ ok: true });
});
