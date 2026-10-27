import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
const bump = sql`session_version = session_version + 1`;
const A: Record<string, [ReturnType<typeof sql>, string | null]> = {
  VERIFY_OWNER: [sql`is_verified_owner = true`, "OWNER"], UNVERIFY_OWNER: [sql`is_verified_owner = false`, "OWNER"],
  LOCK: [sql`is_locked = true, ${bump}`, null], UNLOCK: [sql`is_locked = false, fraud_strikes = 0`, null],
  SUSPEND: [sql`is_suspended = true, ${bump}`, null], UNSUSPEND: [sql`is_suspended = false`, null], REVOKE_SESSIONS: [bump, null],
};
export const POST = api(async (req) => {
  const a = await requireRole("ADMIN");
  const b = z.object({ userId: z.uuid(), action: z.enum(Object.keys(A) as [string, ...string[]]) }).parse(await req.json());
  const [set, only] = A[b.action];
  // Admins can never be targeted here; every change is audited in the same statement.
  const r = await db.execute(sql`
    WITH u AS (UPDATE users SET ${set} WHERE id = ${b.userId}::uuid AND role <> 'ADMIN' AND (${only}::text IS NULL OR role = ${only}::text) RETURNING id)
    INSERT INTO audit_logs (actor_id, subject_id, action) SELECT ${a.id}::uuid, id, ${b.action} FROM u RETURNING id`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_APPLICABLE");
  if (b.action === "VERIFY_OWNER") await db.execute(sql`INSERT INTO subscriptions (owner_id, status, expires_at) SELECT ${b.userId}::uuid, 'ACTIVE', now() + interval '30 days' WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE owner_id = ${b.userId}::uuid)`); // 30-day trial
  return Response.json({ ok: true });
});
