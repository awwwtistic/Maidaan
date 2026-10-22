"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ChevronDown, RadioTower } from "lucide-react";
import type { CardMatch } from "@/lib/types";
import { MatchCard } from "@/components/match/MatchCard";
import { cn } from "@/lib/utils";

type FilterId = "all" | "live" | "upcoming" | "channels";

const PAGE_SIZE = 30;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "channels", label: "24/7" },
];

const EMPTY: Record<FilterId, number> = { all: 0, live: 0, upcoming: 0, channels: 0 };

export function SportBrowser({ matches }: { matches: CardMatch[] }) {
  const [filter, setFilter] = useState<FilterId>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const counts = useMemo(() => {
    const next = { ...EMPTY, all: matches.length };
    for (const match of matches) {
      if (match.isLive) next.live += 1;
      else if (match.isAlwaysOn) next.channels += 1;
      else next.upcoming += 1;
    }
    return next;
  }, [matches]);

  const filtered = useMemo(() => {
    if (filter === "all") return matches;
    if (filter === "live") return matches.filter((match) => match.isLive);
    if (filter === "channels") return matches.filter((match) => match.isAlwaysOn);
    return matches.filter((match) => !match.isLive && !match.isAlwaysOn);
  }, [filter, matches]);

  const shown = filtered.slice(0, visible);
  const available = FILTERS.filter((entry) => entry.id === "all" || counts[entry.id] > 0);

  const changeFilter = (next: FilterId) => {
    setFilter(next);
    setVisible(PAGE_SIZE);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter matches"
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1"
        >
          {available.map((entry) => {
            const active = filter === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => changeFilter(entry.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-[border-color,background-color,color] duration-200 sm:h-9",
                  active
                    ? "border-white/20 bg-white text-ink"
                    : "border-white/[0.09] bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                )}
              >
                {entry.id === "live" && counts.live > 0 ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-1.5 rounded-full",
                      active ? "bg-brand" : "bg-brand animate-live-dot",
                    )}
                  />
                ) : null}
                {entry.label}
                <span
                  className={cn(
                    "text-[11px] tabular-nums",
                    active ? "text-ink/50" : "text-white/30",
                  )}
                >
                  {counts[entry.id]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium text-muted" aria-live="polite">
          {filtered.length > 0
            ? `${visible < filtered.length ? Math.min(visible, filtered.length) : filtered.length} of ${filtered.length} events`
            : "No events"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-white/[0.07] bg-surface/50 px-6 py-14 text-center">
          <RadioTower className="mx-auto size-7 text-white/25" aria-hidden="true" />
          <p className="mt-4 font-display text-2xl uppercase tracking-wide text-white">
            Nothing in this lane
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            There are no events matching this filter right now.
          </p>
          <button
            type="button"
            onClick={() => changeFilter("all")}
            className="mt-5 inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-brand hover:text-brand sm:h-10"
          >
            Show all events
          </button>
        </div>
      ) : (
        <>
          <div
            key={filter}
            className="mt-6 grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {shown.map((match, index) => (
              <div
                key={match.id}
                className="stagger-item"
                style={{ "--i": Math.min(index % PAGE_SIZE, 9) } as CSSProperties}
              >
                <MatchCard match={match} />
              </div>
            ))}
          </div>

          {visible < filtered.length ? (
            <div className="mt-9 flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setVisible((current) => current + PAGE_SIZE)}
                className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white transition-colors hover:border-white/30 hover:bg-white/[0.07]"
              >
                Load more
                <ChevronDown
                  className="size-4 text-white/50 transition-transform duration-200 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
              <p className="text-[11px] text-muted-dim">
                {filtered.length - shown.length} more to go
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
