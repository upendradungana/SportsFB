import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const GET = api(async (_r, { params }) => {
  await requireRole("PLAYER"); const id = z.uuid().parse((await params).id);
  const r = await db.execute(sql`SELECT f.id, f.name, f.sport_type, f.address, f.aliases, f.price_nu_per_hour, ST_Y(f.location::geometry) AS lat, ST_X(f.location::geometry) AS lng,
    COALESCE((SELECT array_agg(b.weekday) FROM facility_blocks b WHERE b.facility_id = f.id AND b.kind = 'WEEKDAY'), '{}') AS closed_weekdays,
    EXISTS (SELECT 1 FROM subscriptions s WHERE s.owner_id = o.id AND s.status = 'ACTIVE' AND s.plan = 'PRO' AND s.expires_at > now()) AS featured
    FROM facilities f JOIN users o ON o.id = f.owner_id WHERE f.id = ${id}::uuid AND f.is_active AND f.approval_status = 'APPROVED' AND o.is_verified_owner AND NOT o.is_suspended`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_FOUND"); return Response.json(r.rows[0], { headers: { "Cache-Control": "no-store" } });
});
