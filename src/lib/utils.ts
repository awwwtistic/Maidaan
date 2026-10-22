import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(value: string | null | undefined, count = 2): string {
  if (!value) return "MF";
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "MF";
  if (words.length === 1) {
    return words[0].replace(/[^\p{L}\p{N}]/gu, "").slice(0, count).toUpperCase() || "MF";
  }
  return words
    .slice(0, count)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, "")[0] ?? "")
    .join("")
    .toUpperCase();
}

export function formatViewers(viewers: number | null | undefined): string | null {
  if (!viewers || viewers <= 0) return null;
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  })
    .format(viewers)
    .toLowerCase();
}

export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
