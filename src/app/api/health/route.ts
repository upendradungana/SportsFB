import { sql } from "drizzle-orm"; import { db } from "@/db";
export const dynamic = "force-dynamic";
export async function GET() { // public on purpose (uptime monitors); reveals nothing but up/down and the short commit
  try { await db.execute(sql`SELECT 1`); return Response.json({ ok: true, commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev" }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ ok: false }, { status: 503 }); }
}
