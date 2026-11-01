"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client";
export default function TwoFA() {
  const [enrolled, setEnrolled] = useState<boolean | null>(null), [qr, setQr] = useState(""), [secret, setSecret] = useState(""), [code, setCode] = useState(""), [err, setErr] = useState("");
  useEffect(() => { call("/api/admin/totp").then(async (r) => {
    if (!r.ok) return setErr(msg(r.d)); setEnrolled(r.d.enrolled);
    if (!r.d.enrolled) { const s = await call("/api/admin/totp", { method: "POST", headers: H, body: JSON.stringify({ action: "setup" }) }); if (s.ok) { setQr(s.d.qr); setSecret(s.d.secret); } }
  }); }, []);
  async function go() { const r = await call("/api/admin/totp", { method: "POST", headers: H, body: JSON.stringify({ action: "verify", code }) }); r.ok ? (location.href = "/admin") : setErr(r.d.error === "BAD_CODE" ? "Wrong code." : msg(r.d)); }
  return (
    <main className="page"><div className="card" style={{ maxWidth: 420 }}>
      <h2>Two-factor authentication</h2>
      {enrolled === false && <><p>Scan with an authenticator app, then enter the 6-digit code.</p>{qr && <img src={qr} alt="2FA QR code" width={200} height={200} />}<p><small>Manual key: {secret}</small></p></>}
      <div className="row"><input inputMode="numeric" maxLength={6} placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /><button className="btn" onClick={go}>Verify</button></div>
      {err && <p>{err}</p>}
    </div></main>
  );
}
