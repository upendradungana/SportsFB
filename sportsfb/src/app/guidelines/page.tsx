import { PageFrame } from "../page-frame";

const guidelines = [
  ["Respect the people behind the jerseys.", "Debate plays and decisions without targeting someone with abuse or harassment."],
  ["Keep it about the game.", "Share useful context, credit original work, and avoid spam or misleading claims."],
  ["Make room for every fan.", "Welcome different teams, backgrounds, experience levels, and ways of enjoying sports."],
  ["Protect personal information.", "Don’t post another person’s private details or ask others to reveal theirs."],
];

export default function GuidelinesPage() {
  return <PageFrame title="Community guidelines" eyebrow="PLAY FAIR, ONLINE TOO" description="The best sports communities make room for good competition and good people."><div className="guideline-list">{guidelines.map(([title, detail], index) => <article className="guideline-card" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{title}</h2><p>{detail}</p></div></article>)}</div></PageFrame>;
}
