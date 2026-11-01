"use client";
import Link from "next/link"; import { useEffect, useState } from "react";
export default function Bell() {
  const [n, setN] = useState(0);
  useEffect(() => { const f = () => !document.hidden && fetch("/api/notifications?count=1").then((r) => r.json()).then((d) => setN(d.unread ?? 0)).catch(() => {}); f(); const i = setInterval(f, 60000); return () => clearInterval(i); }, []);
  return <Link href="/notifications" className="bell" aria-label={`Notifications${n ? `, ${n} unread` : ""}`}>🔔{n > 0 && <b className="dot">{n > 9 ? "9+" : n}</b>}</Link>;
}
