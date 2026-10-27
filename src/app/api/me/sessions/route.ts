import { sql } from "drizzle-orm"; import { db } from "@/db"; import { auth } from "@/auth"; import { api, HttpError } from "@/lib/guard";
export const POST = api(async () => { // invalidates every JWT issued before now, on all devices
  const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  await db.execute(sql`UPDATE users SET session_version = session_version + 1 WHERE id = ${s.id}::uuid`);
  return Response.json({ ok: true });
});
