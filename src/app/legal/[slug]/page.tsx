import { notFound } from "next/navigation";
const DOCS: Record<string, { t: string; p: string[] }> = {
  privacy: { t: "Privacy policy", p: [
    "DRAFT: have this reviewed before launch.",
    "We store your Google name, email and photo, your Bhutanese phone number, your bookings, and payment receipt images you upload.",
    "Receipts are re-encoded to remove hidden metadata and are visible only to the facility owner handling that booking.",
    "Owners see a player's name and phone for that player's bookings. Fraud flags are kept in an audit log." ] },
  terms: { t: "Terms of use", p: [
    "DRAFT: have this reviewed before launch.",
    "SportsFB connects players with facility owners. Payments are bank transfers made directly to the owner; SportsFB does not process or hold money.",
    "After an owner approves a request you have 15 minutes to pay and upload proof, or the slot is released.",
    "Fake or reused receipts are flagged. Two confirmed flags lock the account for admin review." ] },
};
export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const d = DOCS[(await params).slug]; if (!d) notFound();
  return <main className="set3 page"><h1>{d.t}</h1>{d.p.map((x, i) => <p key={i} style={{ maxWidth: 680, lineHeight: 1.6 }}>{x}</p>)}</main>;
}
