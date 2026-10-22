"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton({
  title,
  withLabel = true,
  className,
}: {
  title: string;
  withLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const onClick = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt("Copy this link", url);
        return;
      }
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // The native share sheet can be dismissed; nothing to report.
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm font-semibold text-white/85 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white",
        withLabel ? "px-5" : "size-11",
        className,
      )}
      aria-label="Share this match"
    >
      {copied ? (
        <Check className="size-[17px] text-emerald-400" aria-hidden="true" />
      ) : (
        <Link2 className="size-[17px]" aria-hidden="true" />
      )}
      {withLabel ? <span>{copied ? "Link copied" : "Share"}</span> : null}
    </button>
  );
}
