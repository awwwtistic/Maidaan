import { cache } from "react";
import type {
  CardMatch,
  Lookup,
  MatchView,
  SportDefinition,
  SportSummary,
  StreamSourceRef,
  StreamView,
  TeamInfo,
  WatchData,
  WatchSourceGroup,
} from "./types";
import { SPORTS, getSport } from "./sports";
import { byKickoff, isActive, sortForBrowse, toCards } from "./match";

const DEFAULT_API_BASE = "https://streamed.pk/api";
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const CATALOG_REVALIDATE = 30;
const STREAM_REVALIDATE = 15;
const REQUEST_TIMEOUT_MS = 8000;

function resolveApi(): { base: string; origin: string } {
  const configured = (process.env.STREAMED_API_BASE ?? DEFAULT_API_BASE).trim();
  try {
    const url = new URL(configured);
    return {
      base: `${url.origin}${url.pathname.replace(/\/+$/, "")}`,
      origin: url.origin,
    };
  } catch {
    const fallback = new URL(DEFAULT_API_BASE);
    return { base: DEFAULT_API_BASE, origin: fallback.origin };
  }
}

const api = resolveApi();

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function apiGet<T = unknown>(path: string, revalidate: number): Promise<ApiResult<T>> {
  const url = `${api.base}${path}`;
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return { ok: false, error: "Unexpected response type" };
    }
    return { ok: true, data: (await response.json()) as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    if (process.env.NODE_ENV === "development") {
      console.warn(`[streamed] ${url} — ${message}`);
    }
    return { ok: false, error: message };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readDate(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

interface RawTeam {
  name: string;
  badge: string | null;
}

interface RawSource {
  source: string;
  id: string;
}

interface RawMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster: string | null;
  popular: boolean;
  teams: { home: RawTeam | null; away: RawTeam | null } | null;
  sources: RawSource[];
}

function parseTeam(value: unknown): RawTeam | null {
  if (!isRecord(value)) return null;
  const name = readString(value.name);
  if (!name) return null;
  return { name, badge: readString(value.badge) };
}

function parseSources(value: unknown): RawSource[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const sources: RawSource[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const source = readString(item.source);
    const id = readString(item.id);
    if (!source || !id) continue;
    const key = `${source}::${id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ source, id });
    if (sources.length >= 4) break;
  }
  return sources;
}

function parseMatch(value: unknown): RawMatch | null {
  if (!isRecord(value)) return null;
  const id = readString(value.id);
  if (!id) return null;
  const rawTeams = isRecord(value.teams) ? value.teams : null;
  const home = parseTeam(rawTeams?.home);
  const away = parseTeam(rawTeams?.away);
  const derivedTitle = [home?.name, away?.name].filter(Boolean).join(" vs ");
  const title = readString(value.title) ?? derivedTitle;
  if (!title) return null;
  return {
    id,
    title,
    category: readString(value.category)?.toLowerCase() ?? "other",
    date: readDate(value.date),
    poster: readString(value.poster),
    popular: value.popular === true,
    teams: home || away ? { home, away } : null,
    sources: parseSources(value.sources),
  };
}

function parseMatchList(value: unknown): RawMatch[] {
  if (!Array.isArray(value)) return [];
  const matches: RawMatch[] = [];
  for (const entry of value) {
    const parsed = parseMatch(entry);
    if (parsed) matches.push(parsed);
  }
  return matches;
}

function absoluteImage(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/")) return `${api.origin}${path}`;
  return `${api.origin}/api/images/proxy/${path}.webp`;
}

function badgeImage(badge: string | null): string | null {
  if (!badge) return null;
  if (/^https?:\/\//i.test(badge)) return badge;
  if (badge.startsWith("/")) return `${api.origin}${badge}`;
  return `${api.origin}/api/images/badge/${badge}.webp`;
}

function toTeamInfo(team: RawTeam | null): TeamInfo | null {
  if (!team) return null;
  return { name: team.name, badgeUrl: badgeImage(team.badge) };
}

function normalizeMatch(raw: RawMatch, liveIds: Set<string> | null, now: number): MatchView {
  const isAlwaysOn = raw.date <= 0;
  const isLive = isAlwaysOn
    ? false
    : liveIds
      ? liveIds.has(raw.id)
      : raw.date <= now && now - raw.date < LIVE_WINDOW_MS;

  return {
    id: raw.id,
    title: raw.title,
    category: raw.category,
    date: raw.date,
    posterUrl: absoluteImage(raw.poster),
    popular: raw.popular,
    teams: raw.teams
      ? { home: toTeamInfo(raw.teams.home), away: toTeamInfo(raw.teams.away) }
      : null,
    sources: raw.sources as StreamSourceRef[],
    isAlwaysOn,
    isLive,
  };
}

export interface CatalogResult {
  ok: boolean;
  error: string | null;
  matches: MatchView[];
  liveIds: Set<string> | null;
}

export const getCatalog = cache(async (): Promise<CatalogResult> => {
  const [allResult, liveResult] = await Promise.all([
    apiGet<unknown>("/matches/all", CATALOG_REVALIDATE),
    apiGet<unknown>("/matches/live", CATALOG_REVALIDATE),
  ]);

  if (!allResult.ok) {
    return { ok: false, error: allResult.error, matches: [], liveIds: null };
  }

  const rawMatches = parseMatchList(allResult.data);
  const liveIds = liveResult.ok
    ? new Set(parseMatchList(liveResult.data).map((match) => match.id))
    : null;
  const now = Date.now();
  const byId = new Map<string, MatchView>();

  for (const raw of rawMatches) {
    const existing = byId.get(raw.id);
    if (existing) continue;
    byId.set(raw.id, normalizeMatch(raw, liveIds, now));
  }

  return { ok: true, error: null, matches: [...byId.values()], liveIds };
});

export interface HomeData {
  ok: boolean;
  featured: MatchView | null;
  live: MatchView[];
  upcoming: MatchView[];
  channels: MatchView[];
  nextMatch: MatchView | null;
  sportRails: { sport: SportDefinition; matches: MatchView[] }[];
  activeCount: number;
}

export const getHomeData = cache(async (): Promise<HomeData> => {
  const catalog = await getCatalog();
  const now = Date.now();
  const active = catalog.matches.filter((match) => isActive(match, now));
  const live = active
    .filter((match) => match.isLive)
    .sort((a, b) => a.date - b.date);
  const upcoming = active
    .filter((match) => !match.isAlwaysOn && !match.isLive && match.date > now)
    .sort((a, b) => a.date - b.date);
  const channels = active
    .filter((match) => match.isAlwaysOn)
    .sort((a, b) => a.title.localeCompare(b.title));

  const featuredPoster = (match: MatchView) => Boolean(match.posterUrl);
  const featured =
    live.find(featuredPoster) ??
    upcoming.find((match) => featuredPoster(match) && Boolean(match.teams)) ??
    upcoming.find(featuredPoster) ??
    channels.find(featuredPoster) ??
    live[0] ??
    upcoming[0] ??
    channels[0] ??
    null;

  const byCategory = new Map<string, MatchView[]>();
  for (const match of active) {
    const list = byCategory.get(match.category);
    if (list) list.push(match);
    else byCategory.set(match.category, [match]);
  }

  const sportRails = SPORTS.filter((sport) => sport.id !== "other")
    .map((sport) => ({
      sport,
      matches: sortForBrowse(byCategory.get(sport.id) ?? []).slice(0, 12),
    }))
    .filter((rail) => rail.matches.length >= 3)
    .sort((a, b) => b.matches.length - a.matches.length)
    .slice(0, 4);

  return {
    ok: catalog.ok,
    featured,
    live,
    upcoming,
    channels,
    nextMatch: upcoming[0] ?? null,
    sportRails,
    activeCount: active.length,
  };
});

export const getSportsOverview = cache(
  async (): Promise<{ ok: boolean; summaries: SportSummary[]; total: number }> => {
    const catalog = await getCatalog();
    const now = Date.now();
    const active = catalog.matches.filter((match) => isActive(match, now));
    const summaries = SPORTS.map((sport) => {
      const matches = active.filter((match) => match.category === sport.id);
      const upcoming = matches
        .filter((match) => !match.isAlwaysOn && match.date > now)
        .sort((a, b) => a.date - b.date);
      return {
        sport,
        total: matches.length,
        live: matches.filter((match) => match.isLive).length,
        upcoming: upcoming.length,
        nextMatch: upcoming[0] ?? null,
      } satisfies SportSummary;
    });
    return { ok: catalog.ok, summaries, total: active.length };
  },
);

export interface SportPageData {
  ok: boolean;
  sport: SportDefinition;
  matches: MatchView[];
}

export const getSportPageData = cache(async (sportId: string): Promise<SportPageData> => {
  const catalog = await getCatalog();
  const now = Date.now();
  const sport = getSport(sportId);
  const matches = sortForBrowse(
    catalog.matches.filter((match) => match.category === sportId && isActive(match, now)),
  );
  return { ok: catalog.ok, sport, matches };
});

export interface MatchPageData {
  match: MatchView;
  related: MatchView[];
}

export const getMatchPageData = cache(
  async (id: string): Promise<Lookup<MatchPageData>> => {
    const catalog = await getCatalog();
    if (!catalog.ok) return { status: "error" };
    const match = catalog.matches.find((entry) => entry.id === id);
    if (!match) return { status: "not-found" };

    const now = Date.now();
    const related = catalog.matches
      .filter(
        (entry) =>
          entry.id !== id && entry.category === match.category && isActive(entry, now),
      )
      .sort((a, b) => Math.abs(a.date - now) - Math.abs(b.date - now))
      .slice(0, 8);

    return { status: "ok", data: { match, related } };
  },
);

function safeEmbedUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (url.hostname !== "embed.st" && !url.hostname.endsWith(".embed.st")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function parseStreams(value: unknown, fallbackSource: string): StreamView[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const streams: StreamView[] = [];

  for (const item of value) {
    if (!isRecord(item)) continue;
    const embedUrl = safeEmbedUrl(readString(item.embedUrl));
    if (!embedUrl) continue;
    if (seen.has(embedUrl)) continue;
    seen.add(embedUrl);
    const streamNo =
      typeof item.streamNo === "number" && Number.isFinite(item.streamNo)
        ? item.streamNo
        : streams.length + 1;
    streams.push({
      id: readString(item.id) ?? `${fallbackSource}-${streamNo}`,
      streamNo,
      language: readString(item.language) ?? "Stream",
      hd: item.hd === true,
      viewers:
        typeof item.viewers === "number" && Number.isFinite(item.viewers)
          ? Math.max(0, Math.round(item.viewers))
          : 0,
      embedUrl,
      source: readString(item.source) ?? fallbackSource,
    });
  }

  return streams.sort((a, b) => a.streamNo - b.streamNo);
}

const getSourceStreams = cache(
  async (source: string, sourceId: string): Promise<StreamView[]> => {
    const result = await apiGet<unknown>(
      `/stream/${encodeURIComponent(source)}/${encodeURIComponent(sourceId)}`,
      STREAM_REVALIDATE,
    );
    if (!result.ok) return [];
    return parseStreams(result.data, source);
  },
);

export const getWatchPageData = cache(async (id: string): Promise<Lookup<WatchData>> => {
  const catalog = await getCatalog();
  if (!catalog.ok) return { status: "error" };
  const match = catalog.matches.find((entry) => entry.id === id);
  if (!match) return { status: "not-found" };

  const groups: WatchSourceGroup[] = await Promise.all(
    match.sources.map(async (source) => ({
      source: source.source,
      sourceId: source.id,
      streams: await getSourceStreams(source.source, source.id),
    })),
  );

  return { status: "ok", data: { match, groups } };
});

export interface CardsResult {
  ok: boolean;
  cards: CardMatch[];
  generatedAt: number;
}

export const getActiveCards = cache(async (): Promise<CardsResult> => {
  const now = Date.now();
  const catalog = await getCatalog();
  if (!catalog.ok) return { ok: false, cards: [], generatedAt: now };
  return {
    ok: true,
    cards: toCards(sortForBrowse(catalog.matches.filter((match) => isActive(match, now)))),
    generatedAt: now,
  };
});

export function nextUpcoming(matches: readonly MatchView[], now = Date.now()): MatchView | null {
  return matches.filter((match) => !match.isAlwaysOn && match.date > now).sort(byKickoff)[0] ?? null;
}
