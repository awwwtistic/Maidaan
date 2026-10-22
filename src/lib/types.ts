export interface SportDefinition {
  id: string;
  name: string;
  accent: string;
  blurb: string;
}

export interface StreamSourceRef {
  source: string;
  id: string;
}

export interface TeamInfo {
  name: string;
  badgeUrl: string | null;
}

export interface MatchView {
  id: string;
  title: string;
  category: string;
  date: number;
  posterUrl: string | null;
  popular: boolean;
  teams: { home: TeamInfo | null; away: TeamInfo | null } | null;
  sources: StreamSourceRef[];
  isAlwaysOn: boolean;
  isLive: boolean;
}

export interface CardMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  posterUrl: string | null;
  isAlwaysOn: boolean;
  isLive: boolean;
  homeName: string | null;
  homeBadge: string | null;
  awayName: string | null;
  awayBadge: string | null;
  sourceCount: number;
}

export interface StreamView {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  viewers: number;
  embedUrl: string;
  source: string;
}

export interface WatchSourceGroup {
  source: string;
  sourceId: string;
  streams: StreamView[];
}

export interface WatchData {
  match: MatchView;
  groups: WatchSourceGroup[];
}

export type Lookup<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "error" };

export type TimeVariant = "time" | "short" | "card" | "day" | "full";

export type MatchPhase = "live" | "always-on" | "upcoming" | "ended";

export interface SportSummary {
  sport: SportDefinition;
  total: number;
  live: number;
  upcoming: number;
  nextMatch: MatchView | null;
}
