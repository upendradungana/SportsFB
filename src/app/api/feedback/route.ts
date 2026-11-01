import { z } from "zod"; import { sql } from "drizzle-orm"; import { after } from "next/server"; import { db } from "@/db"; import { auth } from "@/auth";
import { api, HttpError } from "@/lib/guard"; import { limited } from "@/lib/ratelimit"; import { notifyAdmins } from "@/lib/notify";
const who = async () => { const s = (await auth())?.user as any; if (!s?.id || s.blocked) throw new HttpError(401, "UNAUTHENTICATED"); return s.id as string; };
export const GET = api(async () => {
  const id = await who();
  return Response.json({ items: (await db.execute(sql`SELECT id, kind, subject, status, created_at FROM feedback WHERE user_id = ${id}::uuid ORDER BY created_at DESC LIMIT 20`)).rows }, { headers: { "Cache-Control": "no-store" } });
});
export const POST = api(async (req) => {
  const id = await who(); if (await limited("feedback", id, 5, "1 h")) throw new HttpError(429, "RATE_LIMITED");
  const b = z.object({ kind: z.enum(["FEEDBACK", "COMPLAINT"]), subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(2000) }).parse(await req.json());
  await db.execute(sql`INSERT INTO feedback (user_id, kind, subject, message) VALUES (${id}::uuid, ${b.kind}, ${b.subject}, ${b.message})`);
  after(() => notifyAdmins(b.kind === "COMPLAINT" ? "New complaint" : "New feedback", b.subject, "/admin?tab=feedback"));
  return Response.json({ ok: true });
});
