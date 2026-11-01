"use client";
import { useEffect, useState } from "react"; import { call, H, msg } from "@/lib/client"; import { d, Pill } from "@/components/ui";
export default function Feedback() {
  const [kind, setKind] = useState("FEEDBACK"), [subject, setSubject] = useState(""), [message, setMessage] = useState(""), [note, setNote] = useState(""), [busy, setBusy] = useState(false), [mine, setMine] = useState<any[]>([]);
  const load = () => call("/api/feedback").then((r) => r.ok && setMine(r.d.items));
  useEffect(() => { load(); }, []);
  async function send() { setBusy(true); const r = await call("/api/feedback", { method: "POST", headers: H, body: JSON.stringify({ kind, subject, message }) }); setBusy(false);
    if (r.ok) { setSubject(""); setMessage(""); setNote("Sent. Thank you, an admin will review it."); load(); } else setNote(r.d.error === "BAD_REQUEST" ? "Add a subject (3+ characters) and a message (10+ characters)." : msg(r.d)); }
  return (<div style={{ maxWidth: 640 }}><h1 className="disp" style={{ fontSize: 26 }}>Feedback & complaints</h1>
    <div className="card"><div className="row">{["FEEDBACK", "COMPLAINT"].map((k) => <button key={k} className={k === kind ? "btn" : "btn alt"} onClick={() => setKind(k)}>{k === "FEEDBACK" ? "Feedback" : "Complaint"}</button>)}</div>
      <label className="lbl">Subject</label><input value={subject} maxLength={120} onChange={(e) => setSubject(e.target.value)} style={{ width: "100%" }} />
      <label className="lbl">Message</label><textarea rows={6} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: "100%" }} />
      <p><button className="btn" disabled={busy} onClick={send}>{busy ? "Sending…" : "Send"}</button> <small>{note}</small></p></div>
    {mine.length > 0 && <><h3>Your messages</h3>{mine.map((m) => <div key={m.id} className="line"><span>{m.subject}<br /><small style={{ color: "var(--muted)" }}>{d(m.created_at)}</small></span><Pill t={m.status} /></div>)}</>}</div>);
}
