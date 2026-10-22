"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { Logo } from "./Logo";
import { useFavorites } from "@/lib/favorites";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const favorites = useFavorites();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-white/[0.07] bg-ink/82 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-gradient-to-b from-ink/80 via-ink/35 to-transparent",
      )}
    >
      <div className="container-app flex h-[68px] items-center justify-between gap-6 sm:h-[76px]">
        <div className="flex items-center gap-8 xl:gap-10">
          <Logo className="-my-1.5 py-1.5" />
          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[13px] font-semibold tracking-[0.01em] transition-colors duration-200",
                    active ? "text-white" : "text-muted hover:text-white",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] rounded-full bg-brand transition-all duration-300",
                      active ? "w-full opacity-100" : "w-0 opacity-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/my-list"
            aria-label={
              favorites && favorites.length > 0
                ? `My List, ${favorites.length} saved`
                : "My List"
            }
            aria-current={pathname === "/my-list" ? "page" : undefined}
            className={cn(
              "relative grid size-11 place-items-center rounded-full border text-muted transition-all duration-200 hover:text-white sm:size-10",
              pathname === "/my-list"
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]",
            )}
          >
            <Heart
              className={cn("size-[17px]", favorites && favorites.length > 0 && "fill-current")}
              strokeWidth={2}
              aria-hidden="true"
            />
            {favorites && favorites.length > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 grid min-w-[17px] place-items-center rounded-full bg-brand px-1 text-[9px] font-extrabold leading-[17px] text-white tabular-nums shadow-[0_4px_12px_rgba(255,53,77,0.45)]"
              >
                {favorites.length > 99 ? "99+" : favorites.length}
              </span>
            ) : null}
          </Link>

          <Link
            href="/search"
            aria-label="Search matches, teams and sports"
            className="group flex h-11 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] pl-3.5 pr-3 text-muted transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:h-10 sm:pr-2.5"
          >
            <Search className="size-[17px]" strokeWidth={2} aria-hidden="true" />
            <span className="hidden text-[13px] font-medium sm:inline">Search</span>
            <kbd className="ml-1 hidden rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-muted-dim sm:inline">
              /
            </kbd>
          </Link>
        </div>
      </div>
    </header>
  );
}
