import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/[0.07] bg-surface/60 px-6 py-14 text-center sm:px-10 sm:py-20",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl"
      />
      {icon ? (
        <div className="relative mx-auto mb-5 grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-brand">
          {icon}
        </div>
      ) : null}
      <h2 className="relative font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="relative mt-7">{action}</div> : null}
    </div>
  );
}
