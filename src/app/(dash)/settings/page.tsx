"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client"; import { dt } from "@/components/ui";
const ua = (s: string) => `${/Edg\//.test(s) ? "Edge" : /Chrome\//.test(s) ? "Chrome" : /Firefox\//.test(s) ? "Firefox" : /Safari\//.test(s) ? "Safari" : "Browser"} on ${/Windows/.test(s) ? "Windows" : /Android/.test(s) ? "Android" : /iPhone|iPad/.test(s) ? "iOS" : /Mac OS/.test(s) ? "macOS" : /Linux/.test(s) ? "Linux" : "device"}`;
const SEC = [["profile", "Profile", "◉"], ["security", "Security", "⛨"], ["notifications", "Notifications", "🔔"], ["account", "Account management", "⚙"]];
const Locked = ({ l, v }: { l: string; v: string }) => <><label>{l} <span className="pill ok" style={{ fontSize: 10, padding: "0 8px" }}>🔒 LOCKED</span></label><input value={v} readOnly disabled /></>;
export default function Settings() {
  const [m, setM] = useState<any>(null), [logins, setLogins] = useState<any[]>([]), [bio, setBio] = useState(""), [note, setNote] = useState(""), [act, setAct] = useState("profile");
  useEffect(() => { call("/api/me").then((r) => { if (r.ok) { setM(r.d); setBio(r.d.bio ?? ""); } }); call("/api/me/logins").then((r) => r.ok && setLogins(r.d.items)); }, []);
  const patch = (b: object) => call("/api/me", { method: "PATCH", headers: H, body: JSON.stringify(b) });
  const go = (k: string) => { setAct(k); document.getElementById("s-" + k)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  async function toggle() { const v = !m.notify_plan_email; setM({ ...m, notify_plan_email: v }); const r = await patch({ notifyPlanEmail: v }); if (!r.ok) { setM({ ...m }); setNote(msg(r.d)); } }
  async function outAll() { if (confirm("Sign out on every device, including this one?")) { await call("/api/me/sessions", { method: "POST" }); location.href = "/"; } }
  async function deact() { if (!confirm("Deactivate your account? Your facilities are hidden and you are signed out. Signing in again reactivates it.")) return; const r = await call("/api/me/deactivate", { method: "POST" }); r.ok ? (location.href = "/") : setNote(msg(r.d)); }
  if (!m) return <p>Loading…</p>;
  return (<div>
    <h1 className="disp" style={{ fontSize: 24 }}>Settings</h1>
    <div className="sx"><nav className="subnav">{SEC.map(([k, l, i]) => <button key={k} className={"anav" + (act === k ? " on" : "")} onClick={() => go(k)}>{i} {l}</button>)}</nav>
      <div className="sg">
        <div className="pcard" id="s-profile"><h3>Profile settings</h3>
          <div className="row">{m.image ? <img src={m.image} alt="" referrerPolicy="no-referrer" className="ring" /> : <div className="ring">{m.name?.[0]}</div>}<small style={{ opacity: .75 }}>Your photo comes from your Google account and refreshes when you sign in.</small></div>
          <Locked l="Name" v={m.full_name ?? m.name ?? ""} /><Locked l="Email" v={m.email} />{m.role !== "ADMIN" && <Locked l="Phone" v={m.phone ?? ""} />}
          <small style={{ opacity: .7, display: "block", marginTop: 8 }}>Name, email and phone are fixed after sign-up so bookings and payments can be trusted. If one is wrong, contact an admin.</small>
          <label>Bio (you can edit this)</label><textarea rows={3} maxLength={200} value={bio} onChange={(e) => setBio(e.target.value)} />
          <div className="row"><button className="btn" onClick={async () => { const r = await patch({ bio }); setNote(r.ok ? "Bio updated." : msg(r.d)); }}>Update bio</button><small>{note}</small></div></div>
        <div className="pcard" id="s-security"><h3>Security</h3>
          <div className="line"><span>Sign-in method</span><b>Google</b></div>
          <div className="line"><span>Two-factor authentication</span>{m.role === "ADMIN" ? <span className={"pill " + (m.totp_enabled ? "ok" : "bad")}>{m.totp_enabled ? "ON" : "OFF"}</span> : <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer">Manage in Google</a>}</div>
          <h4 style={{ margin: "14px 0 4px" }}>Recent sign-ins</h4>
          {logins.map((l, i) => <div key={i} className="line"><span>{ua(l.ua ?? "")}<br /><small style={{ opacity: .7 }}>{dt(l.at)} · {l.ip}</small></span>{i === 0 && <span className="pill ok">Latest</span>}</div>)}
          {!logins.length && <small>No sign-ins recorded yet.</small>}
          <p><button className="btn" onClick={outAll}>Log out all sessions</button></p></div>
        <div style={{ display: "grid", gap: 18 }}>
          <div className="pcard" id="s-notifications"><h3>Notifications</h3>
            {m.role === "OWNER" ? <div className="line"><span>Plan expiry emails<br /><small style={{ opacity: .7 }}>Sent 7 days before your plan ends</small></span><button className={"sw" + (m.notify_plan_email ? " on" : "")} role="switch" aria-checked={m.notify_plan_email} aria-label="Plan expiry emails" onClick={toggle} /></div>
              : <small>Nothing to configure yet. In-app booking alerts are coming in the next update.</small>}</div>
          <div className="pcard" id="s-account"><h3>Account management</h3>
            {m.role !== "ADMIN" && <div className="line"><span>Fraud strikes</span><b>{m.fraud_strikes} of 2</b></div>}
            <div className="line"><span>Member since</span><b>{new Date(m.created_at).toLocaleDateString()}</b></div>
            <p><a className="btn alt" href="/api/me/export" style={{ textDecoration: "none", display: "inline-block" }}>Download my data</a></p>
            {m.role !== "ADMIN" && <button className="btn danger" onClick={deact}>Deactivate account</button>}</div>
        </div></div></div></div>);
}
