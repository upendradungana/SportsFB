"use client";
import { useEffect, useState } from "react"; import Link from "next/link"; import { call, msg } from "@/lib/client"; import { dt, Pill } from "@/components/ui";
const STEP: Record<string, number> = { PENDING_APPROVAL: 1, PENDING_PAYMENT: 2, PENDING_VERIFICATION: 3, CONFIRMED: 4 }, LABELS = ["Requested", "Approved", "Receipt sent", "Confirmed"];
function Left({ to }: { to: string }) {
  const [s, setS] = useState(0);
  useEffect(() => { const t = () => setS(Math.max(0, Math.floor((new Date(to).getTime() - Date.now()) / 1000))); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [to]);
  return <b style={{ color: s < 120 ? "var(--bad)" : "var(--warn)" }}>{Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}</b>;
}
const Copy = ({ v }: { v: string }) => <button className="copy" onClick={() => navigator.clipboard?.writeText(v)}>Copy</button>;
function Pay({ b, done }: { b: any; done: () => void }) {
  const [info, setInfo] = useState<any>(null), [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState("");
  useEffect(() => { call(`/api/bookings/${b.id}/bank-details`).then((r) => setInfo(r.ok ? r.d : { gone: true })); }, [b.id]);
  async function up() { if (!file) return; setBusy(true); const fd = new FormData(); fd.set("bookingId", b.id); fd.set("file", file); const r = await call("/api/payments/upload-proof", { method: "POST", body: fd }); setBusy(false); r.ok ? done() : setErr(msg(r.d)); }
  if (!info) return <p>Loading payment details…</p>; if (info.gone) return <p style={{ color: "var(--bad)" }}>The payment window has closed.</p>;
  return (<div className="card" style={{ background: "var(--row)", marginTop: 12 }}>
    <div className="line"><span>Pay within</span><Left to={info.deadline} /></div>
    <div className="line"><span>Amount</span><span><b style={{ fontSize: 20 }}>Nu {info.amount ?? "-"}</b> {info.amount != null && <Copy v={String(info.amount)} />}</span></div>
    <div className="line"><span>Reference (put it in the transfer remarks)</span><span><b>{info.ref}</b> <Copy v={info.ref} /></span></div>
    <label className="lbl">Transfer to</label><pre style={{ whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>{info.bankDetails}</pre><Copy v={info.bankDetails} />
    <label className="lbl">Upload your payment screenshot (JPG, PNG or WebP, max 4 MB)</label>
    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
    {file && <img src={URL.createObjectURL(file)} alt="Receipt preview" style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 10, marginTop: 8 }} />}
    {err && <p style={{ color: "var(--bad)" }}>{err}</p>}<p><button className="btn" disabled={!file || busy} onClick={up}>{busy ? "Uploading…" : "Send receipt"}</button></p></div>);
}
export default function Bookings() {
  const [items, setItems] = useState<any[] | null>(null);
  const load = () => call("/api/bookings/mine").then((r) => r.ok && setItems(r.d.items));
  useEffect(() => { load(); const i = setInterval(() => !document.hidden && load(), 45000); return () => clearInterval(i); }, []);
  const live = (items ?? []).filter((b) => STEP[b.status]), past = (items ?? []).filter((b) => !STEP[b.status]);
  const card = (b: any) => { const s = STEP[b.status] ?? 0; return (
    <div key={b.id} className="card"><div className="row" style={{ justifyContent: "space-between", margin: 0 }}><h3 style={{ margin: 0 }}>{b.name}</h3><Pill t={b.status} /></div>
      <p style={{ color: "var(--muted)", margin: "4px 0" }}>{dt(b.start_time)} to {new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {b.amount_nu != null ? `Nu ${b.amount_nu}` : ""} · Ref {b.ref}</p>
      {s > 0 && <><div className="steps">{LABELS.map((l, i) => <i key={l} className={i < s ? "on" : ""} />)}</div><div className="stl">{LABELS.map((l) => <span key={l}>{l}</span>)}</div></>}
      {b.status === "PENDING_PAYMENT" && <Pay b={b} done={load} />}
      {b.status === "PENDING_VERIFICATION" && <p style={{ color: "var(--muted)" }}>Receipt sent. The owner is checking it.</p>}</div>); };
  return (<div><h1 className="disp" style={{ fontSize: 26 }}>My bookings</h1>
    {items && !items.length && <p>No bookings yet. <Link href="/play" style={{ color: "var(--hi)" }}>Find a pitch</Link></p>}
    <div style={{ display: "grid", gap: 14, maxWidth: 760 }}>{live.map(card)}</div>
    {past.length > 0 && <><h3 style={{ marginTop: 28 }}>Past and closed</h3><div style={{ display: "grid", gap: 14, maxWidth: 760, opacity: .8 }}>{past.map(card)}</div></>}</div>);
}
