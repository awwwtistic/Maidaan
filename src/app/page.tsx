import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, RadioTower, Trophy } from "lucide-react";
import type { MatchView } from "@/lib/types";
import { getHomeData } from "@/lib/streamed";
import { Hero } from "@/components/home/Hero";
import { QuietNow } from "@/components/home/QuietNow";
import { Rail } from "@/components/home/Rail";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, STREAMED_URL } from "@/lib/site";

export const revalidate = 30;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

function withoutFeatured(matches: MatchView[], featured: MatchView | null): MatchView[] {
  if (!featured) return matches;
  return matches.filter((match) => match.id !== featured.id);
}

export default async function HomePage() {
  const data = await getHomeData();

  if (!data.featured) {
    const failed = !data.ok;
    return (
      <div className="container-app flex min-h-[74svh] max-w-3xl flex-col justify-center pb-20 pt-32 sm:pt-40">
        <span className="mb-6 grid size-12 place-items-center rounded-2xl border border-brand/25 bg-brand/[0.08] text-brand">
          <RadioTower className="size-6" aria-hidden="true" />
        </span>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand">
          {failed ? "Signal interrupted" : "No fixtures scheduled"}
        </p>
        <h1 className="mt-3 font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.92] text-white">
          {failed ? "Off the air" : "The league is quiet"}
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
          {failed
            ? "We couldn't reach the live sports feed just now. Try again in a moment, or check the source directly."
            : "Nothing is on the schedule right now. New fixtures land throughout the day, so check back soon or explore the sports index."}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
          >
            Try again
          </Link>
          <Link
            href="/sports"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
          >
            Browse sports
            <Trophy className="size-4" aria-hidden="true" />
          </Link>
          {failed ? (
            <a
              href={STREAMED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:text-white"
            >
              Check Streamed
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  const featured = data.featured;
  const liveRail = withoutFeatured(data.live, featured);
  const upcomingRail = withoutFeatured(data.upcoming, featured);
  const channelRail = withoutFeatured(data.channels, featured);
  const sportRails = data.sportRails
    .map((rail) => ({ ...rail, matches: withoutFeatured(rail.matches, featured) }))
    .filter((rail) => rail.matches.length > 0);

  return (
    <div className="pb-2">
      <Hero match={featured} />

      <div className="space-y-12 sm:space-y-16">
        {data.live.length === 0 ? <QuietNow nextMatch={data.nextMatch} /> : null}

        {liveRail.length > 0 ? (
          <Rail
            title="Live now"
            eyebrow="Right now"
            matches={liveRail}
            linkLabel="All sports"
            href="/sports"
          />
        ) : null}

        {upcomingRail.length > 0 ? (
          <Rail
            title="Up next"
            eyebrow="On the horizon"
            matches={upcomingRail}
            href="/schedule"
            linkLabel="Full schedule"
          />
        ) : null}

        {channelRail.length > 0 ? (
          <Rail title="Always on" eyebrow="Nonstop channels" matches={channelRail} />
        ) : null}

        {sportRails.map((rail) => (
          <Rail
            key={rail.sport.id}
            title={rail.sport.name}
            eyebrow={rail.sport.blurb}
            matches={rail.matches}
            href={`/sports/${rail.sport.id}`}
            linkLabel="Explore"
          />
        ))}

        <section className="container-app">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-surface/55 px-6 py-10 sm:px-10 sm:py-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-28 size-[26rem] rounded-full bg-brand/[0.1] blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 16px)",
              }}
            />
            <div className="relative lg:flex lg:items-end lg:justify-between lg:gap-12">
              <div className="max-w-xl">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand">
                  Beyond the headline act
                </p>
                <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] uppercase leading-[0.95] text-white">
                  There&apos;s always another game on.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  From courtside basketball to early-morning cricket — browse every sport and
                  find the fixture that fits your night.
                </p>
              </div>
              <Link
                href="/sports"
                className="group mt-6 inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full bg-white px-6 text-sm font-bold text-ink transition-transform duration-200 hover:-translate-y-0.5 lg:mt-0"
              >
                Explore all sports
                <Trophy className="size-4 transition-transform duration-200 group-hover:-rotate-6" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
