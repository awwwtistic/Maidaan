import { cache } from "react";
import type {
  CardMatch,
  Lookup,
  MatchView,
  SportDefinition,
  SportSummary,
  StreamSourceRef,
  StreamView,
  WatchData,
  WatchSourceGroup,
} from "./types";
import { SPORTS, getSport } from "./sports";
import { isActive, sortForBrowse, toCards } from "./match";

const DEFAULT_API_BASE = "https://api.ppv.st/api";
const LIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const CATALOG_REVALIDATE = 30;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_DELAY_MS = 250;
const EMBED_HOST = "taifood-blog.asia";

function resolveApi(): string {
  const configured = (process.env.PPV_API_BASE ?? DEFAULT_API_BASE).trim();
  try {
    const url = new URL(configured);
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    return DEFAULT_API_BASE;
  }
}

const apiBase = resolveApi();

type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

async function apiGet<T = unknown>(path: string, revalidate: number): Promise<ApiResult<T>> {
  const url = `${apiBase}${path}`;
  let error = "Request failed";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) {
        error = `HTTP ${response.status}`;
        if (attempt === 0 && retryableStatus(response.status)) {
          await wait(RETRY_DELAY_MS);
          continue;
        }
        break;
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        error = "Unexpected response type";
        break;
      }
      return { ok: true, data: (await response.json()) as T };
    } catch (caught) {
      error = caught instanceof Error ? caught.message : "Request failed";
      break;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[ppv] ${url} — ${error}`);
  }
  return { ok: false, error };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(Math.trunc(value));
  return readString(value);
}

function readBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function readViewers(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string") {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length > 0) {
      const parsed = Number.parseInt(digits, 10);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function readTimestamp(value: unknown): number {
  let seconds: number | null = null;
  if (typeof value === "number" && Number.isFinite(value)) {
    seconds = value;
  } else if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) seconds = parsed;
    else {
      const date = Date.parse(value);
      if (Number.isFinite(date)) return date;
    }
  }
  if (seconds === null) return 0;
  if (seconds <= 0) return 0;
  return seconds > 1e12 ? Math.round(seconds) : Math.round(seconds * 1000);
}

const CATEGORY_MAP: Record<string, string> = {
  "american football": "american-football",
  "australian football": "afl",
  basketball: "basketball",
  billiards: "billiards",
  "combat sports": "fight",
  cricket: "cricket",
  darts: "darts",
  football: "football",
  golf: "golf",
  "ice hockey": "hockey",
  motorsports: "motor-sports",
  "motor sports": "motor-sports",
  rugby: "rugby",
  tennis: "tennis",
  wrestling: "fight",
};

const EXCLUDED_CATEGORIES = new Set(["24/7 streams"]);

function mapCategory(name: string): string {
  return CATEGORY_MAP[name.trim().toLowerCase()] ?? "other";
}

const LANGUAGE_LABELS: Record<string, string> = {
  ar: "Arabic",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  "en-au": "English (AU)",
  "en-ca": "English (CA)",
  "en-gb": "English (UK)",
  "en-us": "English (US)",
  es: "Spanish",
  fi: "Finnish",
  fr: "French",
  hi: "Hindi",
  hu: "Hungarian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  nl: "Dutch",
  no: "Norwegian",
  pl: "Polish",
  pt: "Portuguese",
  "pt-br": "Portuguese (BR)",
  ro: "Romanian",
  ru: "Russian",
  sv: "Swedish",
  tr: "Turkish",
  uk: "Ukrainian",
  zh: "Chinese",
};

function languageLabel(locale: string | null): string {
  if (!locale) return "Stream";
  const key = locale.trim().toLowerCase();
  return LANGUAGE_LABELS[key] ?? key.toUpperCase();
}

function safePoster(value: unknown): string | null {
  const raw = readString(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function extractEmbed(value: unknown): string | null {
  const raw = readString(value);
  if (!raw) return null;

  let candidate = raw;
  if (/<\s*iframe/i.test(raw)) {
    const match = raw.match(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    candidate = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  }
  candidate = candidate.replace(/&amp;/gi, "&").trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    const hostname = url.hostname.toLowerCase();
    if (hostname !== EMBED_HOST && !hostname.endsWith(`.${EMBED_HOST}`)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "feed";
}

const QUALITY_TOKENS = new Set(["HD", "SD", "4K", "UHD", "FHD"]);

function parseSourceTag(
  sourceTag: string | null,
  fallbackLabel: string | null,
): { label: string; hd: boolean } {
  let label = "";
  let hd = false;

  if (sourceTag) {
    const [qualityPart = "", ...rest] = sourceTag.split("|");
    const quality = qualityPart.trim().toUpperCase();
    if (quality === "SD") hd = false;
    else if (QUALITY_TOKENS.has(quality)) hd = true;

    if (rest.length > 0) {
      label = rest.join("|").trim();
    } else if (!QUALITY_TOKENS.has(quality) && !/^24\/7\b/i.test(sourceTag.trim())) {
      label = sourceTag.trim();
    }
  }

  return { label: label || fallbackLabel || "Main", hd };
}

interface RawFeed {
  id: string;
  embedUrl: string;
  label: string;
  hd: boolean;
  locale: string | null;
}

function readLocale(value: unknown): string | null {
  return readString(value);
}

function collectFeeds(
  rawEvent: Record<string, unknown>,
  eventId: string,
  fallbackLabel: string | null,
  fallbackLocale: string | null,
  viewers: number,
): WatchSourceGroup[] {
  const candidates: unknown[] = [rawEvent, ...(Array.isArray(rawEvent.substreams) ? rawEvent.substreams : [])];
  const seenEmbeds = new Set<string>();
  const groups = new Map<string, { label: string; feeds: RawFeed[] }>();
  let index = 0;

  for (const candidate of candidates) {
    index += 1;
    if (!isRecord(candidate)) continue;
    const embedUrl = extractEmbed(candidate.iframe);
    if (!embedUrl || seenEmbeds.has(embedUrl)) continue;
    seenEmbeds.add(embedUrl);

    const locale = readLocale(candidate.locale) ?? fallbackLocale;
    const { label, hd } = parseSourceTag(
      readString(candidate.source_tag),
      fallbackLabel,
    );
    const feed: RawFeed = {
      id: readId(candidate.id) ?? `${eventId}-${index}`,
      embedUrl,
      label,
      hd,
      locale,
    };

    const key = label.toLocaleLowerCase();
    const group = groups.get(key);
    if (group) group.feeds.push(feed);
    else groups.set(key, { label, feeds: [feed] });
  }

  const usedSourceIds = new Set<string>();
  const result: WatchSourceGroup[] = [];

  for (const { label, feeds } of groups.values()) {
    const ordered = [...feeds].sort((a, b) => Number(b.hd) - Number(a.hd));
    let sourceId = `${eventId}:${slugify(label)}`;
    let duplicate = 2;
    while (usedSourceIds.has(sourceId)) {
      sourceId = `${eventId}:${slugify(label)}-${duplicate}`;
      duplicate += 1;
    }
    usedSourceIds.add(sourceId);

    const streams: StreamView[] = ordered.map((feed, feedIndex) => ({
      id: feed.id,
      streamNo: feedIndex + 1,
      language: languageLabel(feed.locale),
      hd: feed.hd,
      viewers,
      embedUrl: feed.embedUrl,
      source: label,
    }));

    result.push({ source: label, sourceId, streams });
  }

  return result;
}

interface ParsedEvent {
  match: MatchView;
  groups: WatchSourceGroup[];
}

function parseEvent(
  rawEvent: Record<string, unknown>,
  categoryName: string,
  categoryAlwaysOn: boolean,
  now: number,
): ParsedEvent | null {
  const id = readId(rawEvent.id);
  if (!id) return null;

  const title =
    readString(rawEvent.name) ?? readString(rawEvent.uri_name) ?? readString(rawEvent.tag);
  if (!title) return null;

  const tag = readString(rawEvent.tag) ?? "";
  const startsAt = readTimestamp(rawEvent.starts_at);
  const endsAt = readTimestamp(rawEvent.ends_at);
  const isAlwaysOn =
    readBool(rawEvent.always_live) ||
    categoryAlwaysOn ||
    startsAt === 0 ||
    /24\/7/i.test(tag);
  const date = isAlwaysOn ? 0 : startsAt;
  const isLive =
    !isAlwaysOn &&
    startsAt > 0 &&
    now >= startsAt &&
    (endsAt > startsAt ? now < endsAt : now - startsAt < LIVE_WINDOW_MS);

  const fallbackLabel = tag && !/24\/7/i.test(tag) ? tag : title;
  const groups = collectFeeds(
    rawEvent,
    id,
    fallbackLabel,
    readLocale(rawEvent.locale),
    readViewers(rawEvent.viewers),
  );
  const sources: StreamSourceRef[] = groups.map((group) => ({
    source: group.source,
    id: group.sourceId,
  }));

  return {
    match: {
      id,
      title,
      category: mapCategory(categoryName),
      date,
      posterUrl: safePoster(rawEvent.poster),
      popular: false,
      teams: null,
      sources,
      isAlwaysOn,
      isLive,
    },
    groups,
  };
}

type ParseCatalogResult =
  | { ok: true; events: ParsedEvent[] }
  | { ok: false; error: string };

function parseCatalog(value: unknown, now: number): ParseCatalogResult {
  if (!isRecord(value)) return { ok: false, error: "Malformed catalog" };
  if (value.success === false) return { ok: false, error: "API reported failure" };
  if (!Array.isArray(value.streams)) return { ok: false, error: "Malformed catalog" };

  const byId = new Map<string, ParsedEvent>();

  for (const rawCategory of value.streams) {
    if (!isRecord(rawCategory)) continue;
    const categoryName =
      readString(rawCategory.category) ?? readString(rawCategory.category_name) ?? "";
    if (EXCLUDED_CATEGORIES.has(categoryName.trim().toLowerCase())) continue;

    const rawEvents = Array.isArray(rawCategory.streams) ? rawCategory.streams : [];
    const categoryAlwaysOn = readBool(rawCategory.always_live);

    for (const rawEvent of rawEvents) {
      if (!isRecord(rawEvent)) continue;
      const parsed = parseEvent(rawEvent, categoryName, categoryAlwaysOn, now);
      if (!parsed) continue;
      if (!byId.has(parsed.match.id)) byId.set(parsed.match.id, parsed);
    }
  }

  return { ok: true, events: [...byId.values()] };
}

interface PpvCatalogResult {
  ok: boolean;
  error: string | null;
  matches: MatchView[];
  groupsById: Map<string, WatchSourceGroup[]>;
}

const getPpvCatalog = cache(async (): Promise<PpvCatalogResult> => {
  const result = await apiGet<unknown>("/streams", CATALOG_REVALIDATE);
  if (!result.ok) {
    return { ok: false, error: result.error, matches: [], groupsById: new Map() };
  }

  const parsed = parseCatalog(result.data, Date.now());
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, matches: [], groupsById: new Map() };
  }

  const groupsById = new Map<string, WatchSourceGroup[]>();
  const matches: MatchView[] = [];
  for (const event of parsed.events) {
    matches.push(event.match);
    groupsById.set(event.match.id, event.groups);
  }

  return { ok: true, error: null, matches, groupsById };
});

export interface CatalogResult {
  ok: boolean;
  error: string | null;
  matches: MatchView[];
}

export const getCatalog = cache(async (): Promise<CatalogResult> => {
  const catalog = await getPpvCatalog();
  return { ok: catalog.ok, error: catalog.error, matches: catalog.matches };
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
  const live = active.filter((match) => match.isLive).sort((a, b) => a.date - b.date);
  const upcoming = active
    .filter((match) => !match.isAlwaysOn && !match.isLive && match.date > now)
    .sort((a, b) => a.date - b.date);
  const channels = active
    .filter((match) => match.isAlwaysOn)
    .sort((a, b) => a.title.localeCompare(b.title));

  const featuredPoster = (match: MatchView) => Boolean(match.posterUrl);
  const featured =
    live.find(featuredPoster) ??
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

export const getWatchPageData = cache(async (id: string): Promise<Lookup<WatchData>> => {
  const catalog = await getPpvCatalog();
  if (!catalog.ok) return { status: "error" };
  const match = catalog.matches.find((entry) => entry.id === id);
  if (!match) return { status: "not-found" };
  return {
    status: "ok",
    data: { match, groups: catalog.groupsById.get(id) ?? [] },
  };
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
