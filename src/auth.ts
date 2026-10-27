import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { sql } from "drizzle-orm";
import { db } from "@/db"; import { headers } from "next/headers";

const admins = () => (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
const cache = new Map<string, { at: number; v: any }>();
export const dropAuthCache = () => cache.clear(); // called after any non-GET API call so locks/role changes bite at once
const load = async (email: string) => {
  const hit = cache.get(email); if (hit && Date.now() - hit.at < 15000) return hit.v;
  let err: unknown;
  for (let i = 0; i < 3; i++) { // Neon HTTP calls can fail transiently; retry instead of logging the user out
    try { const v = (await db.execute(sql`SELECT id, role, onboarded, full_name, session_version, is_locked, is_suspended FROM users WHERE email = ${email}`)).rows[0] as any; cache.set(email, { at: Date.now(), v }); return v; }
    catch (e) { err = e; await new Promise((r) => setTimeout(r, 300 * (i + 1))); }
  }
  throw err;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/", error: "/", signOut: "/signout" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  callbacks: {
    async signIn({ account, profile }) {
      const email = profile?.email?.toLowerCase();
      if (account?.provider !== "google" || !email || !profile?.email_verified) return false;
      const isAdmin = admins().includes(email);
      const up = await db.execute(sql`
        INSERT INTO users (google_sub, email, name, image, role, onboarded)
        VALUES (${account.providerAccountId}, ${email}, ${profile.name ?? null}, ${(profile as any).picture ?? null}, ${isAdmin ? "ADMIN" : "PLAYER"}, ${isAdmin})
        ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image = EXCLUDED.image,
          google_sub = COALESCE(users.google_sub, EXCLUDED.google_sub), deactivated_at = NULL,
          role = CASE WHEN ${isAdmin} THEN 'ADMIN' WHEN users.role = 'ADMIN' THEN 'PLAYER' ELSE users.role END RETURNING id, role, is_locked, is_suspended`); // allowlist is the sole authority for ADMIN
      const u = up.rows[0] as any; cache.delete(email);
      if (u.is_locked || u.is_suspended) return false;
      try { const h = await headers(); await db.execute(sql`INSERT INTO login_events (user_id, ua, ip) VALUES (${u.id}::uuid, ${(h.get("user-agent") ?? "").slice(0, 300)}, ${(h.get("x-forwarded-for") ?? "local").split(",")[0].slice(0, 64)})`); } catch {}
      return true;
    },
    async jwt({ token }) { // re-read each request: locks, role changes and "sign out everywhere" apply immediately
      const u = token.email ? await load(token.email.toLowerCase()) : null;
      if (u && token.sv === undefined) token.sv = u.session_version;
      const stale = !u || token.sv !== u.session_version;
      Object.assign(token, u ? { uid: u.id, role: u.role, onboarded: u.onboarded, name: u.full_name ?? token.name, blocked: u.is_locked || u.is_suspended || stale } : { uid: null, blocked: true });
      return token;
    },
    async session({ session, token }) { Object.assign(session.user, { id: token.uid, role: token.role, onboarded: token.onboarded, blocked: token.blocked }); return session; },
  },
});
