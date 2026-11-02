import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { NAV_LINKS, PPV_DOCS_URL, PPV_URL, SITE_NAME } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.07] bg-ink-soft/60">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-16 lg:py-16">
        <div className="space-y-5">
          <Logo className="-my-1.5 py-1.5" />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            A faster, calmer way to find the match you actually want to watch.
          </p>
          <p className="text-xs leading-relaxed text-muted-dim">
            © {new Date().getFullYear()} {SITE_NAME}
          </p>
        </div>

        <div>
          <h2 className="mb-4 font-display text-sm uppercase tracking-[0.12em] text-white">
            Explore
          </h2>
          <ul className="space-y-2.5">
            {[...NAV_LINKS, { href: "/search", label: "Search" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h2 className="mb-4 font-display text-sm uppercase tracking-[0.12em] text-white">
            About the streams
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Live data, posters and third-party player embeds are provided by{" "}
            <a
              href={PPV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-white underline decoration-white/25 underline-offset-4 transition-colors hover:text-brand"
            >
              PPV.st
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            . Read the{" "}
            <a
              href={PPV_DOCS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 underline decoration-white/20 underline-offset-4 transition-colors hover:text-brand"
            >
              API docs
            </a>
            .
          </p>
          <p className="text-xs leading-relaxed text-muted-dim">
            {SITE_NAME} does not host or control any stream. Availability, quality and
            advertising inside players are set by each provider. Not affiliated with any
            league or broadcaster.
          </p>
        </div>
      </div>
    </footer>
  );
}
