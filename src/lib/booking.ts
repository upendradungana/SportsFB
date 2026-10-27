import { sql } from "drizzle-orm";
import { Client } from "@upstash/qstash";
import { db } from "@/db";

const PAY_MIN = 15, UNAPPROVED_H = 24;
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });
const hook = (b: object, delay: number, id: string) =>
  qstash.publishJSON({ url: `${process.env.APP_URL}/api/webhooks/expire-booking`, body: b, delay, deduplicationId: id });
const fail = (e: any) => {
  if (e?.code === "23P01") return { ok: false as const, error: "SLOT_TAKEN" };
  if (e?.code === "23505") return { ok: false as const, error: "DUPLICATE_RECEIPT" };
  const m = String(e?.message ?? "").match(/BOOKING_CAP|BOOKING_BANNED|ACCOUNT_LOCKED|PAST_BOOKING|TOO_FAR/);
  if (m) return { ok: false as const, error: m[0] };
  throw e;
};

const closedAt = (f: string, ts: string) => sql`EXISTS (SELECT 1 FROM facility_blocks b WHERE b.facility_id = ${f}::uuid AND ((b.kind = 'DATE' AND b.on_date = (${ts}::timestamptz AT TIME ZONE 'Asia/Thimphu')::date)
  OR (b.kind = 'WEEKDAY' AND b.weekday = EXTRACT(dow FROM (${ts}::timestamptz AT TIME ZONE 'Asia/Thimphu'))::int)))`;
export async function reserve(playerId: string, facilityId: string, start: Date, end: Date) {
  if (!(start < end) || start <= new Date()) return { ok: false as const, error: "INVALID_RANGE" };
  try {
    const r = await db.execute(sql`
      INSERT INTO bookings (facility_id, player_id, start_time, end_time, status)
      SELECT ${facilityId}::uuid, ${playerId}::uuid, ${start.toISOString()}::timestamptz, ${end.toISOString()}::timestamptz, 'PENDING_APPROVAL'
      WHERE EXISTS (SELECT 1 FROM facilities f JOIN users o ON o.id = f.owner_id WHERE f.id = ${facilityId}::uuid AND f.is_active AND o.is_verified_owner)
        AND NOT (${closedAt(facilityId, start.toISOString())} OR ${closedAt(facilityId, new Date(end.getTime() - 1000).toISOString())})
      RETURNING id`);
    const id = r.rows[0]?.id as string | undefined;
    if (!id) {
      const c = (await db.execute(sql`SELECT (${closedAt(facilityId, start.toISOString())} OR ${closedAt(facilityId, new Date(end.getTime() - 1000).toISOString())}) AS c`)).rows[0]?.c;
      return { ok: false as const, error: c ? "FACILITY_CLOSED" : "NOT_FOUND" };
    }
    await hook({ bookingId: id, kind: "unapproved" }, UNAPPROVED_H * 3600 + 5, `unapproved-${id}`).catch(() => {}); // sweep() is the backstop
    return { ok: true as const, id };
  } catch (e) { return fail(e); }
}

export async function approve(ownerId: string, bookingId: string) {
  const r = await db.execute(sql`
    UPDATE bookings b SET status = 'PENDING_PAYMENT', payment_deadline = now() + make_interval(mins => ${PAY_MIN})
    FROM facilities f WHERE b.id = ${bookingId}::uuid AND b.facility_id = f.id AND f.owner_id = ${ownerId}::uuid AND b.status = 'PENDING_APPROVAL'
    RETURNING b.payment_deadline`);
  if (!r.rows[0]) return { ok: false as const, error: "NOT_APPROVABLE" };
  await hook({ bookingId, kind: "unpaid" }, PAY_MIN * 60 + 5, `unpaid-${bookingId}`).catch(() => {});
  return { ok: true as const, deadline: r.rows[0].payment_deadline as string };
}

/** Authorization lives in the WHERE clause: no row => no data. */
export async function bankDetails(playerId: string, bookingId: string) {
  const r = await db.execute(sql`
    SELECT f.bank_details, b.payment_deadline FROM bookings b JOIN facilities f ON f.id = b.facility_id
    WHERE b.id = ${bookingId}::uuid AND b.player_id = ${playerId}::uuid AND b.status = 'PENDING_PAYMENT' AND b.payment_deadline > now()`);
  return r.rows[0] ? { bankDetails: r.rows[0].bank_details as string, deadline: r.rows[0].payment_deadline as string } : null;
}

export async function submitProof(playerId: string, bookingId: string, hash: string, b64: string) {
  try {
    const r = await db.execute(sql`
      WITH b AS (UPDATE bookings SET status = 'PENDING_VERIFICATION'
        WHERE id = ${bookingId}::uuid AND player_id = ${playerId}::uuid AND status = 'PENDING_PAYMENT' AND payment_deadline > now() RETURNING id)
      INSERT INTO payment_receipts (booking_id, image_hash, image_b64) SELECT id, ${hash}, ${b64} FROM b RETURNING id`);
    return r.rows[0] ? { ok: true as const } : { ok: false as const, error: "NOT_PAYABLE" };
  } catch (e) { return fail(e); }
}

export async function receiptFor(ownerId: string, bookingId: string) {
  const r = await db.execute(sql`
    SELECT r.image_b64 FROM payment_receipts r JOIN bookings b ON b.id = r.booking_id JOIN facilities f ON f.id = b.facility_id
    WHERE b.id = ${bookingId}::uuid AND f.owner_id = ${ownerId}::uuid AND b.status = 'PENDING_VERIFICATION'`);
  return (r.rows[0]?.image_b64 as string | undefined) ?? null;
}

/** Only path to CONFIRMED. FRAUD is one atomic statement: cancel + audit + strike + lock at 2. */
export async function verify(ownerId: string, bookingId: string, decision: "APPROVE" | "REJECT" | "FRAUD") {
  const own = sql`b.id = ${bookingId}::uuid AND b.facility_id = f.id AND f.owner_id = ${ownerId}::uuid AND b.status = 'PENDING_VERIFICATION'`;
  const q = decision === "APPROVE" ? sql`
      WITH b AS (UPDATE bookings b SET status = 'CONFIRMED' FROM facilities f WHERE ${own} RETURNING b.player_id),
      u AS (UPDATE users SET unpaid_expiries = 0 FROM b WHERE users.id = b.player_id RETURNING 1)
      SELECT count(*)::int AS n FROM b`
    : decision === "REJECT" ? sql`
      WITH b AS (UPDATE bookings b SET status = 'REJECTED' FROM facilities f WHERE ${own} RETURNING 1) SELECT count(*)::int AS n FROM b`
    : sql`
      WITH b AS (UPDATE bookings b SET status = 'CANCELLED' FROM facilities f WHERE ${own} RETURNING b.id, b.player_id, b.facility_id),
      a AS (INSERT INTO audit_logs (actor_id, subject_id, action, metadata)
        SELECT ${ownerId}::uuid, b.player_id, 'FRAUD_FLAG', jsonb_build_object('bookingId', b.id, 'facilityId', b.facility_id,
          'playerEmail', (SELECT email FROM users WHERE id = b.player_id), 'playerPhone', (SELECT phone FROM users WHERE id = b.player_id),
          'receiptHash', (SELECT image_hash FROM payment_receipts WHERE booking_id = b.id LIMIT 1)) FROM b RETURNING 1),
      u AS (UPDATE users SET fraud_strikes = fraud_strikes + 1, is_locked = is_locked OR fraud_strikes + 1 >= 2
        FROM b WHERE users.id = b.player_id RETURNING 1)
      SELECT count(*)::int AS n FROM b`;
  try { const r = await db.execute(q); return (r.rows[0]?.n as number) > 0 ? { ok: true as const } : { ok: false as const, error: "NOT_VERIFIABLE" }; }
  catch (e) { return fail(e); }
}

/** Idempotent; QStash calls it per booking, sweep() calls it for everything overdue. */
export async function expireUnpaid(bookingId?: string) {
  const r = await db.execute(sql`
    WITH e AS (UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING_PAYMENT' AND payment_deadline <= now()
        AND (${bookingId ?? null}::uuid IS NULL OR id = ${bookingId ?? null}::uuid) RETURNING player_id),
    c AS (SELECT player_id, count(*)::int AS k FROM e GROUP BY player_id),
    u AS (UPDATE users SET unpaid_expiries = CASE WHEN unpaid_expiries + c.k >= 3 THEN 0 ELSE unpaid_expiries + c.k END,
        booking_ban_until = CASE WHEN unpaid_expiries + c.k >= 3 THEN now() + interval '24 hours' ELSE booking_ban_until END
      FROM c WHERE users.id = c.player_id RETURNING 1)
    SELECT count(*)::int AS n FROM e`);
  return r.rows[0]?.n as number;
}
export async function expireUnapproved(bookingId?: string) {
  const r = await db.execute(sql`
    UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING_APPROVAL' AND created_at <= now() - make_interval(hours => ${UNAPPROVED_H})
      AND (${bookingId ?? null}::uuid IS NULL OR id = ${bookingId ?? null}::uuid) RETURNING id`);
  return r.rows.length;
}
