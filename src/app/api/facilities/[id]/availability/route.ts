import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, requireRole } from "@/lib/guard";
export const GET = api(async (req, { params }) => { // taken ranges only; no player details are exposed
  await requireRole("PLAYER"); const id = z.uuid().parse((await params).id), date = z.iso.date().parse(new URL(req.url).searchParams.get("date"));
  const [t, c] = await Promise.all([
    db.execute(sql`SELECT start_time, end_time FROM bookings WHERE facility_id = ${id}::uuid AND status IN ('PENDING_APPROVAL','PENDING_PAYMENT','PENDING_VERIFICATION','CONFIRMED')
      AND tstzrange(start_time, end_time) && tstzrange((${date}::date)::timestamp AT TIME ZONE 'Asia/Thimphu', ((${date}::date) + 1)::timestamp AT TIME ZONE 'Asia/Thimphu')`),
    db.execute(sql`SELECT EXISTS (SELECT 1 FROM facility_blocks b WHERE b.facility_id = ${id}::uuid AND ((b.kind = 'DATE' AND b.on_date = ${date}::date) OR (b.kind = 'WEEKDAY' AND b.weekday = EXTRACT(dow FROM ${date}::date)::int))) AS closed`)]);
  return Response.json({ taken: t.rows, closed: !!c.rows[0]?.closed }, { headers: { "Cache-Control": "no-store" } });
});
