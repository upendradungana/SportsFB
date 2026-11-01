import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
const who = async () => { const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED"); return s.id as string; };
export const GET = api(async (req) => {
  const id = await who(), onlyCount = new URL(req.url).searchParams.get("count") === "1";
  const [items, c] = await Promise.all([onlyCount ? Promise.resolve({ rows: [] }) : db.execute(sql`SELECT id, title, body, link, read_at, created_at FROM notifications WHERE user_id = ${id}::uuid ORDER BY created_at DESC LIMIT 40`),
    db.execute(sql`SELECT count(*)::int AS n FROM notifications WHERE user_id = ${id}::uuid AND read_at IS NULL`)]);
  return Response.json({ items: items.rows, unread: c.rows[0].n }, { headers: { "Cache-Control": "no-store" } });
});
export const POST = api(async (req) => { // mark one (id) or all read
  const id = await who(), b = z.object({ id: z.uuid().optional() }).parse(await req.json());
  await db.execute(sql`UPDATE notifications SET read_at = now() WHERE user_id = ${id}::uuid AND read_at IS NULL AND (${b.id ?? null}::uuid IS NULL OR id = ${b.id ?? null}::uuid)`);
  return Response.json({ ok: true });
});
