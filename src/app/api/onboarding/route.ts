import { z } from "zod"; import { sql } from "drizzle-orm"; import { db } from "@/db";
import { api, HttpError, requireRole } from "@/lib/guard"; import { toBhutanE164 } from "@/lib/phone";
export const POST = api(async (req) => {
  const u = await requireRole("PLAYER"); // admins and already-onboarded owners cannot re-enter
  const { role, phone, note, fullName } = z.object({ fullName: z.string().trim().min(2).max(80).regex(/^[\p{L}][\p{L}\p{M} .'-]+$/u), role: z.enum(["PLAYER", "OWNER"]), phone: z.string().max(20), note: z.string().max(300).optional() }).parse(await req.json());
  const p = toBhutanE164(phone); if (!p) throw new HttpError(400, "INVALID_BT_PHONE");
  const r = await db.execute(sql`UPDATE users SET full_name = ${fullName}, role = ${role}, phone = ${p}, owner_note = ${role === "OWNER" ? note ?? null : null}, onboarded = true WHERE id = ${u.id}::uuid AND onboarded = false RETURNING id`);
  if (!r.rows[0]) throw new HttpError(409, "ALREADY_ONBOARDED");
  return Response.json({ ok: true }); // owners stay is_verified_owner=false until an admin verifies them
});
