"use client";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation"; import { call, H } from "@/lib/client"; import { dt } from "@/components/ui";
export default function Notifications() {
  const [items, setItems] = useState<any[]>([]), r = useRouter();
  const load = () => call("/api/notifications").then((x) => x.ok && setItems(x.d.items));
  useEffect(() => { load(); }, []);
  const read = (id?: string) => call("/api/notifications", { method: "POST", headers: H, body: JSON.stringify({ id }) });
  return (<div><div className="row" style={{ justifyContent: "space-between" }}><h1 className="disp" style={{ fontSize: 26 }}>Notifications</h1>
    <button className="btn alt" onClick={async () => { await read(); load(); }}>Mark all read</button></div>
    {items.map((n) => <div key={n.id} className="card tilt" style={{ marginBottom: 10, cursor: n.link ? "pointer" : "default", opacity: n.read_at ? .65 : 1 }}
      onClick={async () => { if (!n.read_at) await read(n.id); if (n.link) r.push(n.link); else load(); }}>
      <b>{!n.read_at && <span style={{ color: "var(--hi)" }}>● </span>}{n.title}</b><div style={{ color: "var(--muted)" }}>{n.body}</div><small style={{ color: "var(--muted)" }}>{dt(n.created_at)}</small></div>)}
    {!items.length && <p style={{ color: "var(--muted)" }}>You are all caught up.</p>}</div>);
}
