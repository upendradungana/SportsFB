import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db"; import { api, HttpError, requireRole } from "@/lib/guard";
export const GET = api(async (_r, { params }) => {
  await requireRole("ADMIN"); const id = z.uuid().parse((await params).id);
  const r = await db.execute(sql`SELECT receipt_b64 FROM subscriptions WHERE id = ${id}::uuid`); const b = r.rows[0]?.receipt_b64 as string | undefined;
  if (!b) throw new HttpError(404, "NOT_FOUND");
  return new Response(new Uint8Array(Buffer.from(b, "base64")), { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" } });
});
