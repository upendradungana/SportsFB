import { auth, signOut } from "@/auth"; import { redirect } from "next/navigation"; import Link from "next/link";
export default async function SignOutPage() {
  const u = (await auth())?.user as any; if (!u?.id) redirect("/");
  return (
    <main className="set1 page glow" style={{ display: "grid", placeItems: "center" }}>
      <div className="card tilt" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div className="ico" style={{ margin: "0 auto 12px" }}>👋</div>
        <h2 className="grad disp" style={{ fontSize: 22 }}>Leaving already?</h2>
        <p style={{ opacity: .8 }}>You're signed in as {u.email}. Signing out ends your session on this device.</p>
        <div className="row" style={{ justifyContent: "center" }}>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="btn" type="submit">Sign out</button></form>
          <Link className="btn alt" href="/" style={{ textDecoration: "none" }}>Stay signed in</Link>
        </div>
      </div>
    </main>
  );
}
