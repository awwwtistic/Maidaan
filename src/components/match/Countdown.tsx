"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Countdown({
  target,
  initial,
  className,
}: {
  target: number;
  initial: string;
  className?: string;
}) {
  const [label, setLabel] = useState(initial);

  useEffect(() => {
    const update = () => setLabel(formatCountdown(target));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [target]);

  return <span className={cn("tabular-nums", className)}>{label}</span>;
}
