import type { CardMatch, MatchPhase, MatchView } from "./types";

const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;

export function toCard(match: MatchView): CardMatch {
  return {
    id: match.id,
    title: match.title,
    category: match.category,
    date: match.date,
    posterUrl: match.posterUrl,
    isAlwaysOn: match.isAlwaysOn,
    isLive: match.isLive,
    homeName: match.teams?.home?.name ?? null,
    homeBadge: match.teams?.home?.badgeUrl ?? null,
    awayName: match.teams?.away?.name ?? null,
    awayBadge: match.teams?.away?.badgeUrl ?? null,
    sourceCount: match.sources.length,
  };
}

export function toCards(matches: readonly MatchView[]): CardMatch[] {
  return matches.map(toCard);
}

export function matchPhase(match: MatchView, now = Date.now()): MatchPhase {
  if (match.isAlwaysOn) return "always-on";
  if (match.isLive) return "live";
  if (match.date > now) return "upcoming";
  if (now - match.date < LIVE_WINDOW_MS) return "live";
  return "ended";
}

export function isUpcoming(match: MatchView, now = Date.now()): boolean {
  return !match.isAlwaysOn && match.date > now;
}

export function isActive(match: MatchView, now = Date.now()): boolean {
  return match.isAlwaysOn || match.isLive || match.date > now;
}

export function byKickoff(a: MatchView, b: MatchView): number {
  if (a.isAlwaysOn && !b.isAlwaysOn) return -1;
  if (b.isAlwaysOn && !a.isAlwaysOn) return 1;
  return a.date - b.date;
}

export function sortForBrowse(matches: readonly MatchView[]): MatchView[] {
  return [...matches].sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    if (a.isAlwaysOn !== b.isAlwaysOn) return a.isAlwaysOn ? 1 : -1;
    return a.date - b.date;
  });
}
