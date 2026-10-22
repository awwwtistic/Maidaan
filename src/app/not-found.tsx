import Link from "next/link";
import { ArrowLeft, Compass, Trophy } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[74svh] max-w-3xl flex-col justify-center pb-20 pt-32 sm:pt-40">
      <div className="flex items-center gap-4">
        <span className="font-display text-[clamp(5rem,14vw,9rem)] leading-[0.8] text-white">
          4<span className="text-brand">0</span>4
        </span>
        <span
          aria-hidden="true"
          className="h-20 w-[5px] -skew-x-12 rounded-full bg-brand shadow-[0_0_30px_rgba(255,53,77,0.45)]"
        />
        <span className="max-w-[10rem] font-display text-sm uppercase leading-snug tracking-[0.08em] text-muted sm:text-base">
          This channel is off air
        </span>
      </div>
      <h1 className="mt-8 font-display text-[clamp(1.9rem,5vw,3rem)] uppercase leading-none text-white">
        Nothing here but static
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        The link may be wrong or the page may have moved. If you were looking for a fixture, it
        may have finished — live events and schedules are still waiting for you.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back home
        </Link>
        <Link
          href="/sports"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
        >
          <Trophy className="size-4" aria-hidden="true" />
          Browse sports
        </Link>
        <Link
          href="/schedule"
          className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted transition-colors hover:text-white"
        >
          <Compass className="size-4" aria-hidden="true" />
          See the schedule
        </Link>
      </div>
    </div>
  );
}
