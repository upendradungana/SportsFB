"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client"; import { Av, Btn, Drawer, dt, Filters, Pill } from "@/components/ui";
const F: [string, (s: string) => boolean][] = [["All", () => true], ["To approve", (s) => s === "PENDING_APPROVAL"], ["Awaiting payment", (s) => s === "PENDING_PAYMENT"], ["To verify", (s) => s === "PENDING_VERIFICATION"], ["Confirmed", (s) => s === "CONFIRMED"], ["Closed", (s) => ["REJECTED", "EXPIRED", "CANCELLED"].includes(s)]];
export default function Requests() {
  const [rows, setRows] = useState<any[]>([]), [fi, setFi] = useState(0), [q, setQ] = useState(""), [sel, setSel] = useState<any>(null), [flash, setFlash] = useState("");
  const load = () => call("/api/bookings/mine").then((r) => r.ok && setRows(r.d.items));
  useEffect(() => { load(); const i = setInterval(() => !document.hidden && load(), 45000); return () => clearInterval(i); }, []);
  async function act(url: string, body: object, ask?: string) { if (ask && !confirm(ask)) return; const r = await call(url, { method: "POST", headers: H, body: JSON.stringify(body) }); setFlash(r.ok ? "Done." : msg(r.d)); setSel(null); load(); }
  const v = (id: string, decision: string, ask?: string) => act("/api/bookings/verify", { bookingId: id, decision }, ask);
  const shown = rows.filter((r) => F[fi][1](r.status) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  return (<div>
    <h1 className="disp" style={{ fontSize: 24 }}>Requests</h1>
    <input placeholder="Search player or facility…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: "100%", maxWidth: 420 }} />
    <Filters items={F.map((x) => x[0])} i={fi} set={setFi} />{flash && <p>{flash}</p>}
    <div style={{ overflowX: "auto" }}><table className="dt"><tbody>{shown.map((b) => (
      <tr key={b.id} className="click" onClick={() => setSel(b)}>
        <td><div className="row" style={{ margin: 0, flexWrap: "nowrap" }}><Av n={b.player_name} /><div><b>{b.player_name}</b><br /><small>{b.player_phone}</small></div></div></td>
        <td>{b.name}</td><td>{dt(b.start_time)}</td><td><Pill t={b.status} /></td></tr>))}</tbody></table></div>
    {!shown.length && <p style={{ opacity: .7 }}>Nothing here.</p>}
    {sel && <Drawer onClose={() => setSel(null)}>
      <h2>{sel.name}</h2><Pill t={sel.status} /><p>{dt(sel.start_time)} → {new Date(sel.end_time).toLocaleTimeString()}<br />{sel.player_name} · {sel.player_phone}</p>
      {sel.status === "PENDING_APPROVAL" && <Btn l="Approve and request payment" fn={() => act("/api/bookings/approve", { bookingId: sel.id })} />}
      {sel.status === "PENDING_PAYMENT" && <p>Waiting for the player to pay before {dt(sel.payment_deadline)}.</p>}
      {sel.status === "PENDING_VERIFICATION" && <><img src={`/api/receipts/${sel.id}`} alt="Payment receipt" style={{ width: "100%", borderRadius: 10 }} />
        <p><Btn l="Confirm payment" fn={() => v(sel.id, "APPROVE")} /><Btn l="Reject" alt fn={() => v(sel.id, "REJECT")} /><Btn l="Reject & flag fraud" alt fn={() => v(sel.id, "FRAUD", "Flag as fraud? This cancels the slot and adds a strike to the player.")} /></p></>}
    </Drawer>}
  </div>);
}
