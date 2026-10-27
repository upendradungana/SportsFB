import { Suspense } from "react"; import Tabs from "@/components/Tabs"; import { pageUser } from "@/lib/pageGuard"; import { Av } from "@/components/ui";
const T: Record<string, string[][]> = {
  PLAYER: [["/play", "Discover", "◎"], ["/bookings", "My bookings", "▤"], ["/settings", "Settings", "⚙"]],
  OWNER: [["/owner", "Overview", "▦"], ["/owner/requests", "Requests", "✉"], ["/owner/facilities", "Facilities", "⌂"], ["/settings", "Settings", "⚙"]],
  ADMIN: [["/admin", "Dashboard", "▦"], ["/admin?tab=owners", "Owners", "◉"], ["/admin?tab=facilities", "Approvals", "✔"], ["/admin?tab=subscriptions", "Subscriptions", "⏱"], ["/admin?tab=users", "Users", "☰"], ["/admin?tab=audit", "Audit log", "≣"], ["/settings", "Settings", "⚙"]],
};
const TH: Record<string, string> = { PLAYER: "ply", OWNER: "own", ADMIN: "adm" };
export default async function Shell({ children }: { children: React.ReactNode }) {
  const u = await pageUser();
  return (
    <div className={`aw ${TH[u.role]}`}>
      <aside><div className="logo grad disp" style={{ fontSize: 18, padding: "8px 12px 16px" }}>SportsFB</div><Suspense><Tabs tabs={T[u.role]} /></Suspense></aside>
      <div style={{ minWidth: 0 }}>
        <div className="atop"><span className="badge">{u.role}</span><span className="sp" /><Av s={u.image} n={u.name} /><b>{u.name || u.email}</b><a href="/signout">Logout</a></div>
        <div className="amain">{children}</div>
      </div>
    </div>
  );
}
