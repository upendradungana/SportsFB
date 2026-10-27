export const H = { "Content-Type": "application/json" };
export async function call(url: string, init?: RequestInit) {
  const r = await fetch(url, init); let d: any = {}; try { d = await r.json(); } catch {}
  return { ok: r.ok, d };
}
const ERR: Record<string, string> = {
  SLOT_TAKEN: "That time was just taken.", BOOKING_CAP: "You already have 3 open requests.",
  BOOKING_BANNED: "Booking paused for 24h after repeated unpaid bookings.", ACCOUNT_LOCKED: "Account locked for admin review.",
  INVALID_RANGE: "Choose a future start time.", RATE_LIMITED: "Too many attempts. Wait a moment.", NOT_FOUND: "Facility not available.",
  INVALID_BT_PHONE: "Phone must be 77/17/16 followed by 6 digits.", DUPLICATE_RECEIPT: "This receipt was already used.",
  ALREADY_EXISTS: "You already added this.", HAS_OPEN_BOOKINGS: "Finish or cancel your open bookings first.", PAST_BOOKING: "Choose a time in the future.", TOO_FAR: "You can book up to 90 days ahead.", FACILITY_CLOSED: "The facility is closed that day.", NOT_PAYABLE: "Payment window has closed.", INVALID_IMAGE: "Upload a JPG, PNG or WebP image.", FILE_TOO_LARGE_OR_MISSING: "Image must be under 4 MB.",
};
export const msg = (d: any) => ERR[d?.error] ?? d?.error ?? "Something went wrong";
