# Maidaan

**Every Game. One Maidaan**

A cinematic, mobile-first sports streaming front-end powered by the public
[PPV.st API](https://ppv.st/api). Near-black surfaces, poster-first cards, bold
condensed headlines and a crimson live pulse — built to feel fast like a streaming app,
not like a sports data site.

## Features

- **Home** — cinematic hero with a live/match-of-the-hour feature, live rail, upcoming
  fixtures, always-on 24/7 channels and the busiest sport rails.
- **Sports** — editorial bento grid of every discipline, with live counts and quiet-state
  handling.
- **Sport pages** — instant client filters (All / Live / Upcoming / 24/7), staggered grid
  and load-more.
- **Match details** — atmosphere, kickoff/countdown, stream availability, share, My List
  and related matches.
- **Watch player** — validated third-party embeds, source tabs, language/HD/viewer stream
  picker, reload and open-in-new-tab fallbacks.
- **Instant search** — all matches indexed on the server, instant client-side scoring,
  keyboard `/` focus and `Esc` to clear.
- **Schedule** — fixtures grouped by the visitor's local day, day and sport filters,
  live-now and always-on sections.
- **My List** — saved matches in a versioned `localStorage` snapshot with cross-tab sync;
  no account required.

Everything is server-rendered and cacheable. Only small interaction islands ship to the
browser: filters, search, favorites, time-zone formatting and the player controls.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 App Router (React 19, TypeScript strict) |
| Styling | Tailwind CSS v4, CSS-first theme |
| Type | Anton (display) + Manrope (UI) via `next/font` |
| Icons | `lucide-react` |
| Data | PPV.st public API, fetched in React Server Components |
| Motion | CSS transitions/keyframes only — no animation library |
| Images | `next/image`, unoptimized (source images are already tiny WebP) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The npm scripts intentionally run Webpack (`next dev --webpack`, `next build --webpack`).
On machines where the native SWC binary is unavailable, Next falls back to a WASM compiler
and dev server compiles are noticeably slower. Remove the `--webpack` flag if Turbopack
works in your environment.

### Verification

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## Configuration

Both variables are optional.

| Variable | Purpose | Default |
| --- | --- | --- |
| `PPV_API_BASE` | Alternate PPV.st API origin | `https://api.ppv.st/api` |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/Open Graph | `http://localhost:3000` |

Copy `.env.example` to `.env.local` if you need to override them. No API keys are required.

## Data and caching

- All upstream calls live in [`src/lib/ppv.ts`](src/lib/ppv.ts) and run on the server
  only. The browser never calls the PPV.st API for catalog pages.
- A single `GET /api/streams` call supplies categories, fixtures, posters, viewer counts
  and every feed URL. Catalog routes and the data layer both revalidate every 30 seconds;
  requests time out after 8 seconds and retry once on a 502/503/504.
- The data layer is defensive: malformed entries are dropped, feeds without a valid
  allowlisted embed are omitted, and failures return typed empty snapshots. `next build`
  succeeds even when the API is unreachable; runtime ISR repairs pages as soon as the feed
  returns.
- Match IDs are looked up from the catalog. Unknown IDs render the styled 404; a request-time
  API outage renders the retry boundary. An event without a playable feed still has a details
  page and shows “No playable streams” in the player.
- Events flagged `always_live`, starting at `starts_at <= 0`, or tagged `24/7 channel` are
  treated as always-on channels. Live status is derived from `starts_at`/`ends_at`, with a
  four-hour kickoff window when no end time is published. The non-sports `24/7 Streams`
  entertainment category is excluded.

## Project layout

```
src/app/                  routes, layouts, loading/error/404, manifest
src/components/layout/    header, mobile tabs, footer, time sync
src/components/home/      hero, rails, quiet state
src/components/match/     cards, posters, badges, status, favorite, share, time
src/components/browse/    sport tiles and instant filters
src/components/player/    validated iframe player
src/components/discovery/ search, schedule, My List
src/components/common/    shared empty states, headers, skeletons
src/lib/                  data layer, sports config, favorites, formatting
```

## Streams and attribution

Match data, posters and embeds come from [PPV.st](https://ppv.st) and its providers.
Maidaan does not host, proxy or control any stream. Availability, quality and advertising
inside the player are set by each provider. Only `https://taifood-blog.asia` embed URLs are
persisted from the API and every embed is rendered in an iframe without sandboxing (players
require scripts and popups), with `allowFullScreen` and an explicit title.

## Deployment

The app deploys to Vercel with no extra services. Set `NEXT_PUBLIC_SITE_URL` to the public
origin so canonical URLs, Open Graph metadata and robots rules resolve correctly. No
database, auth, cron or runtime secrets are required.
