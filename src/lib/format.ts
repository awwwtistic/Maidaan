import type { TimeVariant } from "./types";

interface FormatOptions {
  locale?: string;
  timeZone?: string;
  now?: number;
}

function dayNumber(timestamp: number, timeZone: string | undefined): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone,
  }).formatToParts(new Date(timestamp));
  const values: Record<string, number> = {};
  for (const part of parts) {
    if (part.type === "year" || part.type === "month" || part.type === "day") {
      values[part.type] = Number(part.value);
    }
  }
  return Date.UTC(values.year ?? 1970, (values.month ?? 1) - 1, values.day ?? 1) / 86_400_000;
}

export function formatTime(
  timestamp: number,
  variant: TimeVariant = "card",
  options: FormatOptions = {},
): string {
  const { locale, timeZone, now = Date.now() } = options;
  const date = new Date(timestamp);
  const time = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).format(date);

  switch (variant) {
    case "time":
      return time;
    case "day":
      return new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone,
      }).format(date);
    case "full":
      return `${new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone,
      }).format(date)} · ${time}`;
    case "short":
      return `${new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        timeZone,
      }).format(date)} · ${time}`;
    case "card":
    default: {
      const difference = dayNumber(timestamp, timeZone) - dayNumber(now, timeZone);
      if (difference === 0) return `Today · ${time}`;
      if (difference === 1) return `Tomorrow · ${time}`;
      return `${new Intl.DateTimeFormat(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone,
      }).format(date)} · ${time}`;
    }
  }
}

/** Deterministic server output; TimeSync replaces it with the visitor's local time. */
export function formatUtcFallback(timestamp: number, variant: TimeVariant): string {
  const base = formatTime(
    timestamp,
    variant === "card" ? "short" : variant,
    { locale: "en-GB", timeZone: "UTC" },
  );
  return variant === "day" ? base : `${base} UTC`;
}

export function formatCountdown(target: number, now: number = Date.now()): string {
  const remaining = target - now;
  if (remaining <= 0) return "Kicking off now";
  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `In ${days}d ${hours % 24}h`;
  if (hours > 0) return `In ${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `In ${minutes}m`;
  return `In ${seconds}s`;
}

export function isoString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function dayHeading(timestamp: number, now: number = Date.now()): string {
  const difference = dayNumber(timestamp, undefined) - dayNumber(now, undefined);
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(timestamp));
}

export function shortDay(timestamp: number): { weekday: string; day: string } {
  const date = new Date(timestamp);
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date),
    day: new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(date),
  };
}
