import { sql } from "drizzle-orm"; import { db } from "@/db";
/** Marks lapsed plans EXPIRED and emails owners whose plan ends within 7 days (at most once per 3 days). */
export async function runReminders() {
  await db.execute(sql`UPDATE subscriptions SET status = 'EXPIRED' WHERE status = 'ACTIVE' AND expires_at <= now()`);
  const r = await db.execute(sql`SELECT s.id, u.email, u.name, s.expires_at FROM subscriptions s JOIN users u ON u.id = s.owner_id
    WHERE s.status = 'ACTIVE' AND u.notify_plan_email AND s.expires_at <= now() + interval '7 days' AND (s.reminded_at IS NULL OR s.reminded_at < now() - interval '3 days') LIMIT 50`);
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM; let sent = 0;
  for (const x of r.rows as any[]) {
    if (!key || !from) break;
    const ok = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: x.email, subject: "Your SportsFB plan expires soon",
        text: `Hi ${x.name ?? ""}, your plan ends on ${new Date(x.expires_at).toDateString()}. Pay the platform fee and ask the admin to renew so your facilities stay visible to players.` }) }).then((q) => q.ok).catch(() => false);
    if (ok) { sent++; await db.execute(sql`UPDATE subscriptions SET reminded_at = now() WHERE id = ${x.id}::uuid`); }
  }
  return { due: r.rows.length, sent, mailConfigured: !!(key && from) };
}
