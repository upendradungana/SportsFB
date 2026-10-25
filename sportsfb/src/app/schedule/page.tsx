"use client";

import { useMemo, useState } from "react";
import { games, useSports } from "../sports-store";
import { PageFrame } from "../page-frame";

const filters = ["All sports", "Basketball", "Football", "Soccer", "Tennis", "Running"];

export default function SchedulePage() {
  const [filter, setFilter] = useState("All sports");
  const { reminders, toggleReminder } = useSports();
  const visibleGames = useMemo(() => games.filter((game) => filter === "All sports" || game.sport === filter), [filter]);
  return <PageFrame title="Schedule" eyebrow="DON’T MISS A MOMENT" description="Your sports calendar, all in one place. Set a reminder and show up for your people.">
    <div className="schedule-highlight"><div><span className="eyebrow">UP NEXT</span><h2>Game day starts here.</h2><p>Find a matchup, make a plan, and bring your best takes.</p></div><div className="schedule-highlight-ball">🏀</div></div>
    <div className="filter-chips schedule-filters" aria-label="Filter games by sport">{filters.map((item) => <button className={filter === item ? "active" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
    <div className="page-section-heading"><div><span className="eyebrow">UPCOMING</span><h2>{filter === "All sports" ? "The next few days" : filter}</h2></div><span className="result-count">{visibleGames.length} events</span></div>
    <div className="schedule-list">{visibleGames.map((game) => <article className="schedule-game" key={game.id}><div className="game-date"><strong>{game.date}</strong><span>{game.time}</span></div><div className="game-main"><span className="game-league">{game.league} · {game.sport}</span><div className="game-teams"><span className="team-badge team-knicks">{game.homeMark}</span><strong>{game.home}</strong><span className="versus">vs</span><span className="team-badge team-celtics">{game.awayMark}</span><strong>{game.away}</strong></div><span className="game-venue">{game.venue}</span></div><button className={reminders.includes(game.id) ? "reminder-button active" : "reminder-button"} onClick={() => toggleReminder(game.id)}>{reminders.includes(game.id) ? "✓ Reminded" : "＋ Remind me"}</button></article>)}</div>
  </PageFrame>;
}
