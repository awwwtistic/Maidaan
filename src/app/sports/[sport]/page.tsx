import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, RadioTower, Trophy } from "lucide-react";
import { SPORTS, getSport, isKnownSport } from "@/lib/sports";
import { getSportPageData } from "@/lib/streamed";
import { toCards } from "@/lib/match";
import { SportBrowser } from "@/components/browse/SportBrowser";
import { DataNotice } from "@/components/common/DataNotice";
import { EmptyState } from "@/components/common/EmptyState";
import { TimeText } from "@/components/match/TimeText";

export const revalidate = 30;

export function generateStaticParams() {
  return SPORTS.map((sport) => ({ sport: sport.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: sportId } = await params;
  if (!isKnownSport(sportId)) {
    return { title: "Sport not found", robots: { index: false } };
  }
  const sport = getSport(sportId);
  return {
    title: `${sport.name} streams`,
    description: `Live ${sport.name.toLowerCase()} streams, upcoming fixtures and always-on channels on Maidaan.`,
    alternates: { canonical: `/sports/${sport.id}` },
  };
}

export default async function SportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport: sportId } = await params;
  if (!isKnownSport(sportId)) notFound();

  const { ok, sport, matches } = await getSportPageData(sportId);
  const live = matches.filter((match) => match.isLive).length;
  const channels = matches.filter((match) => match.isAlwaysOn).length;
  const upcoming = matches.filter((match) => !match.isLive && !match.isAlwaysOn);
  const nextMatch = upcoming[0] ?? null;
  const cards = toCards(matches);

  return (
    <div className="pb-4">
      <header className="relative overflow-hidden border-b border-white/[0.06]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(80% 100% at 8% 0%, ${sport.accent}1a 0%, transparent 58%), radial-gradient(60% 80% at 100% 0%, rgba(255,53,77,0.06), transparent 60%)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 16px)",
          }}
        />

        <div className="container-app relative pb-9 pt-28 sm:pt-36">
          <Link
            href="/sports"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-white"
          >
            <span className="grid size-7 place-items-center rounded-full border border-white/10 transition-colors group-hover:border-white/25">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </span>
            All sports
          </Link>

          <div className="mt-7 lg:flex lg:items-end lg:justify-between lg:gap-12">
            <div className="min-w-0">
              <p
                className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: sport.accent }}
              >
                <span
                  aria-hidden="true"
                  className="h-3 w-[3px] -skew-x-12 rounded-full"
                  style={{ backgroundColor: sport.accent }}
                />
                {sport.blurb}
              </p>
              <h1
                id="sport-title"
                className="mt-2 text-balance font-display text-[clamp(3rem,9vw,6rem)] uppercase leading-[0.9] tracking-[0.01em] text-white"
              >
                {sport.name}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                Every {sport.name.toLowerCase()} event on the board — live action, upcoming
                fixtures and channels that never stop.
              </p>

              {nextMatch ? (
                <Link
                  href={`/match/${encodeURIComponent(nextMatch.id)}`}
                  prefetch={false}
                  className="mt-5 inline-flex max-w-full items-center gap-3 rounded-full border border-white/[0.09] bg-white/[0.03] py-1.5 pl-3.5 pr-4 text-xs font-medium text-muted backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/45">
                    Next up
                  </span>
                  <TimeText timestamp={nextMatch.date} variant="card" className="text-white/80" />
                  <span aria-hidden="true" className="hidden h-3 w-px bg-white/15 sm:block" />
                  <span className="hidden max-w-[18rem] truncate sm:block">{nextMatch.title}</span>
                </Link>
              ) : null}
            </div>

            <div className="mt-8 flex gap-2.5 sm:gap-3 lg:mt-0">
              {[
                { label: "Live now", value: live, icon: RadioTower },
                { label: "Upcoming", value: upcoming.length, icon: CalendarDays },
                { label: "24/7", value: channels, icon: Trophy },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="min-w-[6.5rem] flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm sm:min-w-[7rem] lg:flex-none"
                  >
                    <Icon className="size-4 opacity-60" style={{ color: sport.accent }} aria-hidden="true" />
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

      <div className="container-app mt-8 sm:mt-10">
        {!ok ? (
          <div className="mb-6">
            <DataNotice
              title="The board may be out of date"
              description="We couldn't refresh this sport just now. Showing the most recent snapshot we have."
              retryHref={`/sports/${sport.id}`}
            />
          </div>
        ) : null}

        {cards.length > 0 ? (
          <SportBrowser matches={cards} />
        ) : (
          <EmptyState
            icon={<CalendarDays className="size-5" aria-hidden="true" />}
            title="No events on the board"
            description={`There are no ${sport.name.toLowerCase()} fixtures listed at the moment. The schedule fills up through the day — try the full schedule or another sport.`}
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/schedule"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  View schedule
                </Link>
                <Link
                  href="/sports"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
                >
                  All sports
                </Link>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
