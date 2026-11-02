import type { Metadata } from "next";
import { getActiveCards } from "@/lib/ppv";
import { SearchView } from "@/components/discovery/SearchView";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search every live event, upcoming fixture, team and 24/7 channel on Maidaan.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function SearchPage() {
  const { ok, cards } = await getActiveCards();
  return <SearchView cards={cards} feedOk={ok} />;
}
