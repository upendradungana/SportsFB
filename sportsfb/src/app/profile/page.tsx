"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { UserProfile } from "../sports-store";
import { useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

const sportOptions = ["Basketball", "Football", "Running", "Soccer", "Tennis", "Golf"];

export default function ProfilePage() {
  const { profile } = useSports();
  return <PageFrame title="Your profile" eyebrow="YOUR SPORTS STORY" description="Make your profile yours and show people what you’re here for."><ProfileEditor key={JSON.stringify(profile)} profile={profile} /></PageFrame>;
}

function ProfileEditor({ profile }: { profile: UserProfile }) {
  const { updateProfile, posts, following, joined } = useSports();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const initials = profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile({ ...form, name: form.name.trim() || "Sports fan", handle: form.handle.replace(/^@/, "").trim() || "sportsfan" });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }
  return <>
    <section className="profile-banner"><div className="profile-cover-art"><span>✳</span><span>SPORTS<br />BRING US<br />TOGETHER</span></div><div className="profile-summary"><span className="avatar avatar-green profile-large-avatar">{initials}</span><div><h2>{profile.name}</h2><span>@{profile.handle}</span><p>{profile.bio}</p></div></div><div className="profile-stats"><span><strong>{posts.filter((post) => post.handle === profile.handle).length}</strong> posts</span><span><strong>{following.length}</strong> following</span><span><strong>{joined.length}</strong> communities</span></div></section>
    <form className="profile-form" onSubmit={saveProfile}><div className="page-section-heading"><div><span className="eyebrow">PROFILE SETTINGS</span><h2>Tell your story</h2></div></div><label>Display name<input value={form.name} maxLength={48} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Username<div className="handle-input"><span>@</span><input value={form.handle} maxLength={24} onChange={(event) => setForm({ ...form, handle: event.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} required /></div></label><label>About you<textarea value={form.bio} maxLength={180} rows={3} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="What do you love about sports?" /></label><fieldset><legend>Your sports</legend><div className="sport-options">{sportOptions.map((sport) => <label key={sport}><input type="checkbox" checked={form.sports.includes(sport)} onChange={() => setForm({ ...form, sports: form.sports.includes(sport) ? form.sports.filter((item) => item !== sport) : [...form.sports, sport] })} /><span>{sport}</span></label>)}</div></fieldset><div className="profile-form-footer"><span>Your profile is stored in this browser.</span><button type="submit" className="post-button">{saved ? "Saved ✓" : "Save profile"}</button></div></form>
  </>;
}
