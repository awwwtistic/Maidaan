"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ExternalLink,
  Loader2,
  Play,
  RefreshCw,
  Signal,
  Tv,
  MonitorOff,
  Users,
} from "lucide-react";
import type { MatchView, StreamView, WatchSourceGroup } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { toCard } from "@/lib/match";
import { cn, formatViewers } from "@/lib/utils";
import { FavoriteButton } from "@/components/match/FavoriteButton";
import { PosterFrame } from "@/components/match/PosterFrame";
import { ShareButton } from "@/components/match/ShareButton";
import { TeamBadge } from "@/components/match/TeamBadge";
import { TimeText } from "@/components/match/TimeText";

function bestStream(streams: StreamView[]): StreamView | null {
  if (streams.length === 0) return null;
  return [...streams].sort(
    (a, b) =>
      Number(b.hd) - Number(a.hd) || b.viewers - a.viewers || a.streamNo - b.streamNo,
  )[0];
}

function sourceLabel(source: string): string {
  return source
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function PlayerView({
  match,
  groups,
  requestedSource,
  requestedStream,
}: {
  match: MatchView;
  groups: WatchSourceGroup[];
  requestedSource: string | null;
  requestedStream: number | null;
}) {
  const sport = getSport(match.category);
  const card = toCard(match);
  const home = match.teams?.home ?? null;
  const away = match.teams?.away ?? null;
  const matchHref = `/match/${encodeURIComponent(match.id)}`;
  const usableGroups = groups.filter((group) => group.streams.length > 0);

  const initialGroup =
    usableGroups.find((group) => group.source === requestedSource) ?? usableGroups[0] ?? null;
  const initialStream = initialGroup
    ? (initialGroup.streams.find((stream) => stream.streamNo === requestedStream) ??
      bestStream(initialGroup.streams))
    : null;

  const [sourceName, setSourceName] = useState<string | null>(initialGroup?.source ?? null);
  const [streamNo, setStreamNo] = useState<number | null>(initialStream?.streamNo ?? null);
  const [loaded, setLoaded] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const activeGroup = usableGroups.find((group) => group.source === sourceName) ?? usableGroups[0] ?? null;
  const activeStream = activeGroup
    ? (activeGroup.streams.find((stream) => stream.streamNo === streamNo) ??
      bestStream(activeGroup.streams))
    : null;
  const activeSourceName = activeGroup?.source ?? null;
  const activeStreamNo = activeStream?.streamNo ?? null;
  const viewers = formatViewers(activeStream?.viewers);

  // The iframe can finish loading before hydration attaches onLoad; never trap the player under the overlay.
  useEffect(() => {
    if (loaded) return;
    const timer = window.setTimeout(() => setLoaded(true), 2000);
    return () => window.clearTimeout(timer);
  }, [loaded, activeStream?.embedUrl, reloadToken]);

  useEffect(() => {
    if (!activeSourceName || activeStreamNo === null) return;
    const url = new URL(window.location.href);
    if (
      url.searchParams.get("source") === activeSourceName &&
      url.searchParams.get("stream") === String(activeStreamNo)
    ) {
      return;
    }
    url.searchParams.set("source", activeSourceName);
    url.searchParams.set("stream", String(activeStreamNo));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [activeSourceName, activeStreamNo]);

  const selectSource = (group: WatchSourceGroup) => {
    if (group.streams.length === 0) return;
    const next = bestStream(group.streams);
    setSourceName(group.source);
    setStreamNo(next?.streamNo ?? null);
    setLoaded(false);
  };

  const selectStream = (stream: StreamView) => {
    setStreamNo(stream.streamNo);
    setLoaded(false);
  };

  const reload = () => {
    setLoaded(false);
    setReloadToken((token) => token + 1);
  };

  return (
    <div className="container-app pb-4 pt-24 sm:pt-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={matchHref}
          prefetch={false}
          className="group inline-flex items-center gap-2 py-3.5 -my-3.5 text-xs font-semibold text-muted transition-colors hover:text-white"
        >
          <span className="grid size-7 place-items-center rounded-full border border-white/10 transition-colors group-hover:border-white/25">
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </span>
          Match details
        </Link>

        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em]">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
              match.isLive
                ? "bg-brand text-white"
                : "border border-white/12 bg-white/[0.04] text-white/70",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                match.isLive
                  ? "animate-live-dot bg-white"
                  : match.isAlwaysOn
                    ? "bg-emerald-400"
                    : "bg-white/45",
              )}
            />
            {match.isLive ? "Live now" : match.isAlwaysOn ? "24/7 channel" : "Upcoming"}
          </span>
          <span style={{ color: sport.accent }}>{sport.name}</span>
        </div>
      </div>

      <div className="mt-5 xl:grid xl:grid-cols-[minmax(0,1fr)_336px] xl:items-start xl:gap-8">
        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-balance font-display text-[clamp(1.6rem,3.4vw,2.4rem)] uppercase leading-[1.02] tracking-[0.02em] text-white">
                {match.title}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-muted">
                {home?.name || away?.name ? (
                  <span className="text-white/65">
                    {home?.name ?? "TBD"} <span className="text-white/25">vs</span>{" "}
                    {away?.name ?? "TBD"}
                  </span>
                ) : null}
                <span>
                  {match.isAlwaysOn ? (
                    "Always broadcasting"
                  ) : (
                    <TimeText timestamp={match.date} variant="card" />
                  )}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <FavoriteButton match={card} />
              <ShareButton title={match.title} withLabel={false} />
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95)]">
            <div className="relative aspect-video">
              {activeStream ? (
                <iframe
                  key={`${activeStream.embedUrl}#${reloadToken}`}
                  src={activeStream.embedUrl}
                  title={`${match.title} — ${sourceLabel(activeStream.source)} stream ${activeStream.streamNo}`}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture; clipboard-write"
                  allowFullScreen
                  loading="eager"
                  onLoad={() => setLoaded(true)}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(80%_90%_at_50%_0%,rgba(255,53,77,0.08),transparent_65%)] px-6 text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                      <MonitorOff className="size-6" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-display text-2xl uppercase tracking-wide text-white">
                      No playable streams
                    </p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                      This event doesn&apos;t have a working feed right now. Streams are added
                      close to kickoff — check again in a few minutes.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-xs font-bold text-white transition-colors hover:bg-[#ff4a60]"
                      >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        Check again
                      </button>
                      <Link
                        href={matchHref}
                        prefetch={false}
                        className="inline-flex h-11 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-white/30"
                      >
                        Match details
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeStream && !loaded ? (
                <div
                  role="status"
                  className="pointer-events-none absolute inset-0 grid place-items-center bg-ink/75 backdrop-blur-sm"
                >
                  <div className="text-center">
                    <Loader2 className="mx-auto size-8 animate-spin-slow text-brand" aria-hidden="true" />
                    <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Tuning the signal
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {activeStream ? (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Signal className="size-3.5 text-emerald-400" aria-hidden="true" />
                  {activeStream.language}
                </span>
                {activeStream.hd ? (
                  <span className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white/80">
                    HD
                  </span>
                ) : null}
                {viewers ? (
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3.5" aria-hidden="true" />
                    {viewers} watching
                  </span>
                ) : null}
                <span aria-hidden="true" className="hidden size-0.5 rounded-full bg-white/20 sm:block" />
                <span className="hidden sm:inline">
                  {activeGroup ? sourceLabel(activeGroup.source) : "Stream"} source
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={activeStream.embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/12 px-3.5 text-[11px] font-semibold text-white/75 transition-colors hover:border-white/25 hover:text-white sm:h-9"
                >
                  Open in new tab
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={reload}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-white/12 px-3.5 text-[11px] font-semibold text-white/75 transition-colors hover:border-white/25 hover:text-white sm:h-9"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Reload player
                </button>
              </div>
            </div>
          ) : null}

          {groups.length > 0 ? (
            <div className="mt-4 rounded-2xl border border-white/[0.07] bg-surface/55 p-4 sm:p-5">
              {groups.length > 1 ? (
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-dim">
                    Source
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {groups.map((group) => {
                      const active = group.source === activeSourceName;
                      const available = group.streams.length > 0;
                      return (
                        <button
                          key={`${group.source}:${group.sourceId}`}
                          type="button"
                          onClick={() => selectSource(group)}
                          disabled={!available}
                          aria-pressed={active}
                          className={cn(
                            "inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-[border-color,background-color,color] duration-200 sm:h-10",
                            active
                              ? "border-brand/40 bg-brand/10 text-white"
                              : "border-white/10 bg-white/[0.025] text-muted hover:border-white/20 hover:text-white",
                            !available && "cursor-not-allowed opacity-40",
                          )}
                        >
                          {active ? (
                            <Check className="size-3.5 text-brand" aria-hidden="true" />
                          ) : (
                            <Tv className="size-3.5" aria-hidden="true" />
                          )}
                          {sourceLabel(group.source)}
                          <span className="text-[10px] font-medium text-white/30 tabular-nums">
                            {group.streams.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {activeGroup ? (
                <fieldset className={groups.length > 1 ? "mt-5" : undefined}>
                  <legend className="sr-only">Choose a stream</legend>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted-dim">
                      Streams
                    </p>
                    <p className="text-[10px] font-medium text-muted-dim">
                      {activeGroup.streams.length} available
                    </p>
                  </div>
                  <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                    {activeGroup.streams.map((stream) => {
                      const active = stream.streamNo === activeStreamNo;
                      const streamViewers = formatViewers(stream.viewers);
                      return (
                        <button
                          key={`${stream.id}:${stream.streamNo}`}
                          type="button"
                          onClick={() => selectStream(stream)}
                          aria-pressed={active}
                          className={cn(
                            "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color] duration-200",
                            active
                              ? "border-brand/40 bg-brand/[0.07]"
                              : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-full border",
                              active
                                ? "border-brand/30 bg-brand/15 text-brand"
                                : "border-white/10 bg-white/[0.04] text-white/55",
                            )}
                          >
                            {active ? (
                              <Signal className="size-4" aria-hidden="true" />
                            ) : (
                              <Play className="size-3.5 fill-current" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                              Stream {stream.streamNo}
                              {stream.hd ? (
                                <span className="rounded border border-white/15 px-1 py-px text-[8px] font-extrabold uppercase tracking-wider text-white/75">
                                  HD
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
                              {stream.language}
                              {streamViewers ? (
                                <>
                                  <span aria-hidden="true" className="size-0.5 rounded-full bg-white/25" />
                                  <Users className="size-3" aria-hidden="true" />
                                  {streamViewers}
                                </>
                              ) : null}
                            </span>
                          </span>
                          {active ? <Check className="size-4 shrink-0 text-brand" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ) : (
                <p className="text-sm text-muted">No feeds from this match&apos;s providers yet.</p>
              )}
            </div>
          ) : null}

          <p className="mt-4 text-[11px] leading-relaxed text-muted-dim">
            Playback is provided by third-party embed hosts. Maidaan does not host streams and
            cannot control ads shown inside the player. If a feed stalls, switch sources or open
            it in a new tab.
          </p>
        </div>

        <aside className="mt-8 space-y-4 xl:mt-0">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60">
            <div className="relative aspect-video">
              <PosterFrame
                posterUrl={match.posterUrl}
                title={match.title}
                category={match.category}
                className="h-full w-full"
                sizes="(min-width: 1280px) 336px, 92vw"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              />
              <span
                className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md"
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
                {match.isLive ? "Live" : match.isAlwaysOn ? "24/7" : "Upcoming"}
              </span>
            </div>

            <div className="p-4">
              <p
                className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: sport.accent }}
              >
                {sport.name}
              </p>
              <p className="mt-1 font-display text-xl uppercase leading-tight tracking-wide text-white">
                {match.title}
              </p>

              {home || away ? (
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <TeamBadge name={home?.name} badgeUrl={home?.badgeUrl} size={20} />
                    <span className="max-w-[7rem] truncate text-white/80">{home?.name ?? "TBD"}</span>
                  </span>
                  <span className="text-white/25">vs</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TeamBadge name={away?.name} badgeUrl={away?.badgeUrl} size={20} />
                    <span className="max-w-[7rem] truncate text-white/80">{away?.name ?? "TBD"}</span>
                  </span>
                </div>
              ) : null}

              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted">
                <CalendarDays className="size-3.5 text-white/35" aria-hidden="true" />
                {match.isAlwaysOn ? (
                  "Always broadcasting"
                ) : (
                  <TimeText timestamp={match.date} variant="full" />
                )}
              </p>

              <div className="mt-4 flex gap-2">
                <FavoriteButton
                  match={card}
                  withLabel
                  className="flex-1 bg-white/[0.04] text-white/85 hover:bg-white/[0.08]"
                />
                <ShareButton title={match.title} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">
              Stream tips
            </p>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-relaxed text-muted">
              <li className="flex gap-2">
                <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-brand/70" />
                Buffering? Switch to another source or stream from the list.
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-brand/70" />
                If playback is blocked, open the stream in a new tab.
              </li>
              <li className="flex gap-2">
                <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-brand/70" />
                Embeds may show their own ads — Maidaan doesn&apos;t control them.
              </li>
            </ul>
          </div>

          <Link
            href={matchHref}
            prefetch={false}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5 text-xs font-semibold text-muted transition-colors hover:border-white/15 hover:text-white"
          >
            Fixture details & more matches
            <ArrowLeft
              className="size-4 rotate-180 text-white/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/70"
              aria-hidden="true"
            />
          </Link>
        </aside>
      </div>
    </div>
  );
}
