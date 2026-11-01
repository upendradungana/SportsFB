"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { call } from "@/lib/client"; import { d, dt, Pill } from "@/components/ui";
export default function Overview() {
  const [b, setB] = useState<any[]>([]), [f, setF] = useState<any[]>([]), [p, setP] = useState<any>(null);
  useEffect(() => { call("/api/bookings/mine").then((r) => r.ok && setB(r.d.items)); call("/api/owner/facilities").then((r) => r.ok && setF(r.d.items)); call("/api/owner/plan").then((r) => r.ok && setP(r.d)); }, []);
  const n = (s: string) => b.filter((x) => x.status === s).length, now = new Date();
  const revenue = b.filter((x) => x.status === "CONFIRMED" && new Date(x.start_time).getMonth() === now.getMonth() && new Date(x.start_time).getFullYear() === now.getFullYear()).reduce((a, x) => a + (x.amount_nu ?? 0), 0);
  const days = Array.from({ length: 7 }, (_, i) => { const t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i); return { l: t.toLocaleDateString([], { weekday: "short" }), c: b.filter((x) => ["CONFIRMED", "PENDING_PAYMENT", "PENDING_VERIFICATION"].includes(x.status) && new Date(x.start_time).toDateString() === t.toDateString()).length }; });
  const top = Math.max(1, ...days.map((x) => x.c));
  const up = b.filter((x) => x.status === "CONFIRMED" && new Date(x.start_time) > now).sort((a, c) => +new Date(a.start_time) - +new Date(c.start_time)).slice(0, 5);
  const S: [string, number | string, string][] = [["Requests to approve", n("PENDING_APPROVAL"), "/owner/requests"], ["Receipts to verify", n("PENDING_VERIFICATION"), "/owner/requests"], ["Confirmed bookings", n("CONFIRMED"), "/owner/requests"], ["Confirmed this month", `Nu ${revenue}`, "/owner/requests"], ["Facilities live", f.filter((x) => x.approval_status === "APPROVED" && x.is_active).length, "/owner/facilities"]];
  return (<div><h1 className="disp" style={{ fontSize: 26 }}>Overview</h1>
    {p && !p.verified && <div className="card" style={{ borderColor: "var(--warn)", marginBottom: 16 }}><b>Waiting for admin verification.</b> Your facilities stay hidden from players until an admin verifies you.</div>}
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))" }}>{S.map(([l, v, h]) => <Link key={l} href={h} className="stat"><b>{v}</b>{l}</Link>)}</div>
    <div className="two" style={{ marginTop: 20 }}>
      <div className="card"><h3 style={{ marginTop: 0 }}>Next 7 days</h3><div className="chart">{days.map((x, i) => <div key={i}><i style={{ height: `${(x.c / top) * 80}%` }} />{x.c}<br />{x.l}</div>)}</div>
        <h3>Upcoming confirmed</h3>{up.map((x) => <div key={x.id} className="line"><span>{x.name}<br /><small style={{ color: "var(--muted)" }}>{x.player_name}</small></span><span>{dt(x.start_time)}</span></div>)}{!up.length && <small style={{ color: "var(--muted)" }}>Nothing confirmed yet.</small>}</div>
      {p && <div className="card"><h3 style={{ marginTop: 0 }}>Your plan</h3><div className="line"><span>Plan</span><Pill t={p.plan} /></div>
        <div className="line"><span>Facilities</span><b>{p.used} of {p.max > 999 ? "unlimited" : p.max}</b></div><div className="line"><span>{p.expires_at ? "Ends" : "Renewal"}</span><span>{p.expires_at ? d(p.expires_at) : "Free plan never expires"}</span></div>
        <p><Link className="btn" href="/owner/plan">Manage plan</Link></p></div>}</div></div>);
}
