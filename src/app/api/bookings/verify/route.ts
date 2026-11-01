import { z } from "zod"; import { api, fromResult, requireRole } from "@/lib/guard"; import { verify } from "@/lib/booking";
export const POST = api(async (req) => {
  const u = await requireRole("OWNER");
  const b = z.object({ bookingId: z.uuid(), decision: z.enum(["APPROVE", "REJECT", "FRAUD"]) }).parse(await req.json());
  return fromResult(await verify(u.id, b.bookingId, b.decision));
});
