import Link from "next/link";
import { ArrowUpRight, Radio } from "lucide-react";
import type { SportSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SportTiles({ summaries }: { summaries: SportSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {summaries.map((summary, index) => {
        const { sport, total, live, upcoming } = summary;
        const featured = index < 2;

        return (
          <Link
            key={sport.id}
            href={`/sports/${sport.id}`}
            prefetch={false}
            aria-label={`${sport.name} — ${total} active events`}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.07] bg-surface/60 p-5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:bg-raised/70 sm:p-6",
              featured ? "min-h-[220px] sm:col-span-2 lg:min-h-[236px]" : "min-h-[184px]",
            )}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background: `radial-gradient(95% 90% at 100% 0%, ${sport.accent}1f 0%, transparent 64%)`,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-px opacity-60"
              style={{
                background: `linear-gradient(90deg, transparent, ${sport.accent}aa, transparent)`,
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-3 -top-8 font-display text-[8rem] leading-none tracking-tight text-white/[0.035] transition-transform duration-500 group-hover:-translate-y-1"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <div className="relative flex items-start justify-between gap-4">
              {live > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                  <span className="relative flex size-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-white" />
                  </span>
                  {live} live
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/65">
                  <Radio className="size-3" aria-hidden="true" />
                  {total > 0 ? `${total} active` : "Between events"}
                </span>
              )}

              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/45 transition-[transform,border-color,background-color,color] duration-300 group-hover:-translate-y-0.5 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-white">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>

            <div className="relative mt-8">
              <h2
                className={cn(
                  "font-display uppercase leading-[0.93] tracking-[0.02em] text-white",
                  featured ? "text-4xl sm:text-5xl" : "text-[2rem]",
                )}
              >
                {sport.name}
              </h2>
              <p className="mt-1.5 text-xs font-medium text-muted">{sport.blurb}</p>
              <div className="mt-4 flex items-center gap-3 text-[11px] font-medium text-white/45">
                <span>{upcoming} upcoming</span>
                <span aria-hidden="true" className="size-0.5 rounded-full bg-white/25" />
                <span>{total} on the board</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
