import { api, HttpError } from "@/lib/guard"; import { runReminders } from "@/lib/subscriptions";
export const GET = api(async (req) => { // schedule daily with: Authorization: Bearer $CRON_SECRET
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) throw new HttpError(401, "UNAUTHORIZED");
  return Response.json(await runReminders());
});
