import { formatUtcFallback, isoString } from "@/lib/format";
import type { TimeVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TimeText({
  timestamp,
  variant = "card",
  className,
}: {
  timestamp: number;
  variant?: TimeVariant;
  className?: string;
}) {
  if (!timestamp || timestamp <= 0) {
    return <span className={className}>24/7</span>;
  }

  return (
    <time
      dateTime={isoString(timestamp)}
      data-ts={timestamp}
      data-format={variant}
      title={formatUtcFallback(timestamp, "full")}
      suppressHydrationWarning
      className={cn("tabular-nums", className)}
    >
      {formatUtcFallback(timestamp, variant)}
    </time>
  );
}
