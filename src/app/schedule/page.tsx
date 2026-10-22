import type { Metadata } from "next";
import { getActiveCards } from "@/lib/streamed";
import { ScheduleView } from "@/components/discovery/ScheduleView";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "Every upcoming sports fixture and 24/7 channel on Maidaan, grouped by your local day. Find kickoff times and plan your next watch.",
  alternates: { canonical: "/schedule" },
};

export default async function SchedulePage() {
  const { ok, cards, generatedAt } = await getActiveCards();
  return <ScheduleView cards={cards} generatedAt={generatedAt} feedOk={ok} />;
}
