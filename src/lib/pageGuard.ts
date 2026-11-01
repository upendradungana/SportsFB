import { cookies } from "next/headers"; import { redirect } from "next/navigation";
import { auth } from "@/auth"; import { mfaValid } from "@/lib/totp"; import type { Role } from "@/lib/guard";
export async function pageUser(role?: Role) {
  const u = (await auth())?.user as any;
  if (!u?.id || u.blocked) redirect("/");
  if (!u.onboarded) redirect("/onboarding");
  if (role && u.role !== role) redirect("/");
  return u as { id: string; name?: string; email: string; image?: string; role: Role };
}
export async function adminPage() {
  const u = await pageUser("ADMIN");
  if (!mfaValid((await cookies()).get("admin_mfa")?.value, u.id)) redirect("/admin/2fa");
  return u;
}
