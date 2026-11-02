import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preconnect } from "react-dom";
import { getWatchPageData } from "@/lib/ppv";
import { getSport } from "@/lib/sports";
import { PlayerView } from "@/components/player/PlayerView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getWatchPageData(id);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    return { title: "Watch", robots: { index: false, follow: true } };
  }
  const { match } = result.data;
  const sport = getSport(match.category);
  const description = match.isAlwaysOn
    ? `Watch ${match.title}, an always-on ${sport.name.toLowerCase()} channel, on Maidaan.`
    : `Watch ${match.title} — ${sport.name} on Maidaan, with available sources and streams in one player.`;

  return {
    title: `Watch ${match.title}`,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: `/match/${encodeURIComponent(match.id)}` },
  };
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  preconnect("https://taifood-blog.asia");

  const [{ id }, query] = await Promise.all([params, searchParams]);
  const result = await getWatchPageData(id);
  if (result.status === "not-found") notFound();
  if (result.status === "error") {
    throw new Error("The stream feed is unavailable");
  }

  const requestedSource = typeof query.source === "string" ? query.source : null;
  const requestedStreamValue =
    typeof query.stream === "string" ? Number.parseInt(query.stream, 10) : Number.NaN;
  const requestedStream = Number.isFinite(requestedStreamValue) ? requestedStreamValue : null;

  return (
    <PlayerView
      key={result.data.match.id}
      match={result.data.match}
      groups={result.data.groups}
      requestedSource={requestedSource}
      requestedStream={requestedStream}
    />
  );
}
