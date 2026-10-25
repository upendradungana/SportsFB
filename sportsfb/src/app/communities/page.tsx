"use client";

import Link from "next/link";
import { communities, useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

export default function CommunitiesPage() {
  const { joined, toggleJoin } = useSports();
  return <PageFrame title="Communities" eyebrow="FANS MAKE THE GAME" description="Join the groups that make every match, milestone, and hot take more fun.">
    <section className="communities-banner"><div><span className="eyebrow">YOUR PEOPLE ARE HERE</span><h2>Pick a side.<br />Find your crowd.</h2><p>Join a community and make the conversation yours.</p></div><span className="communities-banner-mark">◎</span></section>
    <div className="page-section-heading"><div><span className="eyebrow">ALL COMMUNITIES</span><h2>Choose your corner</h2></div><span className="result-count">{communities.length} groups</span></div>
    <div className="community-directory">{communities.map((community) => { const isJoined = joined.includes(community.slug); return <article className="directory-card" key={community.slug}><div className={`community-mark ${community.color}`}>{community.mark}</div><div className="directory-details"><div className="directory-title"><h3>{community.name}</h3><span className="community-tag">{community.tag}</span></div><p>{community.description}</p><span className="community-members">{community.members} · {community.online} online now</span></div><div className="directory-actions"><button className={isJoined ? "joined" : "join-button"} onClick={() => toggleJoin(community.slug)}>{isJoined ? "Joined ✓" : "Join"}</button><Link href={`/communities/${community.slug}`}>Open →</Link></div></article>; })}</div>
  </PageFrame>;
}
