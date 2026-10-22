"use client";

import { useEffect } from "react";
import Link from "next/link";
import { House, RefreshCw, WifiOff } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-app flex min-h-[74svh] max-w-3xl flex-col justify-center pb-20 pt-32 sm:pt-40">
      <span className="mb-6 grid size-12 place-items-center rounded-2xl border border-brand/25 bg-brand/[0.08] text-brand">
        <WifiOff className="size-6" aria-hidden="true" />
      </span>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand">
        Playback interrupted
      </p>
      <h1 className="mt-3 font-display text-[clamp(3rem,9vw,5.5rem)] uppercase leading-[0.92] text-white">
        Signal lost
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
        Something went wrong while loading this page. It is usually a brief interruption — try
        again, or head back to the live feed.
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-muted-dim">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-[#ff4a60]"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition-colors hover:border-white/30"
        >
          <House className="size-4" aria-hidden="true" />
          Back home
        </Link>
      </div>
    </div>
  );
}
