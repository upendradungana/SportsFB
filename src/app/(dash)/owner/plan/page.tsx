"use client";
import { useEffect, useState } from "react"; import { call, msg } from "@/lib/client"; import { d, Full, Pill } from "@/components/ui";
export default function Plan() {
  const [p, setP] = useState<any>(null), [pick, setPick] = useState<string | null>(null), [file, setFile] = useState<File | null>(null), [busy, setBusy] = useState(false), [err, setErr] = useState(""), [ok, setOk] = useState("");
  const load = () => call("/api/owner/plan").then((r) => r.ok && setP(r.d)); useEffect(() => { load(); }, []);
  async function pay() { const fd = new FormData(); fd.set("plan", pick!); fd.set("file", file!); setBusy(true); setErr(""); const r = await call("/api/owner/plan", { method: "POST", body: fd }); setBusy(false);
    if (r.ok) { setPick(null); setFile(null); setOk("Payment sent. An admin will verify it and activate your plan."); load(); } else setErr(msg(r.d)); }
  if (!p) return <p>Loading…</p>;
  const pending = p.history.some((h: any) => h.status === "PENDING"), pl = pick ? p.plans[pick] : null;
  return (<div><h1 className="disp" style={{ fontSize: 26 }}>Plan</h1>{ok && <p style={{ color: "var(--hi)" }}>{ok}</p>}
    {!p.verified && <p style={{ color: "var(--warn)" }}>You can pick a paid plan once an admin has verified your account.</p>}
    <div className="grid">{Object.entries(p.plans).map(([k, v]: [string, any]) => <div key={k} className="card" style={k === p.plan ? { borderColor: "var(--pri)" } : {}}>
      <div className="row" style={{ justifyContent: "space-between", margin: 0 }}><h3 style={{ margin: 0 }}>{v.name}</h3>{k === p.plan && <span className="pill ok">CURRENT</span>}</div>
      <div style={{ fontSize: 28, fontWeight: 800, margin: "8px 0" }}>{v.nu ? `Nu ${v.nu}` : "Free"}<small style={{ fontSize: 13, color: "var(--muted)" }}>{v.nu ? " / 30 days" : ""}</small></div>
      <ul style={{ paddingLeft: 18, color: "var(--muted)" }}>{v.perks.map((x: string) => <li key={x}>{x}</li>)}</ul>
      {k !== "FREE" && <button className="btn" disabled={!p.verified || pending} onClick={() => { setPick(k); setErr(""); setOk(""); }}>{k === p.plan ? "Renew" : "Choose"}</button>}</div>)}</div>
    <p style={{ color: "var(--muted)" }}>Using {p.used} of {p.max > 999 ? "unlimited" : p.max} facilities.{p.expires_at && ` Current paid plan ends ${d(p.expires_at)}.`} If a paid plan lapses you return to Free and extra facilities are hidden.</p>
    <h3>Payment history</h3>{p.history.map((h: any) => <div key={h.id} className="line"><span>{h.plan} · Nu {h.amount_nu} · {d(h.created_at)}</span><Pill t={h.status} /></div>)}{!p.history.length && <small style={{ color: "var(--muted)" }}>No payments yet.</small>}
    {pick && pl && <Full title={`Upgrade to ${pl.name}`} onClose={() => setPick(null)} left={<>
      <div className="line"><span>Amount</span><b style={{ fontSize: 22 }}>Nu {pl.nu}</b></div><label className="lbl">1. Transfer to the SportsFB account</label>
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{p.bank || "Bank details are not set yet. Ask the admin."}</pre>
      <label className="lbl">2. Upload your payment screenshot (max 4 MB)</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      {err && <p style={{ color: "var(--bad)" }}>{err}</p>}<p><button className="btn" disabled={!file || busy} onClick={pay}>{busy ? "Sending…" : "Send for verification"}</button></p>
      <small style={{ color: "var(--muted)" }}>An admin checks the receipt, then activates the plan for 30 days.</small></>}
      right={file ? <img src={URL.createObjectURL(file)} alt="Receipt preview" style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: 10 }} /> : <div className="card">Your receipt preview appears here.</div>} />}</div>);
}
