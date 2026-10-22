import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  eyebrow,
  href,
  linkLabel = "View all",
  count,
  className,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-5", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="h-7 w-[5px] shrink-0 -skew-x-12 rounded-full bg-brand shadow-[0_0_18px_rgba(255,53,77,0.45)]"
        />
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="truncate font-display text-[26px] uppercase leading-none tracking-[0.035em] text-white sm:text-[32px]">
            {title}
          </h2>
        </div>
        {typeof count === "number" ? (
          <span className="mb-0.5 hidden rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-muted sm:inline-flex">
            {count}
          </span>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group -my-3.5 mb-0.5 inline-flex shrink-0 items-center gap-1.5 py-3.5 text-xs font-semibold text-muted transition-colors hover:text-white sm:text-[13px]"
        >
          {linkLabel}
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
