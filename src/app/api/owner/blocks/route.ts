import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const GET = api(async (req) => {
  const u = await requireRole("OWNER"); const f = z.uuid().parse(new URL(req.url).searchParams.get("facilityId"));
  const r = await db.execute(sql`SELECT b.id, b.kind, b.on_date::text AS on_date, b.weekday, b.note FROM facility_blocks b JOIN facilities f ON f.id = b.facility_id WHERE b.facility_id = ${f}::uuid AND f.owner_id = ${u.id}::uuid ORDER BY b.kind, b.on_date, b.weekday`);
  return Response.json({ items: r.rows }, { headers: { "Cache-Control": "no-store" } });
});
export const POST = api(async (req) => {
  const u = await requireRole("OWNER");
  const b = z.discriminatedUnion("kind", [z.object({ kind: z.literal("DATE"), facilityId: z.uuid(), onDate: z.iso.date(), note: z.string().max(120).optional() }),
    z.object({ kind: z.literal("WEEKDAY"), facilityId: z.uuid(), weekday: z.number().int().min(0).max(6), note: z.string().max(120).optional() })]).parse(await req.json());
  const r = await db.execute(sql`INSERT INTO facility_blocks (facility_id, kind, on_date, weekday, note) SELECT id, ${b.kind}, ${b.kind === "DATE" ? b.onDate : null}::date, ${b.kind === "WEEKDAY" ? b.weekday : null}::int, ${b.note ?? null}
    FROM facilities WHERE id = ${b.facilityId}::uuid AND owner_id = ${u.id}::uuid RETURNING id`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_FOUND"); return Response.json({ ok: true });
});
export const DELETE = api(async (req) => {
  const u = await requireRole("OWNER"); const id = z.object({ id: z.uuid() }).parse(await req.json()).id;
  await db.execute(sql`DELETE FROM facility_blocks b USING facilities f WHERE b.id = ${id}::uuid AND f.id = b.facility_id AND f.owner_id = ${u.id}::uuid`);
  return Response.json({ ok: true });
});
