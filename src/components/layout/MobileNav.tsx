"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Heart, House, Trophy } from "lucide-react";
import { MOBILE_NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

const icons = {
  "/": House,
  "/sports": Trophy,
  "/schedule": CalendarDays,
  "/my-list": Heart,
} as const;

export function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/watch")) return null;

  return (
    <nav
      aria-label="Mobile navigation"
      className="glass-strong fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid grid-cols-4 px-2">
        {MOBILE_NAV_LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = icons[link.href as keyof typeof icons] ?? House;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 pb-1 pt-2 text-[10px] font-semibold tracking-wide transition-colors",
                active ? "text-brand" : "text-muted hover:text-white",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-11 place-items-center rounded-full transition-colors duration-200",
                  active ? "bg-brand/12" : "group-hover:bg-white/[0.05]",
                )}
              >
                <Icon
                  className={cn(
                    "size-[19px] transition-transform duration-200 group-active:scale-90",
                    active && "fill-brand/15",
                  )}
                  strokeWidth={active ? 2.4 : 2}
                  aria-hidden="true"
                />
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
