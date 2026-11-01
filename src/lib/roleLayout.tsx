import { pageUser } from "./pageGuard"; import type { Role } from "./guard";
export const roleLayout = (r: Role) => async function RoleLayout({ children }: { children: React.ReactNode }) { await pageUser(r); return <>{children}</>; };
