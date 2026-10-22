import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Maidaan home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-brand shadow-[0_8px_28px_rgba(255,53,77,0.28)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20" />
        <Play
          className="relative size-[15px] translate-x-px fill-white text-white"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </span>
      <span className="font-display text-[21px] uppercase leading-none tracking-[0.08em] text-foreground">
        Mai<span className="text-brand">daan</span>
      </span>
    </Link>
  );
}
