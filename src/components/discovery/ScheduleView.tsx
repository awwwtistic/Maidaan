"use client";

import {
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarX2,
  Clock3,
  RadioTower,
  SlidersHorizontal,
} from "lucide-react";
import type { CardMatch } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { formatCountdown } from "@/lib/format";
import { cn, plural } from "@/lib/utils";
import { Countdown } from "@/components/match/Countdown";
import { MatchRow } from "@/components/match/MatchRow";
import { PosterFrame } from "@/components/match/PosterFrame";
import { TeamBadge } from "@/components/match/TeamBadge";
import { TimeText } from "@/components/match/TimeText";
import { DataNotice } from "@/components/common/DataNotice";

const DAY_MS = 86_400_000;
const subscribe = () => () => {};

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function zoneKey(timestamp: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date(timestamp));
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "1970";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function dayMeta(timestamp: number, now: number, locale: string | undefined, timeZone: string) {
  const date = new Date(timestamp);
  const today = zoneKey(now, timeZone);
  const day = zoneKey(timestamp, timeZone);
  const offset = Math.round(
    (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS,
  );

  return {
    key: day,
    label:
      offset === 0
        ? "Today"
        : offset === 1
          ? "Tomorrow"
          : new Intl.DateTimeFormat(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              timeZone,
            }).format(date),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone }).format(date),
    short: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone }).format(
      date,
    ),
  };
}

function byKickoff(a: CardMatch, b: CardMatch): number {
  return a.date - b.date;
}

interface DayGroup {
  key: string;
  label: string;
  weekday: string;
  short: string;
  matches: CardMatch[];
}

function MatchRows({ matches }: { matches: CardMatch[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      {matches.map((match, index) => (
        <div
          key={match.id}
          className="stagger-item"
          style={{ "--i": Math.min(index, 8) } as CSSProperties}
        >
          <MatchRow match={match} />
        </div>
      ))}
    </div>
  );
}

export function ScheduleView({
  cards,
  generatedAt,
  feedOk = true,
}: {
  cards: CardMatch[];
  generatedAt: number;
  feedOk?: boolean;
}) {
  const [sportFilter, setSportFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const hydrated = useHydrated();

  const timeZone = hydrated
    ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
    : "UTC";
  const locale = hydrated ? undefined : "en-GB";
  const now = generatedAt;

  const sports = useMemo(() => {
    const map = new Map<string, { id: string; name: string; accent: string; count: number }>();
    for (const match of cards) {
      const sport = getSport(match.category);
      const existing = map.get(sport.id);
      if (existing) existing.count += 1;
      else map.set(sport.id, { id: sport.id, name: sport.name, accent: sport.accent, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [cards]);

  const activeSport = sports.some((sport) => sport.id === sportFilter) ? sportFilter : "all";

  const filtered = useMemo(
    () =>
      activeSport === "all" ? cards : cards.filter((match) => match.category === activeSport),
    [activeSport, cards],
  );

  const upcoming = useMemo(
    () =>
      filtered
        .filter((match) => !match.isAlwaysOn && !match.isLive)
        .sort(byKickoff),
    [filtered],
  );

  const live = useMemo(
    () => filtered.filter((match) => match.isLive).sort(byKickoff),
    [filtered],
  );

  const channels = useMemo(
    () =>
      filtered
        .filter((match) => match.isAlwaysOn)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [filtered],
  );

  const nextMatch = useMemo(
    () =>
      cards
        .filter((match) => !match.isAlwaysOn && !match.isLive)
        .sort(byKickoff)[0] ?? null,
    [cards],
  );

  const groups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, CardMatch[]>();
    for (const match of upcoming) {
      const key = zoneKey(match.date, timeZone);
      const list = map.get(key);
      if (list) list.push(match);
      else map.set(key, [match]);
    }
    return [...map.values()].map((matches) => ({
      matches,
      ...dayMeta(matches[0].date, now, locale, timeZone),
    }));
  }, [upcoming, now, locale, timeZone]);

  const activeDay = groups.some((group) => group.key === dayFilter) ? dayFilter : "all";
  const visibleGroups = activeDay === "all" ? groups : groups.filter((g) => g.key === activeDay);
  const totalVisible = visibleGroups.reduce((sum, group) => sum + group.matches.length, 0);

  const liveCount = cards.filter((match) => match.isLive).length;
  const upcomingCount = cards.filter((match) => !match.isAlwaysOn && !match.isLive).length;
  const channelCount = cards.filter((match) => match.isAlwaysOn).length;

  const nextSport = nextMatch ? getSport(nextMatch.category) : null;

  return (
    <div className="pb-6">
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_85%_at_15%_0%,rgba(255,53,77,0.1),transparent_60%),radial-gradient(55%_70%_at_100%_10%,rgba(91,75,255,0.06),transparent_60%)]"
        />
        <div className="container-app relative pb-9 pt-28 sm:pb-11 sm:pt-36">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                The schedule
              </p>
              <h1 className="mt-3 text-balance font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.9] text-white">
                Plan the next watch.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                Every upcoming fixture and always-on channel, grouped by your local day.
                Find a kickoff, clear your evening, press play.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium text-muted-dim">
                <Clock3 className="size-3.5" aria-hidden="true" />
                All kickoff times follow your device&apos;s time zone.
              </p>
            </div>

            <div className="mt-8 flex gap-2.5 sm:gap-3 lg:mt-0">
              {[
                { label: "Upcoming", value: upcomingCount, icon: CalendarDays, accent: "#FF354D" },
                { label: "Live now", value: liveCount, icon: RadioTower, accent: "#4ADE80" },
                { label: "24/7", value: channelCount, icon: Clock3, accent: "#60A5FA" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="min-w-[6.5rem] flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm sm:min-w-[7rem] lg:flex-none"
                  >
                    <Icon className="size-4 opacity-70" style={{ color: stat.accent }} aria-hidden="true" />
                    <p className="mt-2 font-display text-[1.9rem] leading-none text-white tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="container-app mt-9 space-y-9 sm:mt-10">
        {!feedOk ? (
          <DataNotice
            title="The schedule may be out of date"
            description="We couldn't refresh the fixture feed. This is the most recent snapshot — it will repair itself automatically."
            retryHref="/schedule"
          />
        ) : null}

        {nextMatch && nextSport ? (
          <section
            aria-label="Next match"
            className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/55 p-3 sm:p-4"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-brand/[0.09] blur-3xl"
            />
            <div className="relative flex items-center gap-4">
              <Link
                href={`/match/${encodeURIComponent(nextMatch.id)}`}
                prefetch={false}
                className="relative hidden aspect-video w-36 shrink-0 overflow-hidden rounded-xl sm:block md:w-44"
                tabIndex={-1}
                aria-hidden="true"
              >
                <PosterFrame
                  posterUrl={nextMatch.posterUrl}
                  title={nextMatch.title}
                  category={nextMatch.category}
                  className="h-full w-full"
                  sizes="(min-width: 768px) 176px, 144px"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-brand">
                  <span className="size-1.5 rounded-full bg-brand animate-live-dot" aria-hidden="true" />
                  Next kickoff
                  <span className="text-white/20" aria-hidden="true">
                    /
                  </span>
                  <span style={{ color: nextSport.accent }}>{nextSport.name}</span>
                </p>
                <Link
                  href={`/match/${encodeURIComponent(nextMatch.id)}`}
                  prefetch={false}
                  className="mt-1.5 block truncate font-display text-[1.45rem] uppercase leading-none tracking-[0.02em] text-white transition-colors hover:text-white/80 sm:text-[1.7rem]"
                >
                  {nextMatch.title}
                </Link>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-muted">
                  {nextMatch.homeName || nextMatch.awayName ? (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="flex -space-x-1.5">
                        <TeamBadge name={nextMatch.homeName} badgeUrl={nextMatch.homeBadge} size={18} />
                        <TeamBadge name={nextMatch.awayName} badgeUrl={nextMatch.awayBadge} size={18} />
                      </span>
                      <span className="truncate">
                        {nextMatch.homeName ?? "TBD"}{" "}
                        <span className="text-white/30">vs</span> {nextMatch.awayName ?? "TBD"}
                      </span>
                    </span>
                  ) : null}
                  <TimeText timestamp={nextMatch.date} variant="card" className="text-white/70" />
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold tabular-nums text-white/80">
                    <Clock3 className="size-3 text-brand" aria-hidden="true" />
                    <Countdown
                      target={nextMatch.date}
                      initial={formatCountdown(nextMatch.date, now)}
                    />
                  </span>
                </div>
              </div>

              <Link
                href={`/match/${encodeURIComponent(nextMatch.id)}`}
                prefetch={false}
                className="group hidden h-10 shrink-0 items-center gap-2 self-center rounded-full border border-white/12 bg-white/[0.04] px-4 text-xs font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.08] sm:inline-flex"
              >
                Match details
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>
        ) : null}

        {cards.length === 0 ? (
          <div className="rounded-3xl border border-white/[0.07] bg-surface/55 px-6 py-16 text-center">
            <CalendarX2 className="mx-auto size-7 text-white/25" aria-hidden="true" />
            <p className="mt-4 font-display text-3xl uppercase tracking-wide text-white">
              The calendar is clear
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
              No fixtures are listed right now. The feed refreshes through the day — check
              the sports index in the meantime.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link
                href="/sports"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
              >
                Browse sports
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/search"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
              >
                Search matches
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-3.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35">
                  <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                  Sport
                </span>
                <div
                  role="group"
                  aria-label="Filter schedule by sport"
                  className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-0.5"
                >
                  <button
                    type="button"
                    onClick={() => setSportFilter("all")}
                    aria-pressed={activeSport === "all"}
                    className={cn(
                      "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors sm:h-9",
                      activeSport === "all"
                        ? "border-white/20 bg-white text-ink"
                        : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                    )}
                  >
                    All sports
                    <span
                      className={cn(
                        "text-[10px] tabular-nums",
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
                          "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition-colors sm:h-9",
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
                            "text-[10px] tabular-nums",
                            active ? "text-ink/50" : "text-white/30",
                          )}
                        >
                          {sport.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {groups.length > 0 ? (
                <div className="mt-2.5 flex items-center gap-3 border-t border-white/[0.05] pt-2.5">
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/35">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    Days
                  </span>
                  <div
                    role="group"
                    aria-label="Filter schedule by day"
                    className="no-scrollbar flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => setDayFilter("all")}
                      aria-pressed={activeDay === "all"}
                      className={cn(
                        "inline-flex h-11 shrink-0 items-center rounded-full border px-3.5 text-[12px] font-semibold transition-colors sm:h-9",
                        activeDay === "all"
                          ? "border-brand/40 bg-brand/15 text-white"
                          : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                      )}
                    >
                      All days
                      <span className="ml-2 text-[10px] tabular-nums text-white/35">
                        {upcoming.length}
                      </span>
                    </button>
                    {groups.map((group) => {
                      const active = activeDay === group.key;
                      return (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => setDayFilter(group.key)}
                          aria-pressed={active}
                          className={cn(
                            "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors sm:h-9",
                            active
                              ? "border-brand/40 bg-brand/15 text-white"
                              : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                          )}
                        >
                          <span className="text-[10px] uppercase tracking-wide text-white/40">
                            {group.weekday}
                          </span>
                          {group.short}
                          <span className="text-[10px] tabular-nums text-white/30">
                            {group.matches.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            {live.length > 0 ? (
              <section aria-labelledby="schedule-live">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-6 w-[5px] shrink-0 -skew-x-12 rounded-full bg-brand shadow-[0_0_18px_rgba(255,53,77,0.45)]"
                    />
                    <h2
                      id="schedule-live"
                      className="font-display text-[24px] uppercase leading-none tracking-[0.04em] text-white sm:text-[28px]"
                    >
                      Live now
                    </h2>
                    <span className="mb-0.5 rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-brand">
                      {live.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted">On the air this minute</p>
                </div>
                <div className="mt-4">
                  <MatchRows matches={live} />
                </div>
              </section>
            ) : null}

            <section aria-labelledby="schedule-upcoming">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-6 w-[5px] shrink-0 -skew-x-12 rounded-full bg-white/20"
                  />
                  <h2
                    id="schedule-upcoming"
                    className="font-display text-[24px] uppercase leading-none tracking-[0.04em] text-white sm:text-[28px]"
                  >
                    Upcoming
                  </h2>
                  <span className="mb-0.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted">
                    {totalVisible}
                  </span>
                </div>
                <p className="text-xs text-muted" aria-live="polite">
                  {activeDay === "all"
                    ? `${plural(upcoming.length, "fixture")} ahead`
                    : "Showing one day"}
                </p>
              </div>

              {visibleGroups.length > 0 ? (
                <div className="mt-5 space-y-7">
                  {visibleGroups.map((group) => (
                    <div key={group.key}>
                      <div className="mb-3 flex items-center gap-3">
                        <h3 className="font-display text-lg uppercase tracking-[0.06em] text-white/85">
                          {group.label}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="h-px flex-1 bg-gradient-to-r from-white/12 to-transparent"
                        />
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-dim">
                          {plural(group.matches.length, "match", "matches")}
                        </span>
                      </div>
                      <MatchRows matches={group.matches} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-6 py-12 text-center">
                  <CalendarDays className="mx-auto size-6 text-white/25" aria-hidden="true" />
                  <p className="mt-3 font-display text-2xl uppercase tracking-wide text-white">
                    Nothing lined up here
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                    {activeSport === "all"
                      ? "There are no upcoming fixtures on the board right now."
                      : "This sport has no upcoming fixtures on the board right now."}
                    {channels.length > 0
                      ? " The always-on channels are still down below."
                      : ""}
                  </p>
                  {activeSport !== "all" ? (
                    <button
                      type="button"
                      onClick={() => setSportFilter("all")}
                      className="mt-5 inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-white/30 sm:h-10"
                    >
                      All sports
                    </button>
                  ) : null}
                </div>
              )}
            </section>

            {channels.length > 0 ? (
              <section aria-labelledby="schedule-channels">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-6 w-[5px] shrink-0 -skew-x-12 rounded-full bg-brand"
                    />
                    <h2
                      id="schedule-channels"
                      className="font-display text-[24px] uppercase leading-none tracking-[0.04em] text-white sm:text-[28px]"
                    >
                      Always on
                    </h2>
                    <span className="mb-0.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted">
                      {channels.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted">24/7 channels that never leave the board</p>
                </div>
                <div className="mt-4">
                  <MatchRows matches={channels} />
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
