"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Loader2, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { CardMatch } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { cn } from "@/lib/utils";
import { MatchRow } from "@/components/match/MatchRow";
import { DataNotice } from "@/components/common/DataNotice";

const RESULT_LIMIT = 24;

function normalize(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function byBrowse(a: CardMatch, b: CardMatch): number {
  if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
  if (a.isAlwaysOn !== b.isAlwaysOn) return a.isAlwaysOn ? 1 : -1;
  if (!a.isAlwaysOn && !b.isAlwaysOn) return a.date - b.date;
  return a.title.localeCompare(b.title);
}

function scoreMatch(match: CardMatch, tokens: string[], normalizedQuery: string): number {
  const title = normalize(match.title);
  const home = normalize(match.homeName);
  const away = normalize(match.awayName);
  const sport = normalize(getSport(match.category).name);
  const haystack = `${title} ${home} ${away} ${sport}`;
  if (!tokens.every((token) => haystack.includes(token))) return -1;

  let score = 0;
  const titleWords = title.split(/\s+/);
  for (const token of tokens) {
    if (title === normalizedQuery) score += 140;
    else if (title.startsWith(token)) score += 80;
    else if (titleWords.some((word) => word.startsWith(token))) score += 55;
    else if (home.startsWith(token) || away.startsWith(token) || sport.startsWith(token)) score += 48;
    else score += 20;
  }

  if (match.isLive) score += 30;
  else if (!match.isAlwaysOn) score += 8;
  return score;
}

interface SportOption {
  id: string;
  name: string;
  accent: string;
  count: number;
}

export function SearchView({ cards, feedOk = true }: { cards: CardMatch[]; feedOk?: boolean }) {
  const [query, setQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const pending = query !== deferredQuery;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const editable =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT");

      if (
        event.key === "/" &&
        !editable &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current &&
        inputRef.current?.value
      ) {
        setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const sports = useMemo(() => {
    const map = new Map<string, SportOption>();
    for (const match of cards) {
      const sport = getSport(match.category);
      const existing = map.get(sport.id);
      if (existing) existing.count += 1;
      else map.set(sport.id, { id: sport.id, name: sport.name, accent: sport.accent, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [cards]);

  const activeSport = sports.some((sport) => sport.id === sportFilter) ? sportFilter : "all";

  const { matches, total } = useMemo(() => {
    const pool =
      activeSport === "all" ? cards : cards.filter((match) => match.category === activeSport);
    const tokens = normalize(deferredQuery).trim().split(/\s+/).filter(Boolean);
    const normalizedQuery = tokens.join(" ");

    if (tokens.length === 0) {
      return { matches: [...pool].sort(byBrowse).slice(0, RESULT_LIMIT), total: pool.length };
    }

    const scored = pool
      .map((match) => ({ match, score: scoreMatch(match, tokens, normalizedQuery) }))
      .filter((entry) => entry.score >= 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          byBrowse(a.match, b.match) ||
          a.match.title.localeCompare(b.match.title),
      );

    return {
      matches: scored.slice(0, RESULT_LIMIT).map((entry) => entry.match),
      total: scored.length,
    };
  }, [activeSport, cards, deferredQuery]);

  const activeSportOption = sports.find((sport) => sport.id === activeSport) ?? null;
  const trimmedQuery = deferredQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  return (
    <div>
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_80%_at_20%_0%,rgba(255,53,77,0.11),transparent_60%),radial-gradient(50%_70%_at_95%_10%,rgba(91,75,255,0.06),transparent_60%)]"
        />
        <div className="container-app relative pb-9 pt-28 sm:pb-11 sm:pt-36">
          <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand">
            <Search className="size-3.5" aria-hidden="true" />
            Instant search
          </p>
          <h1 className="mt-3 font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.9] text-white">
            Find your match.
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Search every team, event and channel on the board. Results update as you type.
          </p>

          <div className="relative mt-7 max-w-2xl">
            <label htmlFor="match-search" className="sr-only">
              Search matches, teams and sports
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/35"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              id="match-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, events, sports…"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              aria-controls="search-results"
              className="h-14 w-full appearance-none rounded-2xl border border-white/12 bg-white/[0.045] pl-12 pr-24 text-[15px] font-medium text-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] outline-none backdrop-blur-sm transition-[border-color,background-color] placeholder:text-white/30 focus:border-brand/60 focus:bg-white/[0.06] sm:h-16 sm:text-base [&::-webkit-search-cancel-button]:hidden"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {query ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="grid size-11 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white sm:size-9"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : (
                <kbd className="hidden rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-sans text-[10px] font-semibold text-white/40 sm:inline-block">
                  /
                </kbd>
              )}
            </div>
          </div>
          <p className="mt-2.5 text-[11px] text-muted-dim">
            Press <span className="font-semibold text-white/55">/</span> anywhere to jump here ·{" "}
            <span className="font-semibold text-white/55">Esc</span> clears the field
          </p>
        </div>
      </section>

      <div className="container-app mt-6 sm:mt-8">
        <div
          role="group"
          aria-label="Filter by sport"
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1"
        >
          <button
            type="button"
            onClick={() => setSportFilter("all")}
            aria-pressed={activeSport === "all"}
            className={cn(
              "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors sm:h-9",
              activeSport === "all"
                ? "border-white/20 bg-white text-ink"
                : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
            )}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            All sports
            <span
              className={cn(
                "text-[11px] tabular-nums",
                activeSport === "all" ? "text-ink/50" : "text-white/30",
              )}
            >
              {cards.length}
            </span>
          </button>

          {sports.map((sport) => {
            const active = activeSport === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => setSportFilter(sport.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors sm:h-9",
                  active
                    ? "border-white/20 bg-white text-ink"
                    : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                )}
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: sport.accent }}
                />
                {sport.name}
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    active ? "text-ink/50" : "text-white/30",
                  )}
                >
                  {sport.count}
                </span>
              </button>
            );
          })}
        </div>

        {!feedOk ? (
          <div className="mt-6">
            <DataNotice
              title="The index may be incomplete"
              description="We couldn't refresh the match feed. You can still search the most recent snapshot while the signal recovers."
              retryHref="/search"
            />
          </div>
        ) : null}

        <div id="search-results" className="mt-7" aria-busy={pending}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="font-display text-xl uppercase tracking-[0.04em] text-white">
                {isSearching
                  ? `Results for “${trimmedQuery}”`
                  : activeSportOption
                    ? activeSportOption.name
                    : "On the board"}
              </h2>
              {pending ? (
                <Loader2 className="size-3.5 animate-spin-slow text-white/35" aria-hidden="true" />
              ) : null}
            </div>
            <p className="text-xs font-medium text-muted" aria-live="polite">
              {total === 0
                ? "No matches"
                : `${total} match${total === 1 ? "" : "es"}${total > RESULT_LIMIT ? ` · top ${RESULT_LIMIT}` : ""}`}
            </p>
          </div>

          {matches.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className="stagger-item"
                  style={{ "--i": Math.min(index, 9) } as CSSProperties}
                >
                  <MatchRow match={match} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-white/[0.07] bg-surface/55 px-6 py-14 text-center">
              <SearchX className="mx-auto size-7 text-white/25" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl uppercase tracking-wide text-white">
                {cards.length === 0 ? "The board is empty" : "No matches found"}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                {cards.length === 0
                  ? "No fixtures are listed right now. The schedule updates itself as soon as events are announced."
                  : isSearching
                    ? "Try a shorter search, another spelling, or clear the sport filter. Team names work best."
                    : "Nothing is listed for this sport right now."}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="inline-flex h-11 items-center rounded-full bg-brand px-4 text-xs font-bold text-white transition-colors hover:bg-[#ff4a60] sm:h-10"
                  >
                    Clear search
                  </button>
                ) : null}
                {activeSport !== "all" ? (
                  <button
                    type="button"
                    onClick={() => setSportFilter("all")}
                    className="inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-white/30 sm:h-10"
                  >
                    All sports
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {total > RESULT_LIMIT ? (
            <p className="mt-4 text-center text-[11px] text-muted-dim">
              Showing the {RESULT_LIMIT} closest matches. Refine your search to narrow it down.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
