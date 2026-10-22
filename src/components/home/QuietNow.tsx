import Link from "next/link";
import { ArrowRight, RadioTower } from "lucide-react";
import type { MatchView } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { formatCountdown } from "@/lib/format";
import { Countdown } from "@/components/match/Countdown";
import { TimeText } from "@/components/match/TimeText";

export function QuietNow({ nextMatch }: { nextMatch: MatchView | null }) {
  const sport = nextMatch ? getSport(nextMatch.category) : null;

  return (
    <section className="container-app" aria-label="No live matches">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/55 px-5 py-6 sm:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-24 size-64 rounded-full bg-brand/[0.09] blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(70%_90%_at_100%_50%,rgba(255,53,77,0.07),transparent_70%)] sm:block"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand">
              <RadioTower className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-2xl uppercase leading-none tracking-[0.03em] text-white">
                Stadiums are quiet
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                No live matches at this moment. The next fixture is already lined up — or pick a
                24/7 channel below.
              </p>
            </div>
          </div>

          {nextMatch && sport ? (
            <Link
              href={`/match/${encodeURIComponent(nextMatch.id)}`}
              prefetch={false}
              className="group flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 pr-4 transition-[border-color,background-color] duration-200 hover:border-white/20 hover:bg-white/[0.06] sm:max-w-xs"
            >
              <div className="min-w-0">
                <p
                  className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
                  style={{ color: sport.accent }}
                >
                  {sport.name} · Next up
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">{nextMatch.title}</p>
                <p className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                  <TimeText timestamp={nextMatch.date} variant="card" />
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand/12 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                    <Countdown target={nextMatch.date} initial={formatCountdown(nextMatch.date)} />
                  </span>
                </p>
              </div>
              <ArrowRight
                className="size-4 shrink-0 text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/70"
                aria-hidden="true"
              />
            </Link>
          ) : (
            <Link
              href="/sports"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand sm:self-auto"
            >
              Browse sports
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
