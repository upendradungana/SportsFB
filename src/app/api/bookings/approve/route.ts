import { z } from "zod"; import { api, fromResult, requireRole } from "@/lib/guard"; import { approve } from "@/lib/booking";
export const POST = api(async (req) => {
  const u = await requireRole("OWNER");
  return fromResult(await approve(u.id, z.object({ bookingId: z.uuid() }).parse(await req.json()).bookingId));
});
