import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CardMatch } from "@/lib/types";
import { getSport } from "@/lib/sports";
import { cn } from "@/lib/utils";
import { PosterFrame } from "./PosterFrame";
import { StatusPill } from "./StatusPill";
import { TimeText } from "./TimeText";

function comparable(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function MatchRow({
  match,
  className,
}: {
  match: CardMatch;
  className?: string;
}) {
  const sport = getSport(match.category);
  const hasTeams = Boolean(match.homeName || match.awayName);
  const teamLine = hasTeams
    ? `${match.homeName ?? "TBD"} vs ${match.awayName ?? "TBD"}`
    : null;
  const showTeamLine = teamLine ? comparable(teamLine) !== comparable(match.title) : false;

  return (
    <Link
      href={`/match/${encodeURIComponent(match.id)}`}
      prefetch={false}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-2.5 transition-[border-color,background-color,transform] duration-200 hover:border-white/[0.14] hover:bg-white/[0.05] sm:gap-4 sm:p-3",
        className,
      )}
    >
      <div className="relative w-[108px] shrink-0 overflow-hidden rounded-xl sm:w-[150px]">
        <PosterFrame
          posterUrl={match.posterUrl}
          title={match.title}
          category={match.category}
          className="aspect-video w-full"
          sizes="(min-width: 640px) 150px, 108px"
        />
        {match.isLive ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider text-white">
            <span className="size-1 rounded-full bg-white" aria-hidden="true" />
            Live
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="text-[10px] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: sport.accent }}
          >
            {sport.name}
          </span>
          <span className="size-0.5 rounded-full bg-white/25" aria-hidden="true" />
          <TimeText
            timestamp={match.isAlwaysOn ? 0 : match.date}
            variant={match.isAlwaysOn ? "time" : "card"}
            className="truncate text-[10px] font-medium text-muted"
          />
        </div>
        <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white sm:line-clamp-1 sm:leading-normal sm:text-[15px]">
          {match.title}
        </p>
        {showTeamLine ? (
          <p className="mt-0.5 truncate text-[11px] text-muted">{teamLine}</p>
        ) : null}
        {!hasTeams ? (
          <p className="mt-0.5 truncate text-[11px] text-muted">
            {match.isAlwaysOn ? "Always-on channel" : "Event stream"}
          </p>
        ) : null}
      </div>

      <div className="hidden shrink-0 sm:block">
        <StatusPill
          isLive={match.isLive}
          isAlwaysOn={match.isAlwaysOn}
          date={match.date}
        />
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-white/25 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white/60"
        aria-hidden="true"
      />
    </Link>
  );
}
