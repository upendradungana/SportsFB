import { auth } from "@/auth"; import SignInButton from "@/components/SignInButton";
const SPORTS = [["⚽", "Football"], ["🎾", "Tennis"], ["🏐", "Volleyball"], ["🏀", "Basketball"], ["🏸", "Badminton"]];
const STEPS = [["01", "Find", "Search nearby grounds and courts with maps, prices and live availability."], ["02", "Request", "Pick a day and time. The owner reviews your request."], ["03", "Pay", "Transfer to the owner within 15 minutes and upload your receipt."], ["04", "Play", "The owner verifies the receipt and your slot is confirmed."]];
const TRUST = [["🔐", "Google-only sign-in", "No passwords to leak and no fake accounts."], ["🧾", "Receipts checked", "Re-encoded, de-duplicated and reviewed by the owner."], ["⛔", "No double bookings", "Overlaps are blocked inside the database."], ["🛡️", "Locked-down admin", "Allowlisted email plus an authenticator code."]];
const SLOTS: [string, string][] = [["16:00", "off"], ["17:00", "off"], ["18:00", "sel"], ["19:00", ""], ["20:00", ""], ["21:00", "off"]];
export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const u = (await auth())?.user as any, { error } = await searchParams;
  const ok = !!u?.id && !u.blocked, dash = !u?.onboarded ? "/onboarding" : u.role === "OWNER" ? "/owner" : u.role === "ADMIN" ? "/admin" : "/overview";
  return (<>
    <div className="heroWrap">
      <svg className="lines" viewBox="0 0 600 400" fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="2" aria-hidden><rect x="10" y="10" width="580" height="380" rx="6" /><path d="M300 10v380" /><circle cx="300" cy="200" r="60" /><rect x="10" y="110" width="90" height="180" /><rect x="500" y="110" width="90" height="180" /></svg>
      <main className="page" style={{ background: "transparent" }}><div className="hero">
        <div>
          <span className="badge">Sports facility booking</span>
          <h1 className="disp" style={{ fontSize: "clamp(44px,7vw,84px)", margin: "16px 0", lineHeight: 1 }}>Book the pitch.<br /><span style={{ color: "var(--hi)" }}>Play tonight.</span></h1>
          <p style={{ maxWidth: 500, color: "var(--muted)", fontSize: 18 }}>Football grounds, courts and more near you. See what is free, request a slot, pay by bank transfer and show up.</p>
          {error && <p style={{ color: "var(--bad)" }}>Sign-in failed. Check your connection and try again.</p>}
          <div className="row">{ok ? <a className="btn" href={dash}>{u.onboarded ? "Go to your dashboard" : "Finish setting up your profile"}</a> : <SignInButton label="Continue with Google" />}<a className="btn alt" href="#how">How it works</a></div>
        </div>
        <div className="preview" aria-hidden>
          <small style={{ color: "var(--muted)" }}>Example</small>
          <div className="row" style={{ justifyContent: "space-between" }}><b style={{ fontSize: 18 }}>Riverside Football Ground</b><span className="pill ok">FOOTBALL</span></div>
          <small style={{ color: "var(--muted)" }}>Nu 2,000 / hour · 1.2 km away</small>
          <div className="slots" style={{ margin: "14px 0" }}>{SLOTS.map(([t, c]) => <div key={t} className={"slot " + c}>{t}</div>)}</div>
          <div className="row" style={{ justifyContent: "space-between" }}><span>2 hours · <b>Nu 4,000</b></span><span className="btn">Request slot</span></div>
        </div>
      </div></main>
    </div>
    <section className="sec alt"><div className="chips">{SPORTS.map(([i, n]) => <span key={n} className="chip">{i} {n}</span>)}<span className="chip">and more</span></div></section>
    <section id="how" className="sec"><h2 className="disp" style={{ fontSize: 36, marginTop: 0 }}>How it works</h2>
      <div className="grid">{STEPS.map(([n, t, d]) => <div key={n} className="card tilt"><div className="num">{n}</div><h3>{t}</h3><p style={{ color: "var(--muted)" }}>{d}</p></div>)}</div></section>
    <section className="sec alt"><h2 className="disp" style={{ fontSize: 36, marginTop: 0 }}>Built for trust</h2>
      <div className="grid">{TRUST.map(([i, t, d]) => <div key={t} className="card"><div className="ico">{i}</div><h3>{t}</h3><p style={{ color: "var(--muted)" }}>{d}</p></div>)}</div></section>
    <section id="owners" className="sec"><div className="card" style={{ padding: 32 }}>
      <h2 className="disp" style={{ fontSize: 36, marginTop: 0 }}>Own a facility?</h2>
      <p style={{ color: "var(--muted)", maxWidth: 560 }}>List your ground or court on the free plan, approve requests, close days when you are shut, and verify payments yourself. Upgrade when you need more facilities.</p>
      {ok ? <a className="btn" href={dash}>Open your dashboard</a> : <SignInButton label="List your facility" />}</div></section>
  </>);
}
