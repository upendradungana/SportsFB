import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
export const GET = api(async () => {
  const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  const r = await db.execute(sql`SELECT ua, ip, at FROM login_events WHERE user_id = ${s.id}::uuid ORDER BY at DESC LIMIT 5`);
  return Response.json({ items: r.rows }, { headers: { "Cache-Control": "no-store" } });
});
