import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db";
import { api, requireRole } from "@/lib/guard";
export const GET = api(async (req) => {
  await requireRole("PLAYER");
  const p = new URL(req.url).searchParams, n = (k: string) => (p.get(k) ? Number(p.get(k)) : null);
  const lat = n("lat"), lng = n("lng"), max = n("max"), q = p.get("q") ? p.get("q")!.replace(/[%_\\]/g, "").trim().toLowerCase().slice(0, 60) || null : null, sport = p.get("sport") || null;
  const r = await db.execute(sql`
    SELECT f.id, f.name, f.sport_type, f.address, f.price_nu_per_hour, ST_Y(f.location::geometry) AS lat, ST_X(f.location::geometry) AS lng, f.aliases, COALESCE((SELECT array_agg(b.weekday) FROM facility_blocks b WHERE b.facility_id = f.id AND b.kind = 'WEEKDAY'), '{}') AS closed_weekdays,
      CASE WHEN ${lat}::float8 IS NULL THEN NULL ELSE ST_Distance(f.location, ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography) / 1000 END AS distance_km
    FROM facilities f JOIN users o ON o.id = f.owner_id
    WHERE f.is_active AND f.approval_status = 'APPROVED' AND o.is_verified_owner AND NOT o.is_suspended
      AND EXISTS (SELECT 1 FROM subscriptions s WHERE s.owner_id = o.id AND s.status = 'ACTIVE' AND s.expires_at > now())
      AND (${sport}::text IS NULL OR f.sport_type = ${sport}::text)
      AND (${q}::text IS NULL OR f.search_text LIKE '%' || ${q}::text || '%' OR word_similarity(${q}::text, f.search_text) > 0.35)
      AND (${max}::int IS NULL OR f.price_nu_per_hour <= ${max}::int)
      AND (${lat}::float8 IS NULL OR ST_DWithin(f.location, ST_SetSRID(ST_MakePoint(${lng}::float8, ${lat}::float8), 4326)::geography, 100000))
    ORDER BY (CASE WHEN ${q}::text IS NULL THEN 0 ELSE word_similarity(${q}::text, f.search_text) END) DESC, distance_km ASC NULLS LAST, f.name LIMIT 30`);
  return Response.json({ items: r.rows }, { headers: { "Cache-Control": "no-store" } });
});
export const POST = api(async (req) => {
  const u = await requireRole("OWNER");
  const b = z.object({ name: z.string().min(2).max(120), sportType: z.enum(["FOOTBALL", "TENNIS", "VOLLEYBALL", "BASKETBALL", "BADMINTON", "OTHER"]),
    address: z.string().min(3).max(300), lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180),
    priceNuPerHour: z.number().int().min(1).max(100000), aliases: z.string().max(200).optional(), bankDetails: z.string().min(4).max(500) }).parse(await req.json());
  const r = await db.execute(sql`INSERT INTO facilities (owner_id, name, sport_type, address, aliases, location, price_nu_per_hour, bank_details)
    VALUES (${u.id}::uuid, ${b.name}, ${b.sportType}, ${b.address}, ${b.aliases ?? null}, ST_SetSRID(ST_MakePoint(${b.lng}, ${b.lat}), 4326)::geography, ${b.priceNuPerHour}, ${b.bankDetails}) RETURNING id`);
  return Response.json({ ok: true, id: r.rows[0].id });
});
