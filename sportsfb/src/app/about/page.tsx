import Link from "next/link";
import { PageFrame } from "../page-frame";

export default function AboutPage() {
  return <PageFrame title="Sports brings us together" eyebrow="ABOUT SPORTSFB" description="A community space for every kind of fan."><div className="info-card"><span className="info-mark">✳</span><h2>More than the final score.</h2><p>SportsFB brings fans, athletes, and local communities together to share the moments that make sports matter: the build-up, the big plays, the personal milestones, and the conversations after.</p><p>This version is a working local-first demo. Your posts, follows, saved items, profile, and reminders are stored in this browser.</p><Link className="post-button info-button" href="/explore">Find your community →</Link></div></PageFrame>;
}
