"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Edges {
  overflowing: boolean;
  left: boolean;
  right: boolean;
}

export function RailScroller({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ overflowing: false, left: false, right: false });

  const update = useCallback(() => {
    const element = scrollerRef.current;
    if (!element) return;
    const max = element.scrollWidth - element.clientWidth;
    setEdges({
      overflowing: max > 8,
      left: element.scrollLeft > 8,
      right: element.scrollLeft < max - 8,
    });
  }, []);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    Array.from(element.children).forEach((child) => observer.observe(child));
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [update]);

  const scroll = (direction: 1 | -1) => {
    const element = scrollerRef.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollBy({
      left: direction * Math.round(element.clientWidth * 0.82),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label={`${label} carousel`}
        className="no-scrollbar -mx-1 flex snap-x snap-proximity gap-3 overflow-x-auto px-1 pb-3 pt-1 outline-offset-4 sm:gap-4"
      >
        {children}
      </div>

      {edges.overflowing ? (
        <>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 hidden w-14 bg-gradient-to-r from-ink to-transparent transition-opacity duration-300 md:block",
              edges.left ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-l from-ink to-transparent transition-opacity duration-300 md:block",
              edges.right ? "opacity-100" : "opacity-0",
            )}
          />
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!edges.left}
            aria-label={`Scroll ${label} left`}
            className="glass absolute left-1 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/12 text-white opacity-0 transition-all duration-200 hover:scale-105 hover:border-white/25 disabled:pointer-events-none disabled:opacity-0 md:grid md:group-hover/rail:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!edges.right}
            aria-label={`Scroll ${label} right`}
            className="glass absolute right-1 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-white/12 text-white opacity-0 transition-all duration-200 hover:scale-105 hover:border-white/25 disabled:pointer-events-none disabled:opacity-0 md:grid md:group-hover/rail:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}
