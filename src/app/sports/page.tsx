import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Search, Trophy } from "lucide-react";
import { getSportsOverview } from "@/lib/ppv";
import { SportTiles } from "@/components/browse/SportTiles";
import { DataNotice } from "@/components/common/DataNotice";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Sports",
  description:
    "Browse every sport on Maidaan — live events, upcoming fixtures and dedicated 24/7 channels across football, basketball, tennis, cricket and more.",
  alternates: { canonical: "/sports" },
};

export default async function SportsPage() {
  const { ok, summaries, total } = await getSportsOverview();

  const decorated = summaries
    .map((summary) => ({
      ...summary,
      score: summary.live * 1000 + summary.upcoming * 10 + summary.total,
    }))
    .sort((a, b) => b.score - a.score || a.sport.name.localeCompare(b.sport.name));
  const active = decorated.filter((summary) => summary.total > 0);
  const quiet = decorated.filter((summary) => summary.total === 0);
  const liveEvents = summaries.reduce((sum, summary) => sum + summary.live, 0);
  const upcomingEvents = summaries.reduce((sum, summary) => sum + summary.upcoming, 0);
  const sportsInPlay = active.length;

  const stats = [
    { label: "Live now", value: liveEvents },
    { label: "Upcoming", value: upcomingEvents },
    { label: "Sports in play", value: sportsInPlay },
  ];

  return (
    <div className="pb-4">
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_15%_0%,rgba(255,53,77,0.11),transparent_60%),radial-gradient(60%_70%_at_100%_10%,rgba(91,75,255,0.06),transparent_60%)]"
        />
        <div className="container-app relative pb-10 pt-28 sm:pb-12 sm:pt-36">
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-brand">
                <Trophy className="size-3.5" aria-hidden="true" />
                The full line-up
              </p>
              <h1 className="mt-3 text-balance font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.9] text-white">
                Pick your arena.
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                {total > 0
                  ? `${total} events are on the board right now — from live nights to fixtures worth setting an alarm for.`
                  : "Browse every discipline on Maidaan. New events appear here as soon as the schedule drops."}
              </p>
            </div>

            <div className="mt-8 flex gap-2.5 sm:gap-3 lg:mt-0">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[7rem] flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm sm:min-w-[7.5rem] lg:flex-none"
                >
                  <p className="font-display text-[2rem] leading-none text-white tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container-app mt-8 space-y-10 sm:mt-10">
        {!ok ? (
          <DataNotice
            title="Some sport counts may be stale"
            description="We couldn't refresh the live feed. You can still browse the index while the signal recovers."
            retryHref="/sports"
          />
        ) : null}

        {active.length > 0 ? (
          <SportTiles summaries={active} />
        ) : (
          <div className="rounded-3xl border border-white/[0.07] bg-surface/55 px-6 py-16 text-center">
            <p className="font-display text-3xl uppercase tracking-wide text-white">
              Nothing in play yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
              The schedule is between events. Check the daily schedule for what&apos;s coming
              next.
            </p>
            <Link
              href="/schedule"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              View schedule
            </Link>
          </div>
        )}

        {quiet.length > 0 ? (
          <section aria-labelledby="quiet-sports">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-5 w-[4px] -skew-x-12 rounded-full bg-white/20"
              />
              <h2
                id="quiet-sports"
                className="font-display text-xl uppercase tracking-[0.06em] text-white/80"
              >
                Between events
              </h2>
            </div>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-muted">
              These sports have no fixtures on the board right now, but the next batch is never
              far away.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quiet.map(({ sport, total: count }) => (
                <Link
                  key={sport.id}
                  href={`/sports/${sport.id}`}
                  prefetch={false}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-[13px] font-semibold text-muted transition-colors hover:border-white/20 hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: sport.accent }}
                  />
                  {sport.name}
                  <span className="text-[11px] font-medium text-white/30 tabular-nums">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/50 px-6 py-8 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-brand/[0.08] blur-3xl"
          />
          <div className="relative">
            <p className="font-display text-2xl uppercase leading-none tracking-wide text-white">
              Know exactly who you&apos;re looking for?
            </p>
            <p className="mt-2 text-sm text-muted">
              Jump straight to a team, event or channel with instant search.
            </p>
          </div>
          <Link
            href="/search"
            className="group relative mt-5 inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 text-sm font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 sm:mt-0 sm:self-auto"
          >
            <Search className="size-4" aria-hidden="true" />
            Search matches
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </div>
  );
}
