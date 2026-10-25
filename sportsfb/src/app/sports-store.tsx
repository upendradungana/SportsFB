"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

export type Post = {
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

export type Community = {
  slug: string;
  name: string;
  members: string;
  tag: string;
  color: string;
  mark: string;
  description: string;
  online: number;
};

export type Game = {
  id: string;
  league: string;
  sport: string;
  time: string;
  home: string;
  away: string;
  homeMark: string;
  awayMark: string;
  venue: string;
  date: string;
};

export type Activity = {
  id: number;
  title: string;
  detail: string;
  time: string;
  avatar: string;
  initials: string;
  read: boolean;
};

export type UserProfile = { name: string; handle: string; bio: string; sports: string[] };

export const initialPosts: Post[] = [
  { id: 1, name: "Maya Rios", handle: "mayarios", initials: "MR", avatar: "avatar-coral", time: "18 min ago", sport: "Basketball", body: "That fourth-quarter run was unreal. The whole arena felt like it was shaking 🏀", likes: 248, replies: 32, image: "court" },
  { id: 2, name: "Jordan Lee", handle: "jlee_runs", initials: "JL", avatar: "avatar-blue", time: "1 hr ago", sport: "Running", body: "First 10K in the books. Shoutout to everyone in the Saturday Miles crew who kept me moving when my legs had other plans. What a morning. 🏁", likes: 86, replies: 14 },
  { id: 3, name: "Ari Patel", handle: "aripatel", initials: "AP", avatar: "avatar-violet", time: "3 hrs ago", sport: "Football", body: "Sunday picks are in. I have a feeling this is the week the underdogs make some noise 👀", likes: 53, replies: 21, image: "stadium" },
];

export const communities: Community[] = [
  { slug: "courtside-club", name: "Courtside Club", members: "12.4k fans", tag: "Basketball", color: "community-orange", mark: "C", description: "Big takes, buzzer beaters, and every story from the hardwood.", online: 423 },
  { slug: "the-touchline", name: "The Touchline", members: "8.2k fans", tag: "Football", color: "community-green", mark: "T", description: "Matchday chat and football talk from every corner of the game.", online: 286 },
  { slug: "saturday-miles", name: "Saturday Miles", members: "4.8k fans", tag: "Running", color: "community-purple", mark: "S", description: "A friendly place for race goals, training plans, and finish lines.", online: 118 },
  { slug: "racket-room", name: "The Racket Room", members: "3.1k fans", tag: "Tennis", color: "community-green", mark: "R", description: "Serve up the latest from the courts and share your own game.", online: 74 },
  { slug: "fight-night", name: "Fight Night", members: "6.7k fans", tag: "Combat", color: "community-orange", mark: "F", description: "Fight week, sharp analysis, and respectful ringside debate.", online: 201 },
  { slug: "the-clubhouse", name: "The Clubhouse", members: "2.9k fans", tag: "Golf", color: "community-purple", mark: "G", description: "Course notes, swing thoughts, and weekend rounds.", online: 63 },
];

export const games: Game[] = [
  { id: "ny-bos", league: "NBA", sport: "Basketball", date: "Tonight", time: "7:30 PM", home: "New York Knicks", away: "Boston Celtics", homeMark: "NY", awayMark: "B", venue: "Madison Square Garden" },
  { id: "la-mia", league: "MLS", sport: "Soccer", date: "Tonight", time: "8:00 PM", home: "LA Galaxy", away: "Inter Miami", homeMark: "LA", awayMark: "M", venue: "Dignity Health Sports Park" },
  { id: "sea-chi", league: "NFL", sport: "Football", date: "Tomorrow", time: "1:00 PM", home: "Seattle Hawks", away: "Chicago Bears", homeMark: "S", awayMark: "C", venue: "Lumen Field" },
  { id: "nyc-open", league: "WTA", sport: "Tennis", date: "Tomorrow", time: "4:00 PM", home: "Coco Gauff", away: "Iga Świątek", homeMark: "CG", awayMark: "IŚ", venue: "Arthur Ashe Stadium" },
  { id: "river-run", league: "LOCAL", sport: "Running", date: "Saturday", time: "8:15 AM", home: "Riverfront 10K", away: "Community run", homeMark: "10K", awayMark: "RUN", venue: "Riverside Park" },
];

const initialActivities: Activity[] = [
  { id: 1, title: "Maya Rios liked your post", detail: "That playoff atmosphere was something else.", time: "12 min ago", avatar: "avatar-coral", initials: "MR", read: false },
  { id: 2, title: "The Touchline welcomed you", detail: "You joined the football conversation.", time: "2 hrs ago", avatar: "avatar-green", initials: "T", read: false },
  { id: 3, title: "Jordan Lee replied to a thread you follow", detail: "“See you at the start line!”", time: "Yesterday", avatar: "avatar-blue", initials: "JL", read: true },
];

type StoreState = {
  posts: Post[];
  likedPosts: number[];
  savedPosts: number[];
  following: string[];
  joined: string[];
  reminders: string[];
  comments: Record<number, string[]>;
  activities: Activity[];
  profile: UserProfile;
};

const defaultState: StoreState = {
  posts: initialPosts,
  likedPosts: [],
  savedPosts: [],
  following: [],
  joined: [],
  reminders: [],
  comments: {},
  activities: initialActivities,
  profile: { name: "Alex Morgan", handle: "alexmorgan", bio: "Here for the game, the people, and the post-game conversation.", sports: ["Basketball", "Running"] },
};

type SportsStore = StoreState & {
  addPost: (body: string) => void;
  toggleLike: (id: number) => void;
  toggleSave: (id: number) => void;
  toggleFollow: (handle: string) => void;
  toggleJoin: (slug: string) => void;
  toggleReminder: (id: string) => void;
  addComment: (id: number, body: string) => void;
  markAllRead: () => void;
  updateProfile: (profile: UserProfile) => void;
};

const StoreContext = createContext<SportsStore | null>(null);
const STORAGE_KEY = "sportsfb-state-v1";
let cachedState: StoreState | null = null;
let didReadStorage = false;
const subscribers = new Set<() => void>();

function getSnapshot() {
  if (typeof window === "undefined") return defaultState;
  if (!didReadStorage) {
    didReadStorage = true;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      cachedState = stored ? { ...defaultState, ...JSON.parse(stored) as Partial<StoreState> } : defaultState;
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      cachedState = defaultState;
    }
  }
  return cachedState ?? defaultState;
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function updateState(updater: (current: StoreState) => StoreState) {
  const next = updater(getSnapshot());
  cachedState = next;
  didReadStorage = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The app continues to work for this session when browser storage is unavailable.
  }
  subscribers.forEach((listener) => listener());
}

export function SportsProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => defaultState);

  const store = useMemo<SportsStore>(() => ({
    ...state,
    addPost: (body) => updateState((current) => ({
      ...current,
      posts: [{ id: Date.now(), name: current.profile.name, handle: current.profile.handle, initials: current.profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), avatar: "avatar-green", time: "just now", sport: current.profile.sports[0] ?? "Community", body, likes: 0, replies: 0 }, ...current.posts],
    })),
    toggleLike: (id) => updateState((current) => ({ ...current, likedPosts: current.likedPosts.includes(id) ? current.likedPosts.filter((item) => item !== id) : [...current.likedPosts, id] })),
    toggleSave: (id) => updateState((current) => ({ ...current, savedPosts: current.savedPosts.includes(id) ? current.savedPosts.filter((item) => item !== id) : [...current.savedPosts, id] })),
    toggleFollow: (handle) => updateState((current) => ({ ...current, following: current.following.includes(handle) ? current.following.filter((item) => item !== handle) : [...current.following, handle] })),
    toggleJoin: (slug) => updateState((current) => ({ ...current, joined: current.joined.includes(slug) ? current.joined.filter((item) => item !== slug) : [...current.joined, slug] })),
    toggleReminder: (id) => updateState((current) => ({ ...current, reminders: current.reminders.includes(id) ? current.reminders.filter((item) => item !== id) : [...current.reminders, id] })),
    addComment: (id, body) => updateState((current) => ({ ...current, comments: { ...current.comments, [id]: [...(current.comments[id] ?? []), body] }, posts: current.posts.map((post) => post.id === id ? { ...post, replies: post.replies + 1 } : post) })),
    markAllRead: () => updateState((current) => ({ ...current, activities: current.activities.map((activity) => ({ ...activity, read: true })) })),
    updateProfile: (profile) => updateState((current) => ({ ...current, profile })),
  }), [state]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useSports() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useSports must be used within SportsProvider");
  return store;
}
