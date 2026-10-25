"use client";

import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";

type IconName =
  | "home"
  | "compass"
  | "calendar"
  | "bookmark"
  | "users"
  | "search"
  | "bell"
  | "plus"
  | "heart"
  | "message"
  | "share"
  | "arrow"
  | "more"
  | "sparkle"
  | "trophy";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  const paths: Record<IconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.5 5.1-5.1 2.5 2.5-5.1 5.1-2.5Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 10.2-8.8 10.2S3.2 14 3.2 8.8a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9Z" />,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" /></>,
    share: <><path d="M12 15V3m-5 5 5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" /></>,
    trophy: <><path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4" /></>,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

type Post = {
  id: number;
  name: string;
  handle: string;
  initials: string;
  avatar: string;
  time: string;
  sport: string;
  body: string;
  likes: number;
  replies: number;
  image?: "court" | "stadium";
};

const initialPosts: Post[] = [
  {
    id: 1,
    name: "Maya Rios",
    handle: "mayarios",
    initials: "MR",
    avatar: "avatar-coral",
    time: "18 min ago",
    sport: "Basketball",
    body: "That fourth-quarter run was unreal. The whole arena felt like it was shaking 🏀",
    likes: 248,
    replies: 32,
    image: "court",
  },
  {
    id: 2,
    name: "Jordan Lee",
    handle: "jlee_runs",
    initials: "JL",
    avatar: "avatar-blue",
    time: "1 hr ago",
    sport: "Running",
    body: "First 10K in the books. Shoutout to everyone in the Saturday Miles crew who kept me moving when my legs had other plans. What a morning. 🏁",
    likes: 86,
    replies: 14,
  },
  {
    id: 3,
    name: "Ari Patel",
    handle: "aripatel",
    initials: "AP",
    avatar: "avatar-violet",
    time: "3 hrs ago",
    sport: "Football",
    body: "Sunday picks are in. I have a feeling this is the week the underdogs make some noise 👀",
    likes: 53,
    replies: 21,
    image: "stadium",
  },
];

const navItems: { label: string; icon: IconName }[] = [
  { label: "Home", icon: "home" },
  { label: "Explore", icon: "compass" },
  { label: "Schedule", icon: "calendar" },
  { label: "Saved", icon: "bookmark" },
];

const communities = [
  { name: "Courtside Club", members: "12.4k fans", tag: "Basketball", color: "community-orange", mark: "C" },
  { name: "The Touchline", members: "8.2k fans", tag: "Football", color: "community-green", mark: "T" },
  { name: "Saturday Miles", members: "4.8k fans", tag: "Running", color: "community-purple", mark: "S" },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Home");
  const [activeFilter, setActiveFilter] = useState("For you");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [posts, setPosts] = useState(initialPosts);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  const visiblePosts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch = !term || `${post.name} ${post.handle} ${post.sport} ${post.body}`.toLowerCase().includes(term);
      const matchesFollowing = activeFilter !== "Following" || following.includes(post.handle);
      return matchesSearch && matchesFollowing;
    });
  }, [activeFilter, following, posts, search]);

  function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setPosts((current) => [
      {
        id: Date.now(),
        name: "Alex Morgan",
        handle: "alexmorgan",
        initials: "AM",
        avatar: "avatar-green",
        time: "just now",
        sport: "Community",
        body,
        likes: 0,
        replies: 0,
      },
      ...current,
    ]);
    setDraft("");
    setActiveFilter("For you");
    setNotice("Your post is live in this preview.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  function toggleLike(id: number) {
    setLikedPosts((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="app-shell">
      <header className="mobile-header">
        <a className="brand" href="#top" aria-label="SportsFB home">
          <span className="brand-mark"><Icon name="trophy" size={19} /></span>
          <span>sports<span className="brand-accent">fb</span></span>
        </a>
        <button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" /><i /></button>
      </header>

      <div className="page-grid" id="top">
        <aside className="left-rail">
          <a className="brand desktop-brand" href="#top" aria-label="SportsFB home">
            <span className="brand-mark"><Icon name="trophy" size={19} /></span>
            <span>sports<span className="brand-accent">fb</span></span>
          </a>
          <div className="rail-label">YOUR SPACE</div>
          <nav className="primary-nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <button key={item.label} className={`nav-link ${activeNav === item.label ? "active" : ""}`} onClick={() => setActiveNav(item.label)}>
                <Icon name={item.icon} size={19} /><span>{item.label}</span>
                {item.label === "Schedule" && <span className="nav-count">3</span>}
              </button>
            ))}
          </nav>
          <button className="sidebar-create" onClick={() => document.getElementById("post-composer")?.focus()}>
            <span className="create-icon"><Icon name="plus" size={18} /></span> Create a post
          </button>

          <div className="rail-divider" />
          <div className="rail-section-heading"><span>YOUR COMMUNITIES</span><button aria-label="Add a community" onClick={() => setActiveNav("Explore")}><Icon name="plus" size={16} /></button></div>
          <div className="sidebar-communities">
            {communities.map((community) => (
              <button className="sidebar-community" key={community.name} onClick={() => setSearch(community.tag)}>
                <span className={`community-mark ${community.color}`}>{community.mark}</span><span>{community.name}</span>
              </button>
            ))}
          </div>
          <div className="sidebar-spacer" />
          <button className="profile-chip" onClick={() => setNotice("Profile settings are coming soon.")}>
            <span className="avatar avatar-green">AM</span><span className="profile-copy"><strong>Alex Morgan</strong><small>@alexmorgan</small></span><Icon name="more" size={19} />
          </button>
        </aside>

        <section className="feed-column" aria-label="Sports community feed">
          <div className="feed-topbar">
            <div><span className="eyebrow">YOUR SPORTS COMMUNITY</span><h1>{activeNav === "Home" ? "Your feed" : activeNav}</h1></div>
            <div className="topbar-actions">
              <label className="search-box"><Icon name="search" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search SportsFB" aria-label="Search SportsFB" />{search && <button aria-label="Clear search" onClick={() => setSearch("")}>×</button>}</label>
              <button className="icon-button desktop-notification" aria-label="Notifications"><Icon name="bell" /><i /></button>
            </div>
          </div>

          <section className="welcome-card">
            <div className="welcome-copy"><div className="welcome-kicker"><Icon name="sparkle" size={15} /> THE GAME IS BETTER TOGETHER</div><h2>Good to see you,<br /><span>Alex.</span></h2><p>Find your people. Talk your game. Be part of every moment.</p><button className="welcome-cta" onClick={() => setActiveNav("Explore")}>Find your community <Icon name="arrow" size={17} /></button></div>
            <div className="welcome-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="ball-shape"><span /><span /><span /></div><div className="art-star star-one">✳</div><div className="art-star star-two">✳</div><div className="art-label">PLAY<br />YOUR<br />PART</div></div>
          </section>

          <section className="match-card" aria-label="Featured upcoming match">
            <div className="match-header"><span className="live-pill"><i /> UP NEXT</span><span>NBA · Regular season</span><button aria-label="More match options"><Icon name="more" size={19} /></button></div>
            <div className="match-body"><div className="team-block"><span className="team-badge team-knicks">NY</span><span><strong>New York</strong><small>Knicks</small></span></div><div className="match-center"><strong>VS</strong><span>Tonight · 7:30 PM</span></div><div className="team-block team-away"><span className="team-badge team-celtics">B</span><span><strong>Boston</strong><small>Celtics</small></span></div></div>
            <div className="match-footer"><span><span className="watching-dot" /> 2.4k fans talking</span><button onClick={() => setNotice("Match conversation opened in this preview.")}>Join the conversation <Icon name="arrow" size={16} /></button></div>
          </section>

          <form className="composer-card" onSubmit={createPost}>
            <div className="composer-row"><span className="avatar avatar-green">AM</span><textarea id="post-composer" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What's happening in sports?" rows={2} aria-label="Write a post" /></div>
            <div className="composer-footer"><span className="composer-prompt"><Icon name="sparkle" size={15} /> Share the moment with your community</span><button type="submit" className="post-button" disabled={!draft.trim()}>Post <Icon name="arrow" size={16} /></button></div>
          </form>

          <div className="feed-controls"><div className="feed-tabs" role="tablist" aria-label="Choose feed"><button role="tab" aria-selected={activeFilter === "For you"} className={activeFilter === "For you" ? "selected" : ""} onClick={() => setActiveFilter("For you")}>For you</button><button role="tab" aria-selected={activeFilter === "Following"} className={activeFilter === "Following" ? "selected" : ""} onClick={() => setActiveFilter("Following")}>Following</button></div><button className="sort-button" onClick={() => setActiveFilter(activeFilter === "For you" ? "Following" : "For you")}>Latest <span>⌄</span></button></div>

          <div className="post-list">
            {visiblePosts.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="search" size={23} /></span><strong>{search ? "No posts found" : "Your following feed is quiet"}</strong><p>{search ? "Try another name, sport, or keyword." : "Follow a fan from Explore to see their posts here."}</p><button onClick={() => { setSearch(""); setActiveFilter("For you"); }}>Back to your feed</button></div> : visiblePosts.map((post) => {
              const liked = likedPosts.includes(post.id);
              return <article className="post-card" key={post.id}>
                <div className="post-heading"><span className={`avatar ${post.avatar}`}>{post.initials}</span><div className="post-author"><div><strong>{post.name}</strong><span className="verified">✓</span><span className="post-handle">@{post.handle}</span><span className="post-dot">·</span><span className="post-time">{post.time}</span></div><span className="post-topic">{post.sport}</span></div><button className="post-more" aria-label={`More options for ${post.name}'s post`}><Icon name="more" size={20} /></button></div>
                <p className="post-body">{post.body}</p>
                {post.image === "court" && <div className="post-visual court-visual" role="img" aria-label="Illustrated basketball court under arena lights"><div className="court-lights" /><div className="court-lines" /><div className="court-ball" /><span className="visual-caption">ALL HEART.<br />ALL GAME.</span></div>}
                {post.image === "stadium" && <div className="post-visual stadium-visual" role="img" aria-label="Illustrated football stadium at dusk"><div className="stadium-sun" /><div className="stadium-stands" /><div className="stadium-pitch" /><span className="visual-caption">SUNDAY<br />IS OURS.</span></div>}
                <div className="post-actions"><button className={liked ? "liked" : ""} onClick={() => toggleLike(post.id)} aria-label={liked ? "Unlike post" : "Like post"}><Icon name="heart" size={19} /><span>{post.likes + (liked ? 1 : 0)}</span></button><button onClick={() => setNotice("Replies are coming soon.")}><Icon name="message" size={18} /><span>{post.replies}</span></button><button onClick={() => setNotice("Share links are coming soon.")} aria-label="Share post"><Icon name="share" size={18} /><span>Share</span></button></div>
              </article>;
            })}
          </div>
          <footer className="feed-footer">You’re all caught up <span>✳</span></footer>
        </section>

        <aside className="right-rail" aria-label="Sports highlights">
          <div className="right-rail-top"><span className="eyebrow">THE SIDELINE</span><span className="today-chip">TODAY</span></div>
          <section className="side-section scores-section"><div className="section-title"><h2>Coming up</h2><button onClick={() => setActiveNav("Schedule")}>Full schedule <Icon name="arrow" size={14} /></button></div>
            <div className="score-card"><div className="score-meta"><span>NBA</span><span>7:30 PM</span></div><div className="score-teams"><span><i className="mini-team knicks-mini">NY</i><strong>New York</strong></span><span>vs</span><span><i className="mini-team celtics-mini">B</i><strong>Boston</strong></span></div><div className="score-bottom"><span>Madison Square Garden</span><button onClick={() => setNotice("Reminder set for this preview.")}>Remind me</button></div></div>
            <div className="score-card"><div className="score-meta"><span>MLS</span><span>8:00 PM</span></div><div className="score-teams"><span><i className="mini-team la-mini">LA</i><strong>LA Galaxy</strong></span><span>vs</span><span><i className="mini-team miami-mini">M</i><strong>Inter Miami</strong></span></div><div className="score-bottom"><span>Dignity Health Sports Park</span><button onClick={() => setNotice("Reminder set for this preview.")}>Remind me</button></div></div>
          </section>

          <section className="side-section community-section"><div className="section-title"><h2>Find your people</h2><button onClick={() => setActiveNav("Explore")}>Explore <Icon name="arrow" size={14} /></button></div><p className="section-subtitle">Good conversations start with shared passion.</p>
            <div className="community-list">{communities.map((community) => { const isJoined = joined.includes(community.name); return <article className="community-card" key={community.name}><div className="community-card-top"><span className={`community-mark ${community.color}`}>{community.mark}</span><span className="community-tag">{community.tag}</span></div><strong>{community.name}</strong><span className="community-members">{community.members}</span><button className={isJoined ? "joined" : "join-button"} onClick={() => setJoined((current) => isJoined ? current.filter((name) => name !== community.name) : [...current, community.name])}>{isJoined ? "Joined ✓" : "Join community"}</button></article>; })}</div>
          </section>

          <section className="side-section people-section"><div className="section-title"><h2>Fans to follow</h2><button onClick={() => setActiveNav("Explore")}>See all <Icon name="arrow" size={14} /></button></div><div className="fan-row"><span className="avatar avatar-coral">MR</span><span className="fan-copy"><strong>Maya Rios</strong><small>Basketball · 2.4k fans</small></span><button className={following.includes("mayarios") ? "follow-button following" : "follow-button"} onClick={() => setFollowing((current) => current.includes("mayarios") ? current.filter((name) => name !== "mayarios") : [...current, "mayarios"])} aria-label={following.includes("mayarios") ? "Unfollow Maya Rios" : "Follow Maya Rios"}>{following.includes("mayarios") ? "✓" : "+"}</button></div><div className="fan-row"><span className="avatar avatar-blue">JL</span><span className="fan-copy"><strong>Jordan Lee</strong><small>Running · 986 fans</small></span><button className={following.includes("jlee_runs") ? "follow-button following" : "follow-button"} onClick={() => setFollowing((current) => current.includes("jlee_runs") ? current.filter((name) => name !== "jlee_runs") : [...current, "jlee_runs"])} aria-label={following.includes("jlee_runs") ? "Unfollow Jordan Lee" : "Follow Jordan Lee"}>{following.includes("jlee_runs") ? "✓" : "+"}</button></div></section>

          <footer className="right-footer"><a href="#top">About</a><a href="#top">Community guidelines</a><a href="#top">Privacy</a><span>© 2026 SportsFB</span></footer>
        </aside>
      </div>
      {notice && <div className="toast" role="status">{notice}</div>}
    </main>
  );
}
