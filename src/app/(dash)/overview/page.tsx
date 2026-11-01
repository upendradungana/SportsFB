"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { call } from "@/lib/client"; import { dt, Pill } from "@/components/ui";
export default function Overview() {
  const [b, setB] = useState<any[] | null>(null);
  useEffect(() => { call("/api/bookings/mine").then((r) => r.ok && setB(r.d.items)); }, []);
  const n = (s: string) => (b ?? []).filter((x) => x.status === s).length;
  const next = (b ?? []).filter((x) => x.status === "CONFIRMED" && new Date(x.start_time) > new Date()).sort((a, c) => +new Date(a.start_time) - +new Date(c.start_time))[0];
  const pay = (b ?? []).find((x) => x.status === "PENDING_PAYMENT");
  return (<div><h1 className="disp" style={{ fontSize: 26 }}>Overview</h1>
    {pay && <div className="card" style={{ borderColor: "var(--warn)", marginBottom: 16 }}><b>Payment due:</b> {pay.name}. <Link href="/bookings" style={{ color: "var(--hi)" }}>Pay now</Link></div>}
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
      <Link href="/bookings" className="stat"><b>{n("CONFIRMED")}</b>Confirmed</Link><Link href="/bookings" className="stat"><b>{n("PENDING_APPROVAL")}</b>Waiting for owner</Link>
      <Link href="/bookings" className="stat"><b>{n("PENDING_PAYMENT") + n("PENDING_VERIFICATION")}</b>Payment steps open</Link></div>
    <h3>Next game</h3>
    {next ? <div className="card"><b>{next.name}</b> <Pill t="CONFIRMED" /><br />{dt(next.start_time)}</div> : <div className="card">Nothing booked yet. <Link href="/play" style={{ color: "var(--hi)" }}>Find a pitch</Link></div>}</div>);
}
