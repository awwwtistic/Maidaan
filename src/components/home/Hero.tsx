import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Play, Tv } from "lucide-react";
import type { MatchView } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { formatCountdown } from "@/lib/format";
import { plural } from "@/lib/utils";
import { Countdown } from "@/components/match/Countdown";
import { PosterFrame } from "@/components/match/PosterFrame";
import { TimeText } from "@/components/match/TimeText";
import { TeamBadge } from "@/components/match/TeamBadge";

export function Hero({ match }: { match: MatchView }) {
  const sport = getSport(match.category);
  const home = match.teams?.home ?? null;
  const away = match.teams?.away ?? null;
  const hasTeams = Boolean(home || away);
  const hasStreams = match.sources.length > 0;
  const detailsHref = `/match/${encodeURIComponent(match.id)}`;
  const watchHref = `/watch/${encodeURIComponent(match.id)}`;
  const stateLabel = match.isLive ? "Live now" : match.isAlwaysOn ? "24/7 channel" : "Up next";
  const watchLabel = match.isLive
    ? "Watch live"
    : match.isAlwaysOn
      ? "Watch channel"
      : "Watch";

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        {match.posterUrl ? (
          <Image
            src={match.posterUrl}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="animate-ken-burns object-cover opacity-40 blur-[6px] saturate-[1.15]"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(90% 80% at 70% 10%, ${sport.accent}2e 0%, transparent 64%), #0b0b10`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(75% 80% at 78% 18%, ${sport.accent}24 0%, transparent 60%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-ink/55" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />
      </div>

      <div className="container-app relative grid items-center gap-12 pb-12 pt-28 sm:pt-32 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-16 lg:pb-20 lg:pt-40">
        <div className="max-w-2xl">
          <div className="animate-fade-in flex flex-wrap items-center gap-2.5 text-[10px] font-extrabold uppercase tracking-[0.22em] sm:text-[11px]">
            <span className="inline-flex items-center gap-2 text-white/85">
              <span
                aria-hidden="true"
                className="h-3.5 w-[3px] -skew-x-12 rounded-full"
                style={{ backgroundColor: sport.accent }}
              />
              {sport.name}
            </span>
            <span aria-hidden="true" className="text-white/25">
              /
            </span>
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                color: match.isLive ? "#ff354d" : match.isAlwaysOn ? "#34d399" : "#a2a2ad",
              }}
            >
              {match.isLive ? (
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand animate-live-dot" />
              ) : null}
              {stateLabel}
            </span>
          </div>

          <h1
            id="hero-title"
            className="mt-4 line-clamp-3 text-balance font-display text-[clamp(2.6rem,7.4vw,5.5rem)] uppercase leading-[0.92] tracking-[0.01em] text-white"
          >
            {match.title}
          </h1>

          {hasTeams ? (
            <div className="animate-rise mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <TeamBadge name={home?.name} badgeUrl={home?.badgeUrl} size={38} />
                <span className="max-w-[11rem] truncate text-[13px] font-semibold text-white/90 sm:text-sm">
                  {home?.name ?? "TBD"}
                </span>
              </div>
              <span className="font-display text-[11px] uppercase tracking-[0.24em] text-white/30">
                vs
              </span>
              <div className="flex min-w-0 items-center gap-2.5">
                <TeamBadge name={away?.name} badgeUrl={away?.badgeUrl} size={38} />
                <span className="max-w-[11rem] truncate text-[13px] font-semibold text-white/90 sm:text-sm">
                  {away?.name ?? "TBD"}
                </span>
              </div>
            </div>
          ) : null}

          <div
            className="animate-rise mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-[11px] font-semibold text-white/60 sm:text-xs"
            style={{ animationDelay: "70ms" }}
          >
            {!match.isLive && !match.isAlwaysOn ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/25 bg-brand/10 px-2.5 py-1 text-brand">
                <Countdown target={match.date} initial={formatCountdown(match.date)} />
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-white/40" aria-hidden="true" />
              {match.isAlwaysOn ? (
                "Always broadcasting"
              ) : (
                <TimeText timestamp={match.date} variant="short" />
              )}
            </span>
            <span aria-hidden="true" className="hidden size-0.5 rounded-full bg-white/25 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Tv className="size-3.5 text-white/40" aria-hidden="true" />
              {hasStreams
                ? `${plural(match.sources.length, "source")} available`
                : "Streams not announced"}
            </span>
          </div>

          <div
            className="animate-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "130ms" }}
          >
            {hasStreams ? (
              <Link
                href={watchHref}
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-sm font-bold text-white shadow-[0_16px_44px_-12px_rgba(255,53,77,0.75)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#ff4a60] hover:shadow-[0_20px_52px_-12px_rgba(255,53,77,0.9)] active:translate-y-0"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white/18">
                  <Play className="ml-px size-3 fill-current" aria-hidden="true" />
                </span>
                {watchLabel}
              </Link>
            ) : (
              <Link
                href={detailsHref}
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-sm font-bold text-white shadow-[0_16px_44px_-12px_rgba(255,53,77,0.75)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#ff4a60]"
              >
                Match details
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}

            {hasStreams ? (
              <Link
                href={detailsHref}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-semibold text-white backdrop-blur-sm transition-[border-color,background-color] duration-200 hover:border-white/30 hover:bg-white/[0.08]"
              >
                Match details
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div
            aria-hidden="true"
            className="absolute -inset-8 rounded-[3rem] opacity-70 blur-3xl"
            style={{ background: `radial-gradient(60% 60% at 55% 55%, ${sport.accent}2e, transparent 72%)` }}
          />
          <div className="animate-rise relative rounded-[1.75rem] border border-white/12 bg-white/[0.045] p-2 shadow-[0_44px_100px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm">
            <div className="relative aspect-video overflow-hidden rounded-[1.3rem]">
              <PosterFrame
                posterUrl={match.posterUrl}
                title={match.title}
                category={match.category}
                className="h-full w-full"
                sizes="(min-width: 1440px) 580px, 42vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: match.isAlwaysOn ? "#34d399" : match.isLive ? "#ff354d" : "#a2a2ad" }}
                  />
                  {stateLabel}
                </span>
                {hasStreams ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/80 backdrop-blur-md">
                    <Tv className="size-3" aria-hidden="true" />
                    {plural(match.sources.length, "feed")}
                  </span>
                ) : null}
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p
                    className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: sport.accent }}
                  >
                    {sport.name} · Featured
                  </p>
                  <p className="mt-1.5 truncate font-display text-[22px] uppercase leading-none tracking-wide text-white">
                    {match.title}
                  </p>
                </div>
                {hasStreams ? (
                  <Link
                    href={watchHref}
                    aria-label={`Watch ${match.title}`}
                    className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-ink shadow-2xl transition-transform duration-200 hover:scale-105"
                  >
                    <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
