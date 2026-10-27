"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { call, msg } from "@/lib/client";
function Left({ to }: { to: string }) {
  const [s, setS] = useState(0);
  useEffect(() => { const t = () => setS(Math.max(0, Math.floor((new Date(to).getTime() - Date.now()) / 1000))); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [to]);
  return <b>{Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}</b>;
}
export default function Bookings() {
  const [items, setItems] = useState<any[]>([]), [info, setInfo] = useState<Record<string, string>>({});
  const load = () => call("/api/bookings/mine").then((r) => r.ok && setItems(r.d.items));
  useEffect(() => { load(); const i = setInterval(() => !document.hidden && load(), 45000); return () => clearInterval(i); }, []);
  const say = (id: string, t: string) => setInfo((m) => ({ ...m, [id]: t }));
  async function bank(id: string) { const r = await call(`/api/bookings/${id}/bank-details`); say(id, r.ok ? r.d.bankDetails : "Not available (window may have closed)."); }
  async function up(id: string, f?: File) {
    if (!f) return; const fd = new FormData(); fd.set("bookingId", id); fd.set("file", f);
    const r = await call("/api/payments/upload-proof", { method: "POST", body: fd }); say(id, r.ok ? "Receipt sent. Waiting for owner." : msg(r.d)); load();
  }
  return (
    <main className="page">
      <div className="row" style={{ justifyContent: "space-between" }}><h1 className="grad">My bookings</h1><Link href="/play">Find a pitch</Link></div>
      <div className="grid">{items.map((b) => (
        <div key={b.id} className="card tilt">
          <span className="badge">{b.status.replace("_", " ")}</span><h3>{b.name}</h3>
          <p>{new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleTimeString()}</p>
          {b.status === "PENDING_PAYMENT" && <>
            <p>Pay within <Left to={b.payment_deadline} /></p>
            <button className="btn alt" onClick={() => bank(b.id)}>Show bank details</button>
            <div className="row"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => up(b.id, e.target.files?.[0])} /></div></>}
          {info[b.id] && <pre style={{ whiteSpace: "pre-wrap" }}>{info[b.id]}</pre>}
        </div>))}
        {!items.length && <p>No bookings yet.</p>}
      </div>
    </main>
  );
}
