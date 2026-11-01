"use client";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { call, H, msg } from "@/lib/client"; import { Drawer, Loc, Pill, Thumb } from "@/components/ui";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type F = { id: string; name: string; sport_type: string; address: string; price_nu_per_hour: number; distance_km: number | null; lat: number; lng: number; aliases: string | null; featured: boolean; closed_weekdays: number[] };
const SPORTS = ["FOOTBALL", "TENNIS", "VOLLEYBALL", "BASKETBALL", "BADMINTON", "OTHER"];
export default function Play() {
  const router = useRouter();
  const [items, setItems] = useState<F[]>([]), [q, setQ] = useState(""), [sport, setSport] = useState(""), [max, setMax] = useState(""), [sort, setSort] = useState("near");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null), [geo, setGeo] = useState("asking"), [sel, setSel] = useState<F | null>(null);
  const [start, setStart] = useState(""), [hrs, setHrs] = useState(1), [note, setNote] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { navigator.geolocation ? navigator.geolocation.getCurrentPosition((p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeo("ok"); }, () => setGeo("denied")) : setGeo("denied"); }, []);
  useEffect(() => {
    const p = new URLSearchParams({ q, sport, max }); if (pos) { p.set("lat", String(pos.lat)); p.set("lng", String(pos.lng)); }
    const t = setTimeout(() => call("/api/facilities?" + p).then((r) => r.ok && setItems(r.d.items)), 400); return () => clearTimeout(t);
  }, [q, sport, max, pos]);
  const list = [...items].sort((a, b) => sort === "low" ? a.price_nu_per_hour - b.price_nu_per_hour : sort === "high" ? b.price_nu_per_hour - a.price_nu_per_hour : (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9));
  const loc = (t: number) => new Date(t - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16), minStr = loc(Date.now() + 3600e3), maxStr = loc(Date.now() + 90 * 864e5);
  const closedNow = !!start && !!sel?.closed_weekdays?.includes(new Date(start).getDay());
  const km = (f: F) => f.distance_km == null ? null : `${Number(f.distance_km).toFixed(1)} km away`;
  const dir = (f: F, mode: string) => `https://www.google.com/maps/dir/?api=1${pos ? `&origin=${pos.lat},${pos.lng}` : ""}&destination=${f.lat},${f.lng}&travelmode=${mode}`;
  async function book() {
    setBusy(true); const s = new Date(start), e = new Date(s.getTime() + hrs * 3600e3);
    const r = await call("/api/bookings/reserve", { method: "POST", headers: H, body: JSON.stringify({ facilityId: sel!.id, startTime: s.toISOString(), endTime: e.toISOString() }) });
    setNote(r.ok ? "Request sent. Track it under My bookings." : msg(r.d)); setBusy(false);
  }
  const card = (f: F) => <div key={f.id} className="card tilt" style={{ cursor: "pointer" }} onClick={() => router.push("/play/" + f.id)}>
    <Thumb lat={f.lat} lng={f.lng} /><span className="pill ok">{f.sport_type}</span> {f.featured && <span className="pill warn">FEATURED</span>}<h3 style={{ margin: "10px 0 4px" }}>{f.name}</h3><small style={{ opacity: .75 }}>{f.address}</small>
    <p style={{ margin: "10px 0 0" }}>Nu {f.price_nu_per_hour}/hr{km(f) && <> · <b>{km(f)}</b></>}</p></div>;
  return (<div>
    <h1 className="disp" style={{ fontSize: 24 }}>Find a pitch</h1>
    <div className="row"><input placeholder="Search name or area" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
      <select value={sport} onChange={(e) => setSport(e.target.value)}><option value="">All sports</option>{SPORTS.map((s) => <option key={s}>{s}</option>)}</select>
      <input type="number" placeholder="Max Nu/hr" value={max} onChange={(e) => setMax(e.target.value)} style={{ width: 120 }} />
      <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="near">Nearest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    {geo === "denied" && <p style={{ opacity: .8 }}>Location is off, so distances are hidden. Allow location in your browser to see what is closest.</p>}
    {pos && sort === "near" && list.length > 0 && <><h3>Closest to you</h3><div className="rail">{list.slice(0, 6).map(card)}</div></>}
    <h3>All facilities</h3><div className="grid">{list.map(card)}</div>
    {!list.length && <p style={{ opacity: .8 }}>No facilities match yet. Listings appear once an admin approves the facility and its owner.</p>}
  </div>);
}
