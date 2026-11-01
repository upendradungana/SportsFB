import { sql } from "drizzle-orm"; import { db } from "@/db"; import { notifyUser } from "@/lib/notify";
/** Daily job: expire lapsed plans, hide facilities above the new plan's limit, remind owners whose plan ends within 7 days. */
export async function runReminders() {
  await db.execute(sql`UPDATE subscriptions SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= now()`);
  await db.execute(sql`UPDATE facilities SET is_active = false WHERE id IN (SELECT id FROM (SELECT f.id, row_number() OVER (PARTITION BY f.owner_id ORDER BY f.created_at) AS rn,
    CASE COALESCE((SELECT s.plan FROM subscriptions s WHERE s.owner_id = f.owner_id AND s.status = 'ACTIVE' AND s.expires_at > now() ORDER BY CASE s.plan WHEN 'PRO' THEN 3 WHEN 'PLUS' THEN 2 ELSE 1 END DESC LIMIT 1), 'FREE') WHEN 'PRO' THEN 1000 WHEN 'PLUS' THEN 5 ELSE 1 END AS mx
    FROM facilities f WHERE f.is_active) t WHERE rn > mx)`);
  const r = await db.execute(sql`SELECT s.id, s.owner_id, u.email, u.name, u.notify_plan_email AS mail, s.expires_at FROM subscriptions s JOIN users u ON u.id = s.owner_id
    WHERE s.status = 'ACTIVE' AND s.expires_at <= now() + interval '7 days' AND (s.reminded_at IS NULL OR s.reminded_at < now() - interval '3 days') LIMIT 50`);
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM; let sent = 0;
  for (const x of r.rows as any[]) {
    const when = new Date(x.expires_at).toDateString();
    await notifyUser(x.owner_id, "Your plan ends soon", `Your plan ends on ${when}. Renew to keep your facility limit.`, "/owner/plan");
    if (key && from && x.mail) {
      const ok = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: x.email, subject: "Your SportsFB plan expires soon", text: `Hi ${x.name ?? ""}, your plan ends on ${when}. Renew it from the Plan page so your facilities stay listed.` }) }).then((q) => q.ok).catch(() => false);
      if (ok) sent++;
    }
    await db.execute(sql`UPDATE subscriptions SET reminded_at = now() WHERE id = ${x.id}::uuid`);
  }
  return { due: r.rows.length, emailed: sent, mailConfigured: !!(key && from) };
}
