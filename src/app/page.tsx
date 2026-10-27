import { auth } from "@/auth"; import { redirect } from "next/navigation"; import SignInButton from "@/components/SignInButton";
const SPORTS = [["⚽", "Football"], ["🎾", "Tennis"], ["🏐", "Volleyball"], ["🏀", "Basketball"], ["🏸", "Badminton"]];
const STEPS = [["01", "Find a facility", "Search nearest first.", "set2"], ["02", "Request a slot", "Pick a time. The owner gets your request.", "set3"], ["03", "Pay in 15 minutes", "Transfer to the owner and upload your receipt.", "set1"], ["04", "Play", "The owner verifies your receipt and confirms.", "set2"]];
const TRUST = [["🔐", "Google-only sign-in", "No passwords to leak and no fake accounts."], ["🧾", "Receipts checked", "Re-encoded, de-duplicated and reviewed by the owner."], ["⛔", "No double bookings", "Overlaps are blocked inside the database."], ["🛡️", "Locked-down admin", "Allowlisted email plus an authenticator code."]];
export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const u = (await auth())?.user as any, { error } = await searchParams;
  const ok = !!u?.id && !u.blocked, dash = !u?.onboarded ? "/onboarding" : u.role === "OWNER" ? "/owner" : u.role === "ADMIN" ? "/admin" : "/play";
  return (<>
    <main className="set1 page glow"><div className="hero">
      <div>
        <span className="badge">Sports facility booking</span>
        <h1 className="grad disp" style={{ fontSize: "clamp(30px,5vw,60px)", margin: "16px 0", lineHeight: 1.05 }}>Book your pitch.<br />Play tonight.</h1>
        <p style={{ maxWidth: 480, opacity: .85, fontSize: 18 }}>Football grounds, courts and more near you. Request a slot, pay by bank transfer, show up and play.</p>
        {error && <p style={{ color: "var(--acc)" }}>Sign-in failed. Check your connection and try again.</p>}
        <div className="row">{ok ? <a className="btn" href={dash} style={{ textDecoration: "none" }}>{u.onboarded ? "Go to your dashboard" : "Finish setting up your profile"}</a> : <SignInButton label="Continue with Google" />}<a className="btn alt" href="#how" style={{ textDecoration: "none" }}>How it works</a></div>
      </div>
      <div className="stage" aria-hidden><div className="pitch"><div className="ball" /></div></div>
    </div></main>
    <section className="band mocha"><h2 className="serif" style={{ marginTop: 0 }}>Every sport, one place</h2>
      <div className="grid">{SPORTS.map(([i, n]) => <div key={n} className="card tilt" style={{ textAlign: "center" }}><div style={{ fontSize: 44 }}>{i}</div><b>{n}</b></div>)}</div></section>
    <section id="how" className="band set1 glow"><h2 className="grad disp" style={{ marginTop: 0, fontSize: 32 }}>How it works</h2>
      <div className="grid">{STEPS.map(([n, t, d, s]) => <div key={n} className={`card tilt ${s}`}><div className="num" style={{ fontSize: 30, fontWeight: 800, color: s === "set1" ? "#FF2D95" : s === "set2" ? "#3A0F34" : "#6F4E37" }}>{n}</div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section className="band set2"><h2 className="edit" data-t="Built for trust" style={{ marginTop: 0 }}>Built for trust</h2>
      <div className="grid">{TRUST.map(([i, t, d]) => <div key={t} className="card tilt"><div className="ico">{i}</div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
    <section id="owners" className="band set1 glow" style={{ textAlign: "center" }}>
      <h2 className="grad bigcta">Own a facility?</h2>
      <p style={{ maxWidth: 520, margin: "0 auto 20px", opacity: .85 }}>List your ground or court, approve requests and verify payments yourself. Listings go live after admin verification.</p>
      <div style={{ display: "inline-block" }}>{ok ? <a className="btn" href={dash} style={{ textDecoration: "none" }}>Open your dashboard</a> : <SignInButton label="List your facility" />}</div></section>
  </>);
}
