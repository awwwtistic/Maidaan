import Link from "next/link";
import { Play, Radio } from "lucide-react";
import type { CardMatch } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { cn, plural } from "@/lib/utils";
import { FavoriteButton } from "./FavoriteButton";
import { PosterFrame } from "./PosterFrame";
import { StatusPill } from "./StatusPill";
import { TeamBadge } from "./TeamBadge";

export function MatchCard({
  match,
  priority = false,
  className,
}: {
  match: CardMatch;
  priority?: boolean;
  className?: string;
}) {
  const sport = getSport(match.category);
  const hasTeams = Boolean(match.homeName || match.awayName);
  const href = `/match/${encodeURIComponent(match.id)}`;

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.075] bg-surface transition-[transform,border-color,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:border-white/[0.16] group-hover:shadow-[0_22px_46px_-18px_rgba(0,0,0,0.9)] group-focus-within:border-white/25">
        <PosterFrame
          posterUrl={match.posterUrl}
          title={match.title}
          category={match.category}
          className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.055]"
          priority={priority}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/25"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 to-transparent"
        />

        <div className="pointer-events-none absolute left-3 top-3 z-20">
          <StatusPill
            isLive={match.isLive}
            isAlwaysOn={match.isAlwaysOn}
            date={match.date}
          />
        </div>

        <FavoriteButton match={match} className="absolute right-3 top-3 z-20" />

        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid size-12 scale-75 place-items-center rounded-full bg-white text-ink opacity-0 shadow-2xl transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100">
            <Play className="ml-0.5 size-5 fill-current" aria-hidden="true" />
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4">
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: sport.accent }}
          >
            {sport.name}
          </p>
          <h3 className="mt-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-white text-shadow-card">
            {match.title}
          </h3>
          <div className="mt-2 flex min-w-0 items-center gap-2 text-[11px] font-medium text-white/60">
            {hasTeams ? (
              <>
                <span className="flex -space-x-1.5">
                  <TeamBadge name={match.homeName} badgeUrl={match.homeBadge} size={19} />
                  <TeamBadge name={match.awayName} badgeUrl={match.awayBadge} size={19} />
                </span>
                <span className="truncate">
                  {match.homeName ?? "TBD"} <span className="text-white/30">vs</span>{" "}
                  {match.awayName ?? "TBD"}
                </span>
              </>
            ) : (
              <>
                <Radio className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {match.isAlwaysOn
                    ? "Always-on channel"
                    : match.sourceCount > 0
                      ? `${plural(match.sourceCount, "source")} available`
                      : "Event stream"}
                </span>
              </>
            )}
          </div>
        </div>

        <Link
          href={href}
          prefetch={false}
          className="absolute inset-0 z-10 rounded-2xl"
          aria-label={`${match.title} — ${sport.name}${
            match.isLive ? ", live now" : match.isAlwaysOn ? ", 24/7 channel" : ""
          }`}
        >
          <span className="sr-only">View match details</span>
        </Link>
      </div>
    </article>
  );
}
