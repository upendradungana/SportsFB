"use client";
import { useState } from "react"; import { call, H, msg } from "@/lib/client";
export default function Onboarding() {
  const [role, setRole] = useState("PLAYER"), [fullName, setName] = useState(""), [phone, setPhone] = useState(""), [note, setNote] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  const valid = fullName.trim().length > 1 && /^(77|17|16)\d{6}$/.test(phone);
  async function go() {
    setBusy(true); setErr("");
    const r = await call("/api/onboarding", { method: "POST", headers: H, body: JSON.stringify({ role, phone, note, fullName }) });
    if (r.ok) location.href = role === "OWNER" ? "/owner" : "/play"; else { setErr(r.d.error === "BAD_REQUEST" ? "Check your name (letters only)." : msg(r.d)); setBusy(false); }
  }
  const Card = ({ k, icon, t }: { k: string; icon: string; t: string }) => <button type="button" onClick={() => setRole(k)} className={"rolecard" + (role === k ? " on" : "")}><span style={{ fontSize: 40 }}>{icon}</span><b>{t}</b></button>;
  return (
    <main className="set1 page glow"><div className="card onb">
      <small style={{ opacity: .8 }}>Step 1 of 2: Create account</small><div className="bar"><i style={{ width: "50%" }} /></div>
      <h1 className="grad" style={{ fontSize: 30, margin: "12px 0 4px" }}>Create your SportsFB profile</h1><p style={{ opacity: .8, marginTop: 0 }}>Confirm your role and add your profile details.</p>
      <div className="row" style={{ flexWrap: "nowrap" }}><Card k="PLAYER" icon="🏃" t="I'm a player" /><Card k="OWNER" icon="🏟️" t="I own a facility" /></div>
      <label>Full name</label><input value={fullName} maxLength={80} placeholder="e.g., Alex Rivers" onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
      <label>Phone</label><div className="row" style={{ flexWrap: "nowrap", margin: 0 }}><b style={{ whiteSpace: "nowrap" }}>🇧🇹 +975</b><input value={phone} inputMode="numeric" maxLength={8} placeholder="17XXXXXX" onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} style={{ flex: 1 }} /></div>
      {role === "OWNER" && <><label>About your facility (helps the admin verify you)</label><textarea rows={3} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} style={{ width: "100%" }} /></>}
      {err && <p style={{ color: "var(--acc)" }}>{err}</p>}
      <button className="btn" disabled={!valid || busy} onClick={go} style={{ width: "100%", marginTop: 16 }}>{busy ? "Saving…" : "Confirm and continue"}</button>
      <div className="notice">ⓘ Your name, email and phone can't be changed later, and neither can your role. {role === "OWNER" ? "Step 2: an admin verifies you before your facilities go live." : "Owners go live after admin verification."}</div>
    </div></main>
  );
}
