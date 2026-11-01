import { Suspense } from "react"; import Tabs from "@/components/Tabs"; import Bell from "@/components/Bell"; import { pageUser } from "@/lib/pageGuard"; import { Av } from "@/components/ui";
const T: Record<string, string[][]> = {
  PLAYER: [["/overview", "Overview", "▦"], ["/play", "Discover", "◎"], ["/bookings", "My bookings", "▤"], ["/feedback", "Feedback", "✎"], ["/settings", "Settings", "⚙"]],
  OWNER: [["/owner", "Overview", "▦"], ["/owner/requests", "Requests", "✉"], ["/owner/facilities", "Facilities", "⌂"], ["/owner/plan", "Plan", "★"], ["/feedback", "Feedback", "✎"], ["/settings", "Settings", "⚙"]],
  ADMIN: [["/admin", "Dashboard", "▦"], ["/admin?tab=owners", "Owners", "◉"], ["/admin?tab=facilities", "Approvals", "✔"], ["/admin?tab=subscriptions", "Subscriptions", "⏱"], ["/admin?tab=payments", "Plan payments", "₦"], ["/admin?tab=users", "Users", "☰"], ["/admin?tab=feedback", "Feedback", "✎"], ["/admin?tab=audit", "Audit log", "≣"], ["/settings", "Settings", "⚙"]],
};
export default async function Shell({ children }: { children: React.ReactNode }) {
  const u = await pageUser();
  return (
    <div className="aw">
      <aside><Suspense><Tabs tabs={T[u.role]} /></Suspense></aside>
      <div style={{ minWidth: 0 }}>
        <div className="atop"><span className="badge">{u.role}</span><span className="sp" /><Bell /><Av s={u.image} n={u.name} /><b>{u.name || u.email}</b><a href="/signout">Logout</a></div>
        <div className="amain">{children}</div>
      </div>
    </div>
  );
}
