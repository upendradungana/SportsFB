"use client";

import Link from "next/link";
import { useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

export default function SavedPage() {
  const { posts, savedPosts, toggleSave, likedPosts, toggleLike } = useSports();
  const items = posts.filter((post) => savedPosts.includes(post.id));
  return <PageFrame title="Saved posts" eyebrow="KEEP THE GOOD ONES" description="The moments and conversations you’ve bookmarked for later.">
    <div className="saved-intro"><span className="saved-bookmark">♧</span><div><strong>{items.length} saved {items.length === 1 ? "post" : "posts"}</strong><span>Only you can see your saved posts.</span></div></div>
    {items.length === 0 ? <div className="empty-state saved-empty"><span className="empty-icon">♧</span><strong>Your saved list is ready.</strong><p>Bookmark a post from your feed and it will show up here.</p><Link className="empty-link" href="/">Explore your feed →</Link></div> : <div className="saved-post-list">{items.map((post) => <article className="saved-post" key={post.id}><div className="post-heading"><span className={`avatar ${post.avatar}`}>{post.initials}</span><div className="post-author"><strong>{post.name}</strong><span className="post-topic">{post.sport}</span></div><button className="remove-saved" onClick={() => toggleSave(post.id)}>Remove saved</button></div><p>{post.body}</p><div className="saved-post-actions"><button className={likedPosts.includes(post.id) ? "liked" : ""} onClick={() => toggleLike(post.id)}>♥ {post.likes + (likedPosts.includes(post.id) ? 1 : 0)} likes</button><span>◌ {post.replies} replies</span><Link href={`/#post-${post.id}`}>View in feed →</Link></div></article>)}</div>}
  </PageFrame>;
}
