import type { CSSProperties } from "react";
import type { MatchView } from "@/lib/types";
import { toCard } from "@/lib/match";
import { MatchCard } from "@/components/match/MatchCard";
import { SectionHeader } from "@/components/common/SectionHeader";
import { RailScroller } from "./RailScroller";

export function Rail({
  title,
  eyebrow,
  href,
  matches,
  linkLabel,
  className,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  matches: MatchView[];
  linkLabel?: string;
  className?: string;
}) {
  if (matches.length === 0) return null;

  return (
    <section className={`group/rail container-app space-y-4 ${className ?? ""}`}>
      <SectionHeader
        title={title}
        eyebrow={eyebrow}
        href={href}
        linkLabel={linkLabel}
        count={matches.length}
      />
      <RailScroller label={title}>
        {matches.slice(0, 12).map((match, index) => (
          <div
            key={match.id}
            className="stagger-item w-[81vw] max-w-[336px] shrink-0 snap-start sm:w-[310px] lg:w-[330px]"
            style={{ "--i": Math.min(index, 7) } as CSSProperties}
          >
            <MatchCard match={toCard(match)} />
          </div>
        ))}
      </RailScroller>
    </section>
  );
}
