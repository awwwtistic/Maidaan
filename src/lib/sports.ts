import type { SportDefinition } from "./types";

export const SPORTS: readonly SportDefinition[] = [
  { id: "basketball", name: "Basketball", accent: "#FF8A3D", blurb: "Courtside, all night" },
  { id: "football", name: "Football", accent: "#4ADE80", blurb: "The world's game" },
  {
    id: "american-football",
    name: "American Football",
    accent: "#FBBF24",
    blurb: "Friday night lights",
  },
  { id: "hockey", name: "Hockey", accent: "#60A5FA", blurb: "Ice-cold action" },
  { id: "baseball", name: "Baseball", accent: "#FB7185", blurb: "Diamonds are forever" },
  { id: "motor-sports", name: "Motor Sports", accent: "#F472B6", blurb: "Full throttle" },
  { id: "fight", name: "Fight", accent: "#EF4444", blurb: "No holding back" },
  { id: "tennis", name: "Tennis", accent: "#D9F99D", blurb: "Centre court" },
  { id: "rugby", name: "Rugby", accent: "#A78BFA", blurb: "Built for contact" },
  { id: "golf", name: "Golf", accent: "#34D399", blurb: "The quiet thrill" },
  { id: "billiards", name: "Billiards", accent: "#2DD4BF", blurb: "Chalk and cue" },
  { id: "afl", name: "AFL", accent: "#FACC15", blurb: "High-flying footy" },
  { id: "darts", name: "Darts", accent: "#FB923C", blurb: "One hundred and eighty" },
  { id: "cricket", name: "Cricket", accent: "#38BDF8", blurb: "Sixes and silence" },
  { id: "other", name: "Other", accent: "#94A3B8", blurb: "Everything else" },
];

const sportsById = new Map(SPORTS.map((sport) => [sport.id, sport]));

export const OTHER_SPORT = sportsById.get("other")!;

export function getSport(id: string | null | undefined): SportDefinition {
  if (!id) return OTHER_SPORT;
  return sportsById.get(id) ?? { ...OTHER_SPORT, id };
}

export const SPORT_IDS = SPORTS.map((sport) => sport.id);

export function isKnownSport(id: string): boolean {
  return sportsById.has(id);
}
