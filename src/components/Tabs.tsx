"use client";
import Link from "next/link"; import { usePathname, useSearchParams } from "next/navigation";
export default function Tabs({ tabs }: { tabs: string[][] }) {
  const p = usePathname(), t = useSearchParams().get("tab"), cur = p + (t ? `?tab=${t}` : "");
  const best = tabs.map((x) => x[0]).filter((h) => h === cur || (!h.includes("?") && (p === h || p.startsWith(h + "/")))).sort((a, b) => b.length - a.length)[0];
  return <nav className="tabs">{tabs.map(([h, l, i]) => <Link key={h} href={h} className={"anav" + (h === best ? " on" : "")}>{i} {l}</Link>)}</nav>;
}
