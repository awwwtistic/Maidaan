import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Info,
  Play,
  RadioTower,
  Trophy,
  Tv,
} from "lucide-react";
import { getMatchPageData } from "@/lib/streamed";
import { getSport } from "@/lib/sports";
import { formatCountdown } from "@/lib/format";
import { toCard } from "@/lib/match";
import { Countdown } from "@/components/match/Countdown";
import { FavoriteButton } from "@/components/match/FavoriteButton";
import { PosterFrame } from "@/components/match/PosterFrame";
import { ShareButton } from "@/components/match/ShareButton";
import { StatusPill } from "@/components/match/StatusPill";
import { TeamBadge } from "@/components/match/TeamBadge";
import { TimeText } from "@/components/match/TimeText";
import { Rail } from "@/components/home/Rail";

export const revalidate = 30;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getMatchPageData(id);
  if (result.status !== "ok") {
    return { title: "Match", robots: { index: false } };
  }

  const { match } = result.data;
  const sport = getSport(match.category);
  const description = match.isAlwaysOn
    ? `${match.title} — an always-on ${sport.name.toLowerCase()} channel streaming 24/7 on Maidaan.`
    : `${match.title} — ${sport.name} on Maidaan. Fixture details, start time and available streams.`;
  const images = match.posterUrl
    ? [{ url: match.posterUrl, width: 444, height: 250, alt: match.title }]
    : undefined;

  return {
    title: match.title,
    description,
    alternates: { canonical: `/match/${encodeURIComponent(match.id)}` },
    openGraph: {
      type: "website",
      title: match.title,
      description,
      url: `/match/${encodeURIComponent(match.id)}`,
      images,
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: match.title,
      description,
      images: match.posterUrl ? [match.posterUrl] : undefined,
    },
  };
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getMatchPageData(id);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    throw new Error("The match feed is unavailable");
  }

  const { match, related } = result.data;
  const sport = getSport(match.category);
  const card = toCard(match);
  const home = match.teams?.home ?? null;
  const away = match.teams?.away ?? null;
  const hasTeams = Boolean(home || away);
  const hasStreams = match.sources.length > 0;
  const watchHref = `/watch/${encodeURIComponent(match.id)}`;
  const phase = match.isLive ? "Live now" : match.isAlwaysOn ? "24/7 channel" : "Scheduled";
  const primaryLabel = match.isLive ? "Watch live" : match.isAlwaysOn ? "Watch channel" : "Watch";

  const details = [
    {
      label: "Competition",
      value: sport.name,
      icon: Trophy,
    },
    {
      label: match.isAlwaysOn ? "Broadcast" : "Kickoff",
      value: match.isAlwaysOn ? (
        "Always on"
      ) : (
        <TimeText timestamp={match.date} variant="full" />
      ),
      icon: CalendarDays,
    },
    {
      label: "Availability",
      value: hasStreams
        ? `${match.sources.length} ${match.sources.length === 1 ? "source" : "sources"}`
        : "Awaiting streams",
      icon: Tv,
    },
  ];

  return (
    <div className="pb-4">
      <section
        aria-labelledby="match-title"
        className="relative isolate overflow-hidden border-b border-white/[0.06]"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          {match.posterUrl ? (
            <Image
              src={match.posterUrl}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="object-cover opacity-30 blur-2xl saturate-[1.2]"
            />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(75% 90% at 78% 0%, ${sport.accent}26 0%, transparent 62%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
        </div>

        <div className="container-app relative pb-10 pt-28 sm:pb-14 sm:pt-36">
          <Link
            href={`/sports/${sport.id}`}
            prefetch={false}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-white"
          >
            <span className="grid size-7 place-items-center rounded-full border border-white/10 transition-colors group-hover:border-white/25">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
            </span>
            {sport.name}
          </Link>

          <div className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
            <div className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-6 rounded-[2.75rem] opacity-70 blur-3xl"
                style={{
                  background: `radial-gradient(55% 55% at 50% 50%, ${sport.accent}26, transparent 72%)`,
                }}
              />
              <div className="relative rounded-[1.6rem] border border-white/12 bg-white/[0.045] p-1.5 shadow-[0_36px_90px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm sm:p-2">
                <div className="relative aspect-video overflow-hidden rounded-[1.2rem]">
                  <PosterFrame
                    posterUrl={match.posterUrl}
                    title={match.title}
                    category={match.category}
                    className="h-full w-full"
                    sizes="(min-width: 1024px) 52vw, 92vw"
                    priority
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3.5 sm:p-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white backdrop-blur-md"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full"
                        style={{
                          backgroundColor: match.isLive
                            ? "#ff354d"
                            : match.isAlwaysOn
                              ? "#34d399"
                              : sport.accent,
                        }}
                      />
                      {phase}
                    </span>
                    {hasStreams ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
                        <Tv className="size-3" aria-hidden="true" />
                        {match.sources.length} feeds
                      </span>
                    ) : null}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5 sm:p-5">
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
                        style={{ color: sport.accent }}
                      >
                        {sport.name}
                      </p>
                      <p className="mt-1 truncate font-display text-xl uppercase leading-none tracking-wide text-white sm:text-2xl">
                        {match.title}
                      </p>
                    </div>
                    {hasStreams ? (
                      <Link
                        href={watchHref}
                        aria-label={`${primaryLabel}: ${match.title}`}
                        className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink shadow-2xl transition-transform duration-200 hover:scale-105"
                      >
                        <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                <span style={{ color: sport.accent }}>{sport.name}</span>
                <span aria-hidden="true" className="text-white/20">
                  /
                </span>
                <span className="text-white/50">{phase}</span>
              </p>

              <h1
                id="match-title"
                className="mt-3 text-balance font-display text-[clamp(2.2rem,5.5vw,4rem)] uppercase leading-[0.94] tracking-[0.01em] text-white"
              >
                {match.title}
              </h1>

              {hasTeams ? (
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <TeamBadge name={home?.name} badgeUrl={home?.badgeUrl} size={40} />
                    <span className="max-w-[12rem] truncate text-[13px] font-semibold text-white/90 sm:text-sm">
                      {home?.name ?? "TBD"}
                    </span>
                  </div>
                  <span className="font-display text-[11px] uppercase tracking-[0.24em] text-white/30">
                    vs
                  </span>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <TeamBadge name={away?.name} badgeUrl={away?.badgeUrl} size={40} />
                    <span className="max-w-[12rem] truncate text-[13px] font-semibold text-white/90 sm:text-sm">
                      {away?.name ?? "TBD"}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[11px] font-semibold text-white/60 sm:text-xs">
                {!match.isAlwaysOn ? (
                  <StatusPill isLive={match.isLive} isAlwaysOn={false} date={match.date} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
                    <RadioTower className="size-3" aria-hidden="true" />
                    24/7
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-white/40" aria-hidden="true" />
                  {match.isAlwaysOn ? (
                    "Always broadcasting"
                  ) : (
                    <TimeText timestamp={match.date} variant="short" />
                  )}
                </span>
                {!match.isLive && !match.isAlwaysOn ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-brand">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    <Countdown target={match.date} initial={formatCountdown(match.date)} />
                  </span>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                {hasStreams ? (
                  <Link
                    href={watchHref}
                    className="inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-sm font-bold text-white shadow-[0_16px_44px_-12px_rgba(255,53,77,0.75)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#ff4a60]"
                  >
                    <Play className="size-4 fill-current" aria-hidden="true" />
                    {primaryLabel}
                  </Link>
                ) : null}
                <FavoriteButton
                  match={card}
                  withLabel
                  className="h-12 bg-white/[0.04] px-5 text-white/85 hover:bg-white/[0.08]"
                />
                <ShareButton title={match.title} className="h-12" />
              </div>

              {!hasStreams ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <Info className="mt-0.5 size-4 shrink-0 text-white/40" aria-hidden="true" />
                  <p className="text-xs leading-relaxed text-muted">
                    Streams for this event haven&apos;t been announced yet. Add it to My List and
                    check back closer to kickoff.
                  </p>
                </div>
              ) : null}

              <dl className="mt-7 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3">
                {details.map((detail) => {
                  const Icon = detail.icon;
                  return (
                    <div key={detail.label} className="bg-surface/95 px-4 py-3.5">
                      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-dim">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {detail.label}
                      </dt>
                      <dd className="mt-1.5 text-[13px] font-semibold leading-snug text-white/90">
                        {detail.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-dim">
                Third-party streams may include their own ads. Maidaan does not host or control
                playback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 space-y-12 sm:mt-12">
        {related.length > 0 ? (
          <Rail
            title={`More ${sport.name.toLowerCase()}`}
            eyebrow="Keep watching"
            matches={related}
            href={`/sports/${sport.id}`}
            linkLabel="All fixtures"
          />
        ) : null}

        <section className="container-app">
          <Link
            href={`/sports/${sport.id}`}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div>
              <p className="text-sm font-semibold text-white">Looking for another match?</p>
              <p className="mt-0.5 text-xs text-muted">
                Browse every {sport.name.toLowerCase()} fixture on the board.
              </p>
            </div>
            <ArrowRight
              className="size-4 shrink-0 text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/70"
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </div>
  );
}
