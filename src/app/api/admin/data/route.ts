import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
const Q: Record<string, ReturnType<typeof sql>> = {
  overview: sql`SELECT (SELECT count(*)::int FROM users WHERE role='PLAYER') AS players, (SELECT count(*)::int FROM users WHERE role='OWNER') AS owners,
    (SELECT count(*)::int FROM users WHERE role='OWNER' AND NOT is_verified_owner) AS owners_pending, (SELECT count(*)::int FROM users WHERE is_locked) AS locked_accounts,
    (SELECT count(*)::int FROM bookings WHERE status='CONFIRMED') AS confirmed_bookings, (SELECT count(*)::int FROM bookings WHERE status='PENDING_VERIFICATION') AS receipts_awaiting_owner, (SELECT count(*)::int FROM facilities WHERE approval_status='PENDING') AS pending_facilities, (SELECT count(*)::int FROM subscriptions WHERE status='ACTIVE' AND expires_at > now() AND expires_at <= now() + interval '7 days') AS expiring_plans`,
  owners: sql`SELECT u.id, u.name, u.email, u.phone, u.image, u.owner_note, u.is_verified_owner, u.is_suspended, u.created_at, (SELECT count(*)::int FROM facilities f WHERE f.owner_id = u.id) AS facilities FROM users u WHERE u.role = 'OWNER' ORDER BY u.is_verified_owner, u.created_at DESC LIMIT 200`,
  facilities: sql`SELECT f.id, f.name, f.sport_type, f.address, f.price_nu_per_hour, f.approval_status, f.is_active, ST_Y(f.location::geometry) AS lat, ST_X(f.location::geometry) AS lng, f.created_at, o.id AS owner_id, o.name AS owner_name, o.email AS owner_email, o.image AS owner_image FROM facilities f JOIN users o ON o.id = f.owner_id ORDER BY (f.approval_status = 'PENDING') DESC, f.created_at DESC LIMIT 200`,
  subscriptions: sql`SELECT o.id, o.name, o.email, o.image, e.expires_at, CASE WHEN e.expires_at IS NULL OR e.expires_at <= now() THEN 'EXPIRED' WHEN e.expires_at <= now() + interval '7 days' THEN 'EXPIRING' ELSE 'ACTIVE' END AS state FROM users o LEFT JOIN LATERAL (SELECT max(expires_at) AS expires_at FROM subscriptions s WHERE s.owner_id = o.id AND s.status = 'ACTIVE') e ON true WHERE o.role = 'OWNER' ORDER BY e.expires_at NULLS FIRST LIMIT 200`,
  users: sql`SELECT id, name, email, image, role, is_locked, is_suspended, fraud_strikes, booking_ban_until, created_at FROM users ORDER BY created_at DESC LIMIT 200`,
  audit: sql`SELECT a.id, a.action, a.at, ac.email AS actor, su.email AS subject, a.metadata FROM audit_logs a LEFT JOIN users ac ON ac.id=a.actor_id LEFT JOIN users su ON su.id=a.subject_id ORDER BY a.at DESC LIMIT 100`,
};
export const GET = api(async (req) => {
  await requireRole("ADMIN"); const q = Q[new URL(req.url).searchParams.get("tab") ?? ""]; if (!q) throw new HttpError(400, "BAD_REQUEST");
  return Response.json({ rows: (await db.execute(q)).rows }, { headers: { "Cache-Control": "no-store" } });
});
