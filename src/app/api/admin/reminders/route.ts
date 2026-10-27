import { api, requireRole } from "@/lib/guard"; import { runReminders } from "@/lib/subscriptions";
export const POST = api(async () => { await requireRole("ADMIN"); return Response.json(await runReminders()); });
