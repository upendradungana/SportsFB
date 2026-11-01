import { sql } from "drizzle-orm"; import { db } from "@/db";
export const PLANS = {
  FREE: { name: "Free", max: 1, nu: 0, perks: ["1 facility", "Booking requests and receipt checks"] },
  PLUS: { name: "Plus", max: 5, nu: Number(process.env.PLAN_PLUS_NU ?? 500), perks: ["Up to 5 facilities", "Everything in Free"] },
  PRO: { name: "Pro", max: 1000, nu: Number(process.env.PLAN_PRO_NU ?? 1500), perks: ["Unlimited facilities", "Featured badge in search", "Everything in Plus"] },
} as const;
export type PlanKey = keyof typeof PLANS;
export async function effectivePlan(ownerId: string) {
  const r = (await db.execute(sql`SELECT plan, expires_at FROM subscriptions WHERE owner_id = ${ownerId}::uuid AND status = 'ACTIVE' AND expires_at > now()
    ORDER BY CASE plan WHEN 'PRO' THEN 3 WHEN 'PLUS' THEN 2 ELSE 1 END DESC, expires_at DESC LIMIT 1`)).rows[0] as any;
  const plan = (r?.plan ?? "FREE") as PlanKey;
  return { plan, ...PLANS[plan], expires_at: (r?.expires_at ?? null) as string | null };
}
