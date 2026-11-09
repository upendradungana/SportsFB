"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [hover, setHover] = useState(false);

  return (
    <footer className="foot">
      <div className="fcta"><div><b>Got feedback or a complaint?</b><br /><small>Tell the SportsFB team what to fix or improve. Admins read every message.</small></div><Link className="btn" href="/feedback" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ color: hover ? "#fff" : "#181717", padding: "12px 24px" }}>Send feedback</Link></div>
      <div className="cols">
        <div><Link href="/" className="logo" style={{ padding: 0 }}>SportsFB</Link><p><small>Sports facility booking for players and facility owners in Bhutan.</small></p></div>
        <div><h4>Players</h4><Link href="/overview">Dashboard</Link><Link href="/play">Find a pitch</Link><Link href="/bookings">My bookings</Link></div>
        <div><h4>Owners</h4><Link href="/owner">Dashboard</Link><Link href="/owner/facilities">Facilities</Link><Link href="/owner/plan">Plans</Link></div>
        <div><h4>Support</h4><Link href="/feedback">Feedback & complaints</Link><Link href="/legal/privacy">Privacy policy</Link><Link href="/legal/terms">Terms of use</Link></div>
      </div>
      <small>© {new Date().getFullYear()} SportsFB</small>
    </footer>
  );
}