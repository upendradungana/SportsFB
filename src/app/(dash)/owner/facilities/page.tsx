"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client"; import { Btn, Drawer, Filters, Full, Loc, MapView, Pill } from "@/components/ui";
const SPORTS = ["FOOTBALL", "TENNIS", "VOLLEYBALL", "BASKETBALL", "BADMINTON", "OTHER"], DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FL: [string, (f: any) => boolean][] = [["All", () => true], ["Listed", (f) => f.approval_status === "APPROVED" && f.is_active], ["Pending", (f) => f.approval_status === "PENDING"], ["Hidden", (f) => !f.is_active], ["Rejected", (f) => f.approval_status === "REJECTED"]];
const E = { name: "", sportType: "FOOTBALL", address: "", aliases: "", priceNuPerHour: "", bankDetails: "", lat: "", lng: "" };
const status = (f: any) => f.approval_status !== "APPROVED" ? f.approval_status : f.is_active ? "LISTED" : "HIDDEN";
function Closures({ id }: { id: string }) {
  const [rows, setRows] = useState<any[]>([]), [kind, setKind] = useState("WEEKDAY"), [day, setDay] = useState(4), [date, setDate] = useState(""), [note, setNote] = useState(""), [err, setErr] = useState("");
  const load = () => call("/api/owner/blocks?facilityId=" + id).then((r) => r.ok && setRows(r.d.items));
  useEffect(() => { load(); }, [id]);
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  async function add() { const r = await call("/api/owner/blocks", { method: "POST", headers: H, body: JSON.stringify(kind === "DATE" ? { kind, facilityId: id, onDate: date, note } : { kind, facilityId: id, weekday: day, note }) }); if (r.ok) { setErr(""); setNote(""); load(); } else setErr(msg(r.d)); }
  async function del(x: string) { await call("/api/owner/blocks", { method: "DELETE", headers: H, body: JSON.stringify({ id: x }) }); load(); }
  return <><h3>Closed days</h3>
    {rows.map((b) => <div key={b.id} className="line"><span>{b.kind === "DATE" ? new Date(b.on_date + "T00:00").toLocaleDateString() : "Every " + DAYS[b.weekday]}{b.note && <small style={{ opacity: .7 }}> · {b.note}</small>}</span><Btn l="Remove" alt fn={() => del(b.id)} /></div>)}
    {!rows.length && <small style={{ opacity: .7 }}>Open every day. Already-accepted bookings are not cancelled by a new closure.</small>}
    <div className="row"><select value={kind} onChange={(e) => setKind(e.target.value)}><option value="WEEKDAY">Every week on…</option><option value="DATE">One date</option></select>
      {kind === "WEEKDAY" ? <select value={day} onChange={(e) => setDay(+e.target.value)}>{DAYS.map((x, i) => <option key={x} value={i}>{x}</option>)}</select> : <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />}
      <input placeholder="Reason (optional)" value={note} maxLength={120} onChange={(e) => setNote(e.target.value)} /><Btn l="Close it" off={kind === "DATE" && !date} fn={add} /></div>{err && <p>{err}</p>}</>;
}
function Editor({ init, onClose, onSaved }: { init: any; onClose: () => void; onSaved: (m: string) => void }) {
  const [f, setF] = useState(init ? { name: init.name, sportType: init.sport_type, address: init.address, aliases: init.aliases ?? "", priceNuPerHour: String(init.price_nu_per_hour), bankDetails: "", lat: String(init.lat), lng: String(init.lng) } : E);
  const [saving, setSaving] = useState(false), [err, setErr] = useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const has = f.lat !== "" && f.lng !== "" && !isNaN(+f.lat) && !isNaN(+f.lng);
  const here = () => navigator.geolocation.getCurrentPosition((p) => setF((x) => ({ ...x, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })), () => setErr("Location is blocked in your browser."));
  const ok = f.name.length > 1 && f.address.length > 2 && +f.priceNuPerHour > 0 && has && (init || f.bankDetails.length > 3);
  async function save() {
    if (saving) return; setSaving(true); setErr("");
    const body = { ...f, priceNuPerHour: +f.priceNuPerHour, lat: +f.lat, lng: +f.lng, aliases: f.aliases || undefined, bankDetails: f.bankDetails || undefined };
    const r = await call("/api/owner/facilities", { method: init ? "PUT" : "POST", headers: H, body: JSON.stringify(init ? { ...body, id: init.id } : body) });
    setSaving(false); r.ok ? onSaved(init && r.d.approval === "PENDING" ? "Saved. Your changes need admin approval before players see them." : "Saved.") : setErr(msg(r.d));
  }
  return <Full title={init ? "Edit facility" : "Add facility"} onClose={onClose}
    left={<>
      <label>Name</label><input value={f.name} onChange={set("name")} style={{ width: "100%" }} />
      <div className="row"><select value={f.sportType} onChange={set("sportType")}>{SPORTS.map((s) => <option key={s}>{s}</option>)}</select><input type="number" placeholder="Nu per hour" value={f.priceNuPerHour} onChange={set("priceNuPerHour")} /></div>
      <label>Address</label><input value={f.address} onChange={set("address")} style={{ width: "100%" }} />
      <label>Other names people use (comma separated, helps search)</label><input value={f.aliases} onChange={set("aliases")} placeholder="e.g. CST ground, college field" style={{ width: "100%" }} />
      <label>Bank account / QR info {init && "(leave blank to keep the current one)"}</label><textarea rows={3} value={f.bankDetails} onChange={set("bankDetails")} style={{ width: "100%" }} />
      <p style={{ opacity: .8 }}>Pin: {has ? `${(+f.lat).toFixed(5)}, ${(+f.lng).toFixed(5)}` : "not set. Click the map or use your location."}</p>
      <div className="row"><Btn l="Use my location" alt fn={here} /></div>
      {init && <small style={{ opacity: .7 }}>Changing the name, address, sport or moving the pin sends this facility back for admin approval.</small>}
      <p><button className="btn" disabled={!ok || saving} onClick={save}>{saving ? "Saving…" : init ? "Save changes" : "Save facility"}</button></p>{err && <p>{err}</p>}</>}
    right={<><b>Click the map to drop the pin</b><MapView center={has ? { lat: +f.lat, lng: +f.lng } : { lat: 27.4728, lng: 89.639 }} zoom={has ? 16 : 9} marker={has ? { lat: +f.lat, lng: +f.lng } : null} onPick={(p) => setF((x) => ({ ...x, lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) }))} height="min(70vh, 640px)" /></>} />;
}
export default function Facilities() {
  const [rows, setRows] = useState<any[]>([]), [fi, setFi] = useState(0), [q, setQ] = useState(""), [sel, setSel] = useState<any>(null), [edit, setEdit] = useState<any>(undefined), [note, setNote] = useState("");
  const load = () => call("/api/owner/facilities").then((r) => r.ok && setRows(r.d.items));
  useEffect(() => { load(); }, []);
  async function toggle(x: any) { const r = await call("/api/owner/facilities", { method: "PATCH", headers: H, body: JSON.stringify({ id: x.id, isActive: !x.is_active }) }); if (!r.ok) setNote(msg(r.d)); setSel(null); load(); }
  const shown = rows.filter((x) => FL[fi][1](x) && JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  return (<div>
    <div className="row" style={{ justifyContent: "space-between" }}><h1 className="disp" style={{ fontSize: 24 }}>Facilities</h1><button className="btn" onClick={() => { setEdit(null); setNote(""); }}>+ Add facility</button></div>
    <input placeholder="Search facilities…" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: "100%", maxWidth: 420 }} />
    <Filters items={FL.map((x) => x[0])} i={fi} set={setFi} />{note && <p>{note}</p>}
    <div style={{ overflowX: "auto" }}><table className="dt"><tbody>{shown.map((x) => (
      <tr key={x.id} className="click" onClick={() => setSel(x)}><td><b>{x.name}</b><br /><small style={{ opacity: .7 }}>{x.address}</small></td><td>{x.sport_type}</td><td>Nu {x.price_nu_per_hour}/hr</td><td><Pill t={status(x)} /></td></tr>))}</tbody></table></div>
    {!shown.length && <p style={{ opacity: .7 }}>No facilities here. You can add as many as you like.</p>}
    {sel && <Drawer onClose={() => setSel(null)}><h2>{sel.name}</h2><Pill t={status(sel)} /><p>{sel.sport_type} · Nu {sel.price_nu_per_hour}/hr<br />{sel.address}{sel.aliases && <><br /><small>Also known as: {sel.aliases}</small></>}</p>
      {sel.lat != null && <Loc lat={sel.lat} lng={sel.lng} />}
      <p><Btn l="Edit details" fn={() => { setEdit(sel); setSel(null); }} />{sel.approval_status === "APPROVED" && <Btn l={sel.is_active ? "Hide from players" : "Show to players"} alt fn={() => toggle(sel)} />}</p>
      {sel.approval_status === "PENDING" && <p>Waiting for admin approval.</p>}<Closures id={sel.id} /></Drawer>}
    {edit !== undefined && <Editor init={edit} onClose={() => setEdit(undefined)} onSaved={(m) => { setEdit(undefined); setNote(m); load(); }} />}
  </div>);
}
