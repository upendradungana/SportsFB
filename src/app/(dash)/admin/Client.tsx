"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client";
const NAV = [["overview", "Dashboard", "▦"], ["owners", "Owners", "◉"], ["facilities", "Approvals", "✔"], ["subscriptions", "Subscriptions", "⏱"], ["users", "Users", "☰"], ["audit", "Audit log", "≣"]];
const FIL: Record<string, [string, (r: any) => boolean][]> = {
  owners: [["All", () => true], ["Pending", (r) => !r.is_verified_owner], ["Verified", (r) => r.is_verified_owner]],
  facilities: [["All", () => true], ["Pending", (r) => r.approval_status === "PENDING"], ["Approved", (r) => r.approval_status === "APPROVED"], ["Rejected", (r) => r.approval_status === "REJECTED"]],
  subscriptions: [["All", () => true], ["Active", (r) => r.state === "ACTIVE"], ["Expiring", (r) => r.state === "EXPIRING"], ["Expired", (r) => r.state === "EXPIRED"]],
  users: [["All", () => true], ["Locked", (r) => r.is_locked], ["Suspended", (r) => r.is_suspended]],
};
const LBL: Record<string, string> = { players: "Players", owners: "Owners", owners_pending: "Owners to verify", pending_facilities: "Facilities to approve", expiring_plans: "Plans expiring in 7 days", locked_accounts: "Locked accounts", confirmed_bookings: "Confirmed bookings", receipts_awaiting_owner: "Receipts awaiting owner" };
const d = (x: any) => (x ? new Date(x).toLocaleDateString() : "-");
const Av = ({ s, n }: { s?: string; n?: string }) => s ? <img src={s} alt="" referrerPolicy="no-referrer" className="av sm" /> : <div className="av sm">{(n || "?")[0]}</div>;
const Pill = ({ t }: { t: string }) => <span className={"pill " + (/ACTIVE|APPROVED|VERIFIED/.test(t) ? "ok" : /PENDING|EXPIRING/.test(t) ? "warn" : "bad")}>{t}</span>;
const Loc = ({ lat, lng }: { lat: number; lng: number }) => <>
  <iframe title="Facility location" className="map" src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - .006}%2C${lat - .004}%2C${lng + .006}%2C${lat + .004}&layer=mapnik&marker=${lat}%2C${lng}`} />
  <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noreferrer">Open in Google Maps ({lat.toFixed(5)}, {lng.toFixed(5)})</a></>;
export default function Admin({ tab }: { tab: string }) {
  const [data, setData] = useState<{ tab: string; rows: any[] }>({ tab: "", rows: [] });
  const [fi, setFi] = useState(0), [q, setQ] = useState(""), [sel, setSel] = useState<any>(null), [fac, setFac] = useState<any[]>([]), [flash, setFlash] = useState("");
  const rows = data.tab === tab ? data.rows : []; // never render another tab's rows (fixes the missing-key warning)
  const load = () => call("/api/admin/data?tab=" + tab).then((r) => { if (r.ok) setData({ tab, rows: r.d.rows }); else if (r.d.error === "MFA_REQUIRED") location.href = "/admin/2fa"; else setFlash(msg(r.d)); });
  useEffect(() => { setFi(0); setQ(""); setSel(null); load(); }, [tab]);
  async function act(url: string, body: object) { const r = await call(url, { method: "POST", headers: H, body: JSON.stringify(body) }); setFlash(r.ok ? "Done." : msg(r.d)); setSel(null); load(); }
  async function openOwner(o: any) { setSel({ k: "owner", o }); setFac([]); const r = await call("/api/admin/data?tab=facilities"); if (r.ok) setFac(r.d.rows.filter((f: any) => f.owner_id === o.id)); }
  const btn = (l: string, fn: () => void, alt = false) => <button className={alt ? "btn alt" : "btn"} style={{ padding: "5px 12px", marginRight: 6 }} onClick={(e) => { e.stopPropagation(); fn(); }}>{l}</button>;
  const facBtns = (f: any) => <>{btn("Approve", () => act("/api/admin/manage", { id: f.id, action: "APPROVE_FACILITY" }))}{btn("Reject", () => act("/api/admin/manage", { id: f.id, action: "REJECT_FACILITY" }), true)}</>;
  const shown = rows.filter((r) => (FIL[tab]?.[fi]?.[1] ?? (() => true))(r) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const who = (n: string, e: string, i?: string) => <div className="row" style={{ margin: 0, flexWrap: "nowrap" }}><Av s={i} n={n} /><div><b>{n}</b><br /><small style={{ opacity: .7 }}>{e}</small></div></div>;
  return (
    <div>
          <h1 className="disp" style={{ fontSize: 24, color: "#5ad1ff" }}>{NAV.find((n) => n[0] === tab)![1]}</h1>
          <input placeholder="Search this table…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: "100%", maxWidth: 420 }} />
          {flash && <p style={{ color: "var(--acc)" }}>{flash}</p>}
          {tab === "overview" && rows[0] && <div className="grid">{Object.entries(rows[0]).map(([k, v]) => <div key={k} className="stat"><b>{String(v)}</b>{LBL[k] ?? k}</div>)}</div>}
          {FIL[tab] && <div className="ftabs">{FIL[tab].map(([l], i) => <button key={l} className={"ftab" + (i === fi ? " on" : "")} onClick={() => setFi(i)}>{l}</button>)}</div>}
          {tab === "subscriptions" && <p>{btn("Send expiry reminders now", async () => { const r = await call("/api/admin/reminders", { method: "POST" }); setFlash(r.ok ? `Due ${r.d.due}, emailed ${r.d.sent}${r.d.mailConfigured ? "" : " (email not configured)"}` : msg(r.d)); load(); })}</p>}
          {tab !== "overview" && <div style={{ overflowX: "auto" }}><table className="dt"><tbody>
            {tab === "owners" && shown.map((o) => <tr key={o.id} className="click" onClick={() => openOwner(o)}><td>{who(o.name, o.email, o.image)}</td><td>{o.phone}</td><td>{o.facilities} facilities</td><td><Pill t={o.is_suspended ? "SUSPENDED" : o.is_verified_owner ? "VERIFIED" : "PENDING"} /></td></tr>)}
            {tab === "facilities" && shown.map((f) => <tr key={f.id} className="click" onClick={() => setSel({ k: "fac", f })}><td><b>{f.name}</b><br /><small style={{ opacity: .7 }}>{f.address}</small></td><td>{f.owner_name}</td><td>{f.sport_type} · Nu {f.price_nu_per_hour}</td><td><Pill t={f.approval_status} /></td></tr>)}
            {tab === "subscriptions" && shown.map((o) => <tr key={o.id}><td>{who(o.name, o.email, o.image)}</td><td>{o.expires_at ? "Ends " + d(o.expires_at) : "No plan"}</td><td><Pill t={o.state} /></td><td>{btn("Extend 30 days", () => act("/api/admin/manage", { id: o.id, action: "EXTEND_SUB" }))}{btn("Expire now", () => act("/api/admin/manage", { id: o.id, action: "EXPIRE_SUB" }), true)}</td></tr>)}
            {tab === "users" && shown.map((u) => <tr key={u.id}><td>{who(u.name, u.email, u.image)}</td><td>{u.role}</td><td>{u.fraud_strikes} strikes</td><td><Pill t={u.is_locked ? "LOCKED" : u.is_suspended ? "SUSPENDED" : "ACTIVE"} /></td>
              <td>{u.role !== "ADMIN" && <>{u.is_locked ? btn("Unlock", () => act("/api/admin/action", { userId: u.id, action: "UNLOCK" })) : btn("Lock", () => act("/api/admin/action", { userId: u.id, action: "LOCK" }), true)}{u.is_suspended ? btn("Unsuspend", () => act("/api/admin/action", { userId: u.id, action: "UNSUSPEND" })) : btn("Suspend", () => act("/api/admin/action", { userId: u.id, action: "SUSPEND" }), true)}{btn("Sign out", () => act("/api/admin/action", { userId: u.id, action: "REVOKE_SESSIONS" }), true)}</>}</td></tr>)}
            {tab === "audit" && shown.map((a) => <tr key={a.id}><td>{new Date(a.at).toLocaleString()}</td><td><b>{a.action}</b></td><td>{a.actor ?? "-"}</td><td>{a.subject ?? "-"}</td></tr>)}
          </tbody></table></div>}
          {tab !== "overview" && !shown.length && <p style={{ opacity: .7 }}>Nothing here.</p>}
      {sel && <><div className="veil" onClick={() => setSel(null)} /><div className="drawer">
        <button className="btn alt" style={{ float: "right" }} onClick={() => setSel(null)}>Close</button>
        {sel.k === "owner" && <>{who(sel.o.name, sel.o.email, sel.o.image)}<p>{sel.o.phone} · joined {d(sel.o.created_at)}</p><p style={{ opacity: .85 }}>{sel.o.owner_note || "No note provided."}</p>
          <p>{sel.o.is_verified_owner ? btn("Unverify owner", () => act("/api/admin/action", { userId: sel.o.id, action: "UNVERIFY_OWNER" }), true) : btn("Verify owner (starts 30-day plan)", () => act("/api/admin/action", { userId: sel.o.id, action: "VERIFY_OWNER" }))}</p>
          <h3>Facilities</h3>{fac.map((f) => <div key={f.id} className="stat" style={{ marginBottom: 10 }}><b style={{ fontSize: 16 }}>{f.name}</b> <Pill t={f.approval_status} /><br />{f.sport_type} · Nu {f.price_nu_per_hour}/hr<br /><small>{f.address}</small><Loc lat={f.lat} lng={f.lng} /><p>{facBtns(f)}</p></div>)}{!fac.length && <p>No facilities yet.</p>}</>}
        {sel.k === "fac" && <><h2>{sel.f.name}</h2><Pill t={sel.f.approval_status} /><p>{sel.f.sport_type} · Nu {sel.f.price_nu_per_hour}/hr<br />{sel.f.address}</p>{who(sel.f.owner_name, sel.f.owner_email, sel.f.owner_image)}<Loc lat={sel.f.lat} lng={sel.f.lng} /><p>{facBtns(sel.f)}</p></>}
      </div></>}
    </div>
  );
}
