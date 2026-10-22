import { TimeText } from "./TimeText";
import { cn } from "@/lib/utils";

export function StatusPill({
  isLive,
  isAlwaysOn,
  date,
  className,
}: {
  isLive: boolean;
  isAlwaysOn: boolean;
  date: number;
  className?: string;
}) {
  if (isLive) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-[0_6px_20px_rgba(255,53,77,0.35)]",
          className,
        )}
      >
        <span className="relative flex size-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
          <span className="relative inline-flex size-1.5 rounded-full bg-white" />
        </span>
        Live
      </span>
    );
  }

  if (isAlwaysOn) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md",
          className,
        )}
      >
        <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
        24/7
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-md",
        className,
      )}
    >
      <TimeText timestamp={date} variant="card" />
    </span>
  );
}
