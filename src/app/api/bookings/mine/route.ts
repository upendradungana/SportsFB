import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
export const GET = api(async () => {
  const u = (await auth())?.user as any;
  if (!u?.id || u.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  if (u.role !== "PLAYER" && u.role !== "OWNER") throw new HttpError(403, "FORBIDDEN");
  const r = u.role === "OWNER"
    ? await db.execute(sql`SELECT b.id, b.status, b.start_time, b.end_time, b.payment_deadline, f.name, p.name AS player_name, p.phone AS player_phone
        FROM bookings b JOIN facilities f ON f.id = b.facility_id JOIN users p ON p.id = b.player_id
        WHERE f.owner_id = ${u.id}::uuid ORDER BY b.created_at DESC LIMIT 50`)
    : await db.execute(sql`SELECT b.id, b.status, b.start_time, b.end_time, b.payment_deadline, f.name
        FROM bookings b JOIN facilities f ON f.id = b.facility_id WHERE b.player_id = ${u.id}::uuid ORDER BY b.created_at DESC LIMIT 50`);
  return Response.json({ items: r.rows }, { headers: { "Cache-Control": "no-store" } });
});
