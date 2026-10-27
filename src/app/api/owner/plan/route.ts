import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, requireRole } from "@/lib/guard";
export const GET = api(async () => {
  const u = await requireRole("OWNER");
  const r = await db.execute(sql`SELECT u.is_verified_owner AS verified, e.expires_at,
    CASE WHEN e.expires_at IS NULL OR e.expires_at <= now() THEN 'EXPIRED' WHEN e.expires_at <= now() + interval '7 days' THEN 'EXPIRING' ELSE 'ACTIVE' END AS state
    FROM users u LEFT JOIN LATERAL (SELECT max(expires_at) AS expires_at FROM subscriptions s WHERE s.owner_id = u.id AND s.status = 'ACTIVE') e ON true WHERE u.id = ${u.id}::uuid`);
  return Response.json(r.rows[0], { headers: { "Cache-Control": "no-store" } });
});
