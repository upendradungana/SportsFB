import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth";
import { api, HttpError } from "@/lib/guard";
async function me() { const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED"); return s; }
export const GET = api(async () => {
  const s = await me();
  const r = await db.execute(sql`SELECT full_name, name, email, image, role, phone, bio, notify_plan_email, created_at, totp_enabled, fraud_strikes FROM users WHERE id = ${s.id}::uuid`);
  return Response.json(r.rows[0], { headers: { "Cache-Control": "no-store" } });
});
export const PATCH = api(async (req) => { // name, email and phone are locked on purpose
  const s = await me();
  const b = z.object({ bio: z.string().max(200).optional(), notifyPlanEmail: z.boolean().optional() }).strict().parse(await req.json());
  await db.execute(sql`UPDATE users SET bio = COALESCE(${b.bio ?? null}::text, bio), notify_plan_email = COALESCE(${b.notifyPlanEmail ?? null}::boolean, notify_plan_email) WHERE id = ${s.id}::uuid`);
  return Response.json({ ok: true });
});
