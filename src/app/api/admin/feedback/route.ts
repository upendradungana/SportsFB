import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const POST = api(async (req) => {
  const a = await requireRole("ADMIN"); const b = z.object({ id: z.uuid(), status: z.enum(["OPEN", "RESOLVED"]) }).parse(await req.json());
  const r = await db.execute(sql`WITH f AS (UPDATE feedback SET status = ${b.status} WHERE id = ${b.id}::uuid RETURNING user_id)
    INSERT INTO audit_logs (actor_id, subject_id, action) SELECT ${a.id}::uuid, user_id, ${"FEEDBACK_" + b.status} FROM f RETURNING id`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_FOUND"); return Response.json({ ok: true });
});
