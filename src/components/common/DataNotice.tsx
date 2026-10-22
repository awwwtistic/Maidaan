import Link from "next/link";
import { RadioTower } from "lucide-react";

export function DataNotice({
  title = "The signal dropped",
  description = "We couldn't reach the live sports feed just now. The page will fill back in automatically once the feed responds.",
  retryHref = "/",
}: {
  title?: string;
  description?: string;
  retryHref?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/[0.06] px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-start gap-3">
        <RadioTower className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        </div>
      </div>
      <Link
        href={retryHref}
        className="mt-4 inline-flex h-11 shrink-0 items-center rounded-full border border-white/15 px-4 text-xs font-semibold text-white transition-colors hover:border-brand hover:text-brand sm:mt-0 sm:h-9"
      >
        Try again
      </Link>
    </div>
  );
}
