"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { communities, useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

const sports = ["All sports", "Basketball", "Football", "Running", "Tennis", "Combat", "Golf"];

export default function ExplorePage() {
  const [sport, setSport] = useState("All sports");
  const [query, setQuery] = useState("");
  const { joined, toggleJoin, following, toggleFollow } = useSports();
  const visible = useMemo(() => communities.filter((community) => (sport === "All sports" || community.tag === sport) && `${community.name} ${community.tag} ${community.description}`.toLowerCase().includes(query.trim().toLowerCase())), [sport, query]);

  return <PageFrame title="Explore" eyebrow="FIND YOUR PEOPLE" description="Discover the fan groups, athletes, and conversations you want in your feed.">
    <section className="explore-hero"><span className="welcome-kicker"><span>✳</span> THERE’S A SEAT FOR YOU</span><h2>Find your kind<br />of sports people.</h2><p>From courtside debates to first finish lines, your community is out there.</p><label className="explore-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search communities or sports" aria-label="Search communities" /></label></section>
    <div className="filter-chips" aria-label="Filter communities by sport">{sports.map((item) => <button className={sport === item ? "active" : ""} key={item} onClick={() => setSport(item)}>{item}</button>)}</div>
    <div className="page-section-heading"><div><span className="eyebrow">COMMUNITIES</span><h2>Good game. Great company.</h2></div><span className="result-count">{visible.length} groups</span></div>
    {visible.length ? <div className="explore-grid">{visible.map((community) => { const isJoined = joined.includes(community.slug); return <article className="explore-card" key={community.slug}><div className={`explore-card-art ${community.color}`}><span className="community-mark">{community.mark}</span><span className="art-spark">✳</span><span className="community-tag">{community.tag}</span></div><div className="explore-card-content"><div className="explore-card-title"><div><h3>{community.name}</h3><span>{community.members} · {community.online} online</span></div><span className="online-dot" /></div><p>{community.description}</p><div className="explore-card-actions"><button className={isJoined ? "joined" : "join-button"} onClick={() => toggleJoin(community.slug)}>{isJoined ? "Joined ✓" : "Join community"}</button><Link href={`/communities/${community.slug}`} aria-label={`View ${community.name}`}>View group →</Link></div></div></article>; })}</div> : <div className="empty-state"><strong>No communities match that search.</strong><p>Try a different sport or search term.</p><button onClick={() => { setQuery(""); setSport("All sports"); }}>Clear filters</button></div>}
    <section className="suggested-fans"><div className="page-section-heading"><div><span className="eyebrow">GOOD PEOPLE, GREAT TAKES</span><h2>Fans to follow</h2></div></div><div className="suggested-fan-grid"><article className="suggested-fan"><span className="avatar avatar-coral">MR</span><div><strong>Maya Rios</strong><span>@mayarios · Basketball</span></div><button className={following.includes("mayarios") ? "follow-button following" : "follow-button"} onClick={() => toggleFollow("mayarios")}>{following.includes("mayarios") ? "✓" : "+"}</button></article><article className="suggested-fan"><span className="avatar avatar-blue">JL</span><div><strong>Jordan Lee</strong><span>@jlee_runs · Running</span></div><button className={following.includes("jlee_runs") ? "follow-button following" : "follow-button"} onClick={() => toggleFollow("jlee_runs")}>{following.includes("jlee_runs") ? "✓" : "+"}</button></article><article className="suggested-fan"><span className="avatar avatar-violet">AP</span><div><strong>Ari Patel</strong><span>@aripatel · Football</span></div><button className={following.includes("aripatel") ? "follow-button following" : "follow-button"} onClick={() => toggleFollow("aripatel")}>{following.includes("aripatel") ? "✓" : "+"}</button></article></div></section>
  </PageFrame>;
}
