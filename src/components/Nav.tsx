import Link from "next/link"; import { auth } from "@/auth"; import SignInButton from "./SignInButton"; import HideOnScroll from "./HideOnScroll"; import { Av } from "./ui";
export default async function Nav() {
  const u = (await auth())?.user as any, ok = !!u?.id && !u.blocked;
  const dash = !u?.onboarded ? "/onboarding" : u.role === "OWNER" ? "/owner" : u.role === "ADMIN" ? "/admin" : "/play";
  return (
    <HideOnScroll><div className="in">
      <Link href="/" className="logo grad">SportsFB</Link><span className="sp" />
      {!ok && <><a href="/#how">How it works</a><a href="/#owners">For owners</a><SignInButton /></>}
      {ok && <><Link href={dash}>{u.onboarded ? "Dashboard" : "Finish setup"}</Link>
        <details className="menu"><summary aria-label="Account menu"><Av s={u.image} n={u.name} /></summary>
          <div className="mpop"><b>{u.name}</b><small>{u.email}</small><Link href={dash}>{u.onboarded ? "Dashboard" : "Finish setup"}</Link>{u.onboarded && <Link href="/settings">Settings</Link>}<Link href="/signout">Sign out</Link></div></details></>}
    </div></HideOnScroll>
  );
}
