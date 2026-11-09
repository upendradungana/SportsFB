"use client";
import { useEffect, useState } from "react"; import { useParams } from "next/navigation"; import Link from "next/link"; import { call, H, msg } from "@/lib/client"; import { Loc, Pill } from "@/components/ui";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], HOURS = Array.from({ length: 16 }, (_, i) => i + 6), pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const km = (a: any, b: any) => { const r = (x: number) => (x * Math.PI) / 180, h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
export default function Facility() {
  const { id } = useParams<{ id: string }>();
  const [f, setF] = useState<any>(null), [pos, setPos] = useState<any>(null), [date, setDate] = useState(ymd(new Date())), [av, setAv] = useState<any>({ taken: [], closed: false });
  const [start, setStart] = useState<number | null>(null), [hrs, setHrs] = useState(1), [note, setNote] = useState(""), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  useEffect(() => { call(`/api/facilities/${id}`).then((r) => (r.ok ? setF(r.d) : setNote(msg(r.d)))); navigator.geolocation?.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude })); }, [id]);
  useEffect(() => { setStart(null); call(`/api/facilities/${id}/availability?date=${date}`).then((r) => r.ok && setAv(r.d)); }, [id, date]);
  const at = (h: number) => new Date(`${date}T${pad(h)}:00:00`).getTime();
  const off = (h: number) => av.closed || at(h) <= Date.now() || av.taken.some((t: any) => new Date(t.start_time).getTime() < at(h) + 3600e3 && new Date(t.end_time).getTime() > at(h));
  let max = 0; if (start != null) while (max < 4 && start + max <= 21 && !off(start + max)) max++;
  const h = Math.max(1, Math.min(hrs, max || 1));
  async function book() {
    if (start == null) return; setBusy(true);
    const s = new Date(at(start)), e = new Date(at(start) + h * 3600e3);
    const r = await call("/api/bookings/reserve", { method: "POST", headers: H, body: JSON.stringify({ facilityId: id, startTime: s.toISOString(), endTime: e.toISOString() }) });
    setBusy(false); r.ok ? setDone(true) : setNote(msg(r.d));
  }
  if (!f) return <p>{note || "Loading…"}</p>;
  const today = ymd(new Date()), last = ymd(new Date(Date.now() + 89 * 864e5)), dir = (m: string) => `https://www.google.com/maps/dir/?api=1${pos ? `&origin=${pos.lat},${pos.lng}` : ""}&destination=${f.lat},${f.lng}&travelmode=${m}`;
  return (<div>
    <Link href="/play" style={{ color: "var(--muted)" }}>← All facilities</Link>
    <div className="row" style={{ justifyContent: "space-between" }}><h1 className="disp" style={{ fontSize: 30, margin: "8px 0" }}>{f.name}</h1><span><Pill t={f.sport_type} /> {f.featured && <span className="pill warn">FEATURED</span>}</span></div>
    <p style={{ color: "var(--muted)", marginTop: 0 }}>{f.address}{f.aliases && <> · also called {f.aliases}</>}{pos && <> · <b>{km(pos, f).toFixed(1)} km away</b></>}</p>
    <div className="two">
      <div><div className="card"><Loc lat={f.lat} lng={f.lng} me={pos} />
        <div className="row"><a className="btn" href={dir("driving")} target="_blank" rel="noreferrer" style={{ color: "#181717" }}>Directions</a><a className="btn alt" href={dir("walking")} target="_blank" rel="noreferrer">Walk</a><a className="btn alt" href={dir("transit")} target="_blank" rel="noreferrer">Transit</a></div></div>
        <div className="card" style={{ marginTop: 16 }}><h3 style={{ marginTop: 0 }}>Good to know</h3>
          <div className="line"><span>Price</span><b>Nu {f.price_nu_per_hour} / hour</b></div>
          <div className="line"><span>Closed</span><b>{f.closed_weekdays?.length ? "Every " + f.closed_weekdays.map((x: number) => DAYS[x]).join(", ") : "Open every day"}</b></div>
          <div className="line"><span>Payment</span><span>Bank transfer to the owner after approval</span></div>
          <div className="line"><span>Pay window</span><span>15 minutes, then the slot is released</span></div></div></div>
      <div className="card sticky">
        {done ? <><h3 style={{ marginTop: 0 }}>Request sent ✓</h3><p style={{ color: "var(--muted)" }}>The owner will review it. When they approve, you get 15 minutes to pay.</p><Link className="btn" href="/bookings">Track my booking</Link></> : <>
          <h3 style={{ marginTop: 0 }}>Book a slot</h3>
          <label className="lbl">Date</label><input type="date" min={today} max={last} value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%" }} />
          {av.closed ? <p style={{ color: "var(--warn)" }}>Closed on this day. Pick another date.</p> : <>
            <label className="lbl">Start time (struck-through slots are taken or past)</label>
            <div className="slots">{HOURS.map((x) => <button key={x} disabled={off(x)} className={"slot" + (off(x) ? " off" : "") + (start === x ? " sel" : "")} onClick={() => setStart(x)}>{pad(x)}:00</button>)}</div>
            <label className="lbl">Duration</label>
            <select value={h} disabled={start == null} onChange={(e) => setHrs(+e.target.value)} style={{ width: "100%" }}>{[1, 2, 3, 4].filter((n) => n <= (max || 1)).map((n) => <option key={n} value={n}>{n} hour{n > 1 && "s"}</option>)}</select></>}
          <div className="line" style={{ marginTop: 14 }}><span>{start != null ? `${pad(start)}:00 to ${pad(start + h)}:00` : "Choose a time"}</span><b style={{ fontSize: 20 }}>Nu {f.price_nu_per_hour * (start != null ? h : 0)}</b></div>
          <button className="btn" style={{ width: "100%", marginTop: 12 }} disabled={start == null || busy} onClick={book}>{busy ? "Sending…" : "Request this slot"}</button>
          {note && <p style={{ color: "var(--bad)" }}>{note}</p>}</>}
      </div></div></div>);
}