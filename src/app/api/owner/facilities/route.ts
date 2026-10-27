import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const GET = api(async () => {
  const u = await requireRole("OWNER");
  const r = await db.execute(sql`SELECT id, name, sport_type, address, aliases, bank_details, price_nu_per_hour, is_active, approval_status, ST_Y(location::geometry) AS lat, ST_X(location::geometry) AS lng FROM facilities WHERE owner_id = ${u.id}::uuid ORDER BY created_at DESC`);
  return Response.json({ items: r.rows }, { headers: { "Cache-Control": "no-store" } });
});
export const PATCH = api(async (req) => {
  const u = await requireRole("OWNER"); const b = z.object({ id: z.uuid(), isActive: z.boolean() }).parse(await req.json());
  const r = await db.execute(sql`UPDATE facilities SET is_active = ${b.isActive} WHERE id = ${b.id}::uuid AND owner_id = ${u.id}::uuid RETURNING id`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_FOUND"); return Response.json({ ok: true });
});
export const PUT = api(async (req) => {
  const u = await requireRole("OWNER");
  const b = z.object({ id: z.uuid(), name: z.string().min(2).max(120), sportType: z.enum(["FOOTBALL", "TENNIS", "VOLLEYBALL", "BASKETBALL", "BADMINTON", "OTHER"]), address: z.string().min(3).max(300),
    aliases: z.string().max(200).optional(), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), priceNuPerHour: z.number().int().min(1).max(100000), bankDetails: z.string().min(4).max(500).optional() }).parse(await req.json());
  const pt = sql`ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geography`;
  // Identity changes (name, address, sport, moved pin) go back to admin approval; price and bank details do not.
  const r = await db.execute(sql`UPDATE facilities SET name = ${b.name}, sport_type = ${b.sportType}, address = ${b.address}, aliases = ${b.aliases ?? null}, price_nu_per_hour = ${b.priceNuPerHour},
    bank_details = COALESCE(${b.bankDetails ?? null}::text, bank_details),
    approval_status = CASE WHEN approval_status = 'REJECTED' OR (approval_status = 'APPROVED' AND (name <> ${b.name} OR address <> ${b.address} OR sport_type <> ${b.sportType} OR ST_Distance(location, ${pt}) > 25)) THEN 'PENDING' ELSE approval_status END,
    location = ${pt} WHERE id = ${b.id}::uuid AND owner_id = ${u.id}::uuid RETURNING approval_status`);
  if (!r.rows[0]) throw new HttpError(404, "NOT_FOUND"); return Response.json({ ok: true, approval: r.rows[0].approval_status });
});
