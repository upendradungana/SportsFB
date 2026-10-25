"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { communities, useSports } from "../../sports-store";
import { PageFrame } from "../../page-frame";

export default function CommunityPage() {
  const params = useParams<{ slug: string }>();
  const community = communities.find((item) => item.slug === params.slug);
  const { joined, toggleJoin, posts } = useSports();
  if (!community) return <PageFrame title="Community not found" eyebrow="WRONG TURN"><div className="empty-state"><strong>We couldn’t find that group.</strong><p>Browse the directory to find another sports community.</p><Link className="empty-link" href="/communities">Browse communities →</Link></div></PageFrame>;
  const isJoined = joined.includes(community.slug);
  const matchingPosts = posts.filter((post) => post.sport.toLowerCase() === community.tag.toLowerCase());
  return <PageFrame title={community.name} eyebrow={community.tag.toUpperCase()} description={community.description}>
    <section className={`community-detail-hero ${community.color}`}><span className="community-mark">{community.mark}</span><div><span className="community-tag">{community.tag}</span><h2>{community.name}</h2><p>{community.members} · {community.online} fans active now</p></div><button className={isJoined ? "joined" : "join-button"} onClick={() => toggleJoin(community.slug)}>{isJoined ? "Joined ✓" : "Join community"}</button></section>
    <div className="community-detail-tabs"><span className="selected">Community feed</span><Link href="/schedule">Events & matchups</Link><Link href="/explore">Related groups</Link></div>
    <div className="community-welcome"><strong>Welcome to {community.name}</strong><p>Share a thought, celebrate a win, or ask the fans who know the game.</p><Link href="/#post-composer">Start a conversation →</Link></div>
    <div className="page-section-heading"><div><span className="eyebrow">FAN CONVERSATIONS</span><h2>Latest posts</h2></div></div>
    {matchingPosts.length ? matchingPosts.map((post) => <article className="saved-post community-post" key={post.id}><div className="post-heading"><span className={`avatar ${post.avatar}`}>{post.initials}</span><div className="post-author"><strong>{post.name}</strong><span className="post-time">@{post.handle} · {post.time}</span></div></div><p>{post.body}</p><div className="saved-post-actions"><span>♥ {post.likes} likes</span><span>◌ {post.replies} replies</span></div></article>) : <div className="empty-state"><strong>Be the first to post.</strong><p>Your community is ready for its next great conversation.</p><Link className="empty-link" href="/#post-composer">Write a post →</Link></div>}
  </PageFrame>;
}
