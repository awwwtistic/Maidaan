import type { Metadata } from "next";
import { getCatalog } from "@/lib/ppv";
import { MyListView } from "@/components/discovery/MyListView";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "My List",
  description:
    "Your saved matches on Maidaan. Kept locally in your browser so it is ready the next time you open the app.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/my-list" },
};

export default async function MyListPage() {
  const catalog = await getCatalog();
  const liveIds = catalog.ok
    ? catalog.matches.filter((match) => match.isLive).map((match) => match.id)
    : null;

  return <MyListView liveIds={liveIds} feedOk={catalog.ok} />;
}
