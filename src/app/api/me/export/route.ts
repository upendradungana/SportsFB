import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
export const GET = api(async () => { // your own data only; secrets (2FA, receipts' image bytes) are excluded
  const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  const id = s.id as string, q = async (x: any) => (await db.execute(x)).rows;
  const out = {
    exportedAt: new Date().toISOString(),
    profile: (await q(sql`SELECT name, email, role, phone, bio, created_at FROM users WHERE id = ${id}::uuid`))[0],
    bookingsAsPlayer: await q(sql`SELECT b.id, b.status, b.start_time, b.end_time, f.name AS facility FROM bookings b JOIN facilities f ON f.id = b.facility_id WHERE b.player_id = ${id}::uuid`),
    facilitiesOwned: await q(sql`SELECT id, name, sport_type, address, price_nu_per_hour, approval_status, is_active FROM facilities WHERE owner_id = ${id}::uuid`),
    signIns: await q(sql`SELECT ua, ip, at FROM login_events WHERE user_id = ${id}::uuid ORDER BY at DESC LIMIT 50`),
  };
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="sportsfb-my-data.json"', "Cache-Control": "no-store" } });
});
