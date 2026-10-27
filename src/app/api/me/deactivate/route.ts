import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
export const POST = api(async () => { // reversible: signing in again reactivates (owners must re-show their facilities)
  const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  if (s.role === "ADMIN") throw new HttpError(403, "FORBIDDEN");
  const n = (await db.execute(sql`SELECT count(*)::int AS n FROM bookings b JOIN facilities f ON f.id = b.facility_id
    WHERE (b.player_id = ${s.id}::uuid OR f.owner_id = ${s.id}::uuid) AND b.status IN ('PENDING_APPROVAL','PENDING_PAYMENT','PENDING_VERIFICATION','CONFIRMED') AND b.end_time > now()`)).rows[0].n as number;
  if (n > 0) throw new HttpError(409, "HAS_OPEN_BOOKINGS");
  await db.execute(sql`UPDATE facilities SET is_active = false WHERE owner_id = ${s.id}::uuid`);
  await db.execute(sql`UPDATE users SET deactivated_at = now(), session_version = session_version + 1 WHERE id = ${s.id}::uuid`);
  return Response.json({ ok: true });
});
