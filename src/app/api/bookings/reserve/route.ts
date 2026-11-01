import { z } from "zod"; import { api, fromResult, HttpError, requireRole } from "@/lib/guard";
import { reserve } from "@/lib/booking"; import { limited } from "@/lib/ratelimit";
export const POST = api(async (req) => {
  const u = await requireRole("PLAYER");
  if (await limited("reserve", u.id, 3, "1 m")) throw new HttpError(429, "RATE_LIMITED");
  const b = z.object({ facilityId: z.uuid(), startTime: z.iso.datetime(), endTime: z.iso.datetime() }).parse(await req.json());
  return fromResult(await reserve(u.id, b.facilityId, new Date(b.startTime), new Date(b.endTime)));
});
