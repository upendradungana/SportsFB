"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { call } from "@/lib/client"; import { d, Pill } from "@/components/ui";
export default function Overview() {
  const [b, setB] = useState<any[]>([]), [f, setF] = useState<any[]>([]), [p, setP] = useState<any>(null);
  useEffect(() => { call("/api/bookings/mine").then((r) => r.ok && setB(r.d.items)); call("/api/owner/facilities").then((r) => r.ok && setF(r.d.items)); call("/api/owner/plan").then((r) => r.ok && setP(r.d)); }, []);
  const n = (s: string) => b.filter((x) => x.status === s).length;
  const S: [string, number, string][] = [["Requests to approve", n("PENDING_APPROVAL"), "/owner/requests"], ["Receipts to verify", n("PENDING_VERIFICATION"), "/owner/requests"], ["Confirmed bookings", n("CONFIRMED"), "/owner/requests"],
    ["Facilities live", f.filter((x) => x.approval_status === "APPROVED" && x.is_active).length, "/owner/facilities"], ["Awaiting admin approval", f.filter((x) => x.approval_status === "PENDING").length, "/owner/facilities"]];
  return (<div>
    <h1 className="disp" style={{ fontSize: 24 }}>Overview</h1>
    {p && !p.verified && <div className="card" style={{ marginBottom: 16 }}><b>Waiting for admin verification.</b> Your facilities stay hidden from players until an admin verifies your account.</div>}
    <div className="grid">{S.map(([l, v, h]) => <Link key={l} href={h} className="stat"><b>{v}</b>{l}</Link>)}
      {p && <div className="stat"><b style={{ fontSize: 18 }}><Pill t={p.state} /></b>Plan {p.expires_at ? "ends " + d(p.expires_at) : "not active"}<br /><small style={{ opacity: .75 }}>To renew, pay the platform fee and ask the admin to extend your plan. Expired plans hide your facilities.</small></div>}</div>
  </div>);
}
