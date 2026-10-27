import { z } from "zod"; import { api, HttpError, requireRole } from "@/lib/guard"; import { bankDetails } from "@/lib/booking";
export const GET = api(async (_r, { params }) => {
  const u = await requireRole("PLAYER");
  const d = await bankDetails(u.id, z.uuid().parse((await params).id));
  if (!d) throw new HttpError(404, "NOT_AVAILABLE"); // same answer for wrong player, wrong status, expired
  return Response.json(d, { headers: { "Cache-Control": "no-store" } });
});
