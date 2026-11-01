import { cookies } from "next/headers";
import { auth, dropAuthCache } from "@/auth";
import { mfaValid } from "@/lib/totp";

export class HttpError extends Error { constructor(public status: number, m: string) { super(m); } }
export type Role = "PLAYER" | "OWNER" | "ADMIN";

export async function requireRole(role: Role) {
  const u = (await auth())?.user as any;
  if (!u?.id || u.blocked) throw new HttpError(401, "UNAUTHENTICATED");
  if (u.role !== role) throw new HttpError(403, "FORBIDDEN");
  if (role === "ADMIN" && !mfaValid((await cookies()).get("admin_mfa")?.value, u.id)) throw new HttpError(403, "MFA_REQUIRED");
  return { id: u.id as string, email: u.email as string };
}
export const api = (fn: (req: Request, ctx: any) => Promise<Response>) => async (req: Request, ctx: any) => {
  try { const res = await fn(req, ctx); if (req.method !== "GET") dropAuthCache(); return res; }
  catch (e: any) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    if (e?.code === "23505") return Response.json({ error: "ALREADY_EXISTS" }, { status: 409 });
    if (e?.name === "ZodError") return Response.json({ error: "BAD_REQUEST" }, { status: 400 });
    console.error(e); return Response.json({ error: "INTERNAL" }, { status: 500 });
  }
};
export const fromResult = (r: { ok: boolean; error?: string } & Record<string, any>) =>
  r.ok ? Response.json(r) : Response.json({ error: r.error }, { status: r.error === "NOT_FOUND" ? 404 : 409 });
