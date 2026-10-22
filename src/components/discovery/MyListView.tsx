"use client";

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, Info, Search } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { MatchCard } from "@/components/match/MatchCard";
import { Skeleton } from "@/components/common/Skeleton";
import { plural } from "@/lib/utils";

function SavedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function MyListView({
  liveIds,
  feedOk = true,
}: {
  liveIds: string[] | null;
  feedOk?: boolean;
}) {
  const favorites = useFavorites();

  const items = useMemo(() => {
    if (!favorites) return null;
    if (!liveIds) return favorites;
    const live = new Set(liveIds);
    return favorites.map((match) => {
      const isLive = live.has(match.id);
      return isLive === match.isLive ? match : { ...match, isLive };
    });
  }, [favorites, liveIds]);

  const liveCount = items?.filter((match) => match.isLive).length ?? 0;

  return (
    <div className="pb-6">
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_85%_at_12%_0%,rgba(255,53,77,0.11),transparent_60%),radial-gradient(55%_70%_at_100%_8%,rgba(91,75,255,0.07),transparent_60%)]"
        />
        <div className="container-app relative pb-9 pt-28 sm:pb-11 sm:pt-36">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand">
                <Heart className="size-3.5" aria-hidden="true" />
                Your collection
              </p>
              <h1 className="mt-3 text-balance font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.9] text-white">
                Saved for later.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                The matches you&apos;re not ready to miss. Kept on this device, no account
                needed — tap the heart on any poster to add it here.
              </p>
            </div>

            <div className="mt-8 flex gap-2.5 sm:gap-3 lg:mt-0">
              <div className="min-w-[7rem] flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm sm:min-w-[7.5rem] lg:flex-none">
                <Heart className="size-4 text-brand" aria-hidden="true" />
                {items === null ? (
                  <Skeleton className="mt-2 h-[30px] w-12" />
                ) : (
                  <p className="mt-2 font-display text-[1.9rem] leading-none text-white tabular-nums">
                    {items.length}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  Saved
                </p>
              </div>
              <div className="min-w-[7rem] flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm sm:min-w-[7.5rem] lg:flex-none">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                  <span className="size-1.5 rounded-full bg-brand animate-live-dot" aria-hidden="true" />
                  On air
                </span>
                {items === null ? (
                  <Skeleton className="mt-2 h-[30px] w-12" />
                ) : (
                  <p className="mt-2 font-display text-[1.9rem] leading-none text-white tabular-nums">
                    {liveCount}
                  </p>
                )}
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  Live now
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app mt-8 sm:mt-10">
        {items === null ? (
          <div aria-busy="true" aria-label="Loading your list">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="mt-5">
              <SavedSkeleton />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-surface/60 px-6 py-16 text-center sm:px-10 sm:py-20">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-64 w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
            />
            <div className="relative mx-auto mb-6 grid size-14 place-items-center rounded-2xl border border-brand/25 bg-brand/10 text-brand">
              <Heart className="size-6" aria-hidden="true" />
            </div>
            <h2 className="relative font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
              Your list is waiting
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
              Save any match with the heart on its poster and it will be here the next time
              you open the app. Everything stays in this browser.
            </p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-2.5">
              <Link
                href="/sports"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
              >
                Browse sports
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/schedule"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
              >
                <CalendarDays className="size-4" aria-hidden="true" />
                Open schedule
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-6 w-[5px] shrink-0 -skew-x-12 rounded-full bg-brand shadow-[0_0_18px_rgba(255,53,77,0.45)]"
                />
                <h2 className="font-display text-[24px] uppercase leading-none tracking-[0.04em] text-white sm:text-[28px]">
                  Your watchlist
                </h2>
                <span className="mb-0.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted">
                  {items.length}
                </span>
              </div>
              <p className="text-xs font-medium text-muted">
                {plural(items.length, "match", "matches")} · newest first
              </p>
            </div>

            {!feedOk ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-muted-dim">
                <Info className="size-3.5" aria-hidden="true" />
                Live status may be out of date while the feed recovers.
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((match, index) => (
                <div
                  key={match.id}
                  className="stagger-item"
                  style={{ "--i": Math.min(index, 9) } as CSSProperties}
                >
                  <MatchCard match={match} />
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
              <div>
                <p className="font-display text-xl uppercase tracking-wide text-white">
                  Looking for something else?
                </p>
                <p className="mt-1 text-sm text-muted">
                  Search the full board or save a few more from the schedule.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-center gap-2.5">
                <Link
                  href="/search"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 sm:h-10"
                >
                  <Search className="size-3.5" aria-hidden="true" />
                  Search
                </Link>
                <Link
                  href="/schedule"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-white/30 sm:h-10"
                >
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Schedule
                </Link>
              </div>
            </div>
          </>
        )}

        <p className="mt-8 inline-flex items-center gap-1.5 text-[11px] text-muted-dim">
          <Info className="size-3.5" aria-hidden="true" />
          Your list lives in this browser. Clearing site data will remove it.
        </p>
      </div>
    </div>
  );
}
