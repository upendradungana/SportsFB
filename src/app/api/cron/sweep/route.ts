import { api, HttpError } from "@/lib/guard"; import { expireUnpaid, expireUnapproved } from "@/lib/booking";
// Backstop if a QStash publish ever failed. Call every few minutes with: Authorization: Bearer $CRON_SECRET
export const GET = api(async (req) => {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) throw new HttpError(401, "UNAUTHORIZED");
  return Response.json({ unpaid: await expireUnpaid(), unapproved: await expireUnapproved() });
});
