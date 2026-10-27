import { adminPage } from "@/lib/pageGuard"; import Client from "./Client";
const TABS = ["overview", "owners", "facilities", "subscriptions", "users", "audit"];
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await adminPage(); const { tab } = await searchParams;
  return <Client tab={TABS.includes(tab ?? "") ? tab! : "overview"} />;
}
