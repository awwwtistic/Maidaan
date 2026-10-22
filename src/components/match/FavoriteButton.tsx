"use client";

import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites, toggleFavorite } from "@/lib/favorites";
import type { CardMatch } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  match,
  withLabel = false,
  className,
}: {
  match: CardMatch;
  withLabel?: boolean;
  className?: string;
}) {
  const favorites = useFavorites();
  const active = favorites?.some((entry) => entry.id === match.id) ?? false;
  const [popping, setPopping] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const onClick = () => {
    toggleFavorite(match);
    setPopping(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPopping(false), 420);
  };

  const label = active ? "Remove from My List" : "Add to My List";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        "relative z-20 inline-flex items-center justify-center rounded-full border transition-all duration-200 before:absolute before:-inset-1 before:rounded-full before:content-['']",
        withLabel
          ? "h-11 gap-2 px-5 text-sm font-semibold"
          : "size-9 backdrop-blur-md",
        active
          ? "border-brand/35 bg-brand/15 text-brand"
          : "border-white/12 bg-black/40 text-white/80 hover:border-white/25 hover:bg-black/65 hover:text-white",
        className,
      )}
    >
      <Heart
        className={cn(
          "size-[17px] transition-colors",
          active && "fill-brand text-brand",
          popping && "animate-heart-pop",
        )}
        strokeWidth={2.1}
        aria-hidden="true"
      />
      {withLabel ? (
        <span>{active ? "In My List" : "My List"}</span>
      ) : null}
    </button>
  );
}
