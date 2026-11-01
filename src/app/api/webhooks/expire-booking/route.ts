import { Receiver } from "@upstash/qstash"; import { z } from "zod"; import { api, HttpError } from "@/lib/guard"; import { expireUnpaid, expireUnapproved } from "@/lib/booking";
export const POST = api(async (req) => {
  const body = await req.text();
  const rx = new Receiver({ currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!, nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY! });
  if (!(await rx.verify({ signature: req.headers.get("upstash-signature") ?? "", body }).catch(() => false))) throw new HttpError(401, "BAD_SIGNATURE");
  const b = z.object({ bookingId: z.uuid(), kind: z.enum(["unpaid", "unapproved"]) }).parse(JSON.parse(body));
  const n = b.kind === "unpaid" ? await expireUnpaid(b.bookingId) : await expireUnapproved(b.bookingId);
  return Response.json({ expired: n });
});
