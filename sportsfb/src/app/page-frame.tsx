"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { communities, games, useSports } from "./sports-store";

const links = [
  { href: "/", label: "Home", symbol: "⌂" },
  { href: "/explore", label: "Explore", symbol: "◉" },
  { href: "/schedule", label: "Schedule", symbol: "▦" },
  { href: "/saved", label: "Saved", symbol: "♧" },
  { href: "/communities", label: "Communities", symbol: "◎" },
];

export function PageFrame({ title, eyebrow, description, children }: { title: string; eyebrow: string; description?: string; children: ReactNode }) {
  const pathname = usePathname();
  const { profile, joined, activities } = useSports();
  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const unread = activities.filter((activity) => !activity.read).length;

  return (
    <main className="app-shell">
      <header className="mobile-header">
        <Link className="brand" href="/" aria-label="SportsFB home"><span className="brand-mark">🏆</span><span>sports<span className="brand-accent">fb</span></span></Link>
        <Link className="icon-button notification-button" href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}><span>♢</span>{unread > 0 && <i />}</Link>
      </header>
      <div className="page-grid">
        <aside className="left-rail">
          <Link className="brand desktop-brand" href="/" aria-label="SportsFB home"><span className="brand-mark">🏆</span><span>sports<span className="brand-accent">fb</span></span></Link>
          <div className="rail-label">YOUR SPACE</div>
          <nav className="primary-nav" aria-label="Main navigation">
            {links.map((item) => <Link key={item.href} className={`nav-link ${pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)) ? "active" : ""}`} href={item.href}><span className="nav-symbol">{item.symbol}</span><span>{item.label}</span></Link>)}
            <Link className={`nav-link ${pathname === "/notifications" ? "active" : ""}`} href="/notifications"><span className="nav-symbol">♧</span><span>Notifications</span>{unread > 0 && <span className="nav-count">{unread}</span>}</Link>
          </nav>
          <Link className="sidebar-create" href="/#post-composer"><span className="create-icon">＋</span> Create a post</Link>
          <div className="rail-divider" />
          <div className="rail-section-heading"><span>YOUR COMMUNITIES</span><Link aria-label="Explore communities" href="/communities">＋</Link></div>
          <div className="sidebar-communities">{communities.filter((community) => joined.includes(community.slug)).slice(0, 4).map((community) => <Link className="sidebar-community" key={community.slug} href={`/communities/${community.slug}`}><span className={`community-mark ${community.color}`}>{community.mark}</span><span>{community.name}</span></Link>)}{joined.length === 0 && <span className="sidebar-hint">Join a community to see it here.</span>}</div>
          <div className="sidebar-spacer" />
          <Link className="profile-chip" href="/profile"><span className="avatar avatar-green">{initials}</span><span className="profile-copy"><strong>{profile.name}</strong><small>@{profile.handle}</small></span><span className="profile-more">···</span></Link>
        </aside>
        <section className="feed-column page-column">
          <header className="feed-topbar"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div><div className="topbar-actions"><Link className="search-box search-link" href="/explore"><span>⌕</span><span>Search SportsFB</span></Link><Link className="icon-button desktop-notification" href="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>♢{unread > 0 && <i />}</Link></div></header>
          {children}
        </section>
        <aside className="right-rail" aria-label="Sports highlights">
          <div className="right-rail-top"><span className="eyebrow">THE SIDELINE</span><span className="today-chip">TODAY</span></div>
          <section className="side-section"><div className="section-title"><h2>Coming up</h2><Link href="/schedule">Full schedule →</Link></div>{games.slice(0, 2).map((game) => <article className="score-card" key={game.id}><div className="score-meta"><span>{game.league}</span><span>{game.time}</span></div><div className="score-teams"><span><i className="mini-team knicks-mini">{game.homeMark}</i><strong>{game.home}</strong></span><span>vs</span><span><i className="mini-team celtics-mini">{game.awayMark}</i><strong>{game.away}</strong></span></div><div className="score-bottom"><span>{game.venue}</span><Link href="/schedule">Details</Link></div></article>)}</section>
          <section className="side-section"><div className="section-title"><h2>Find your people</h2><Link href="/explore">Explore →</Link></div><p className="section-subtitle">Good conversations start with shared passion.</p>{communities.slice(0, 3).map((community) => <article className="community-card mini-community-card" key={community.slug}><div className="community-card-top"><span className={`community-mark ${community.color}`}>{community.mark}</span><span className="community-tag">{community.tag}</span></div><strong>{community.name}</strong><span className="community-members">{community.members}</span><Link className="join-button" href={`/communities/${community.slug}`}>View community</Link></article>)}</section>
          <footer className="right-footer"><Link href="/about">About</Link><Link href="/guidelines">Guidelines</Link><Link href="/privacy">Privacy</Link><span>© 2026 SportsFB</span></footer>
        </aside>
      </div>
    </main>
  );
}
