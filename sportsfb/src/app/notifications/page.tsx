"use client";

import Link from "next/link";
import { useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

export default function NotificationsPage() {
  const { activities, markAllRead } = useSports();
  const unread = activities.filter((activity) => !activity.read).length;
  return <PageFrame title="Notifications" eyebrow="YOUR COMMUNITY, IN THE LOOP" description="Catch the replies, follows, and moments that involve you.">
    <div className="notification-toolbar"><span>{unread ? `${unread} new updates` : "You’re all caught up"}</span><button onClick={markAllRead} disabled={!unread}>Mark all as read</button></div>
    {activities.length ? <div className="activity-list">{activities.map((activity) => <article className={`activity-card ${activity.read ? "read" : "unread"}`} key={activity.id}><span className={`avatar ${activity.avatar}`}>{activity.initials}</span><div className="activity-copy"><strong>{activity.title}</strong><p>{activity.detail}</p><span>{activity.time}</span></div>{!activity.read && <i className="activity-unread-dot" />}</article>)}</div> : <div className="empty-state"><strong>No updates yet</strong><p>When your community interacts with you, you’ll see it here.</p><Link className="empty-link" href="/explore">Explore communities →</Link></div>}
  </PageFrame>;
}
