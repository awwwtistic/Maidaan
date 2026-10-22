"use client";

import { useSyncExternalStore } from "react";
import type { CardMatch } from "./types";

const STORAGE_KEY = "maidaan:my-list:v1";

function isNullableString(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

function sanitizeFavorite(value: unknown): CardMatch | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || record.id.length === 0) return null;
  if (typeof record.title !== "string") return null;
  if (typeof record.category !== "string") return null;
  if (typeof record.date !== "number" || !Number.isFinite(record.date)) return null;
  if (!isNullableString(record.posterUrl)) return null;
  if (!isNullableString(record.homeName) || !isNullableString(record.homeBadge)) return null;
  if (!isNullableString(record.awayName) || !isNullableString(record.awayBadge)) return null;
  return {
    id: record.id,
    title: record.title,
    category: record.category,
    date: record.date,
    posterUrl: record.posterUrl,
    isAlwaysOn: record.isAlwaysOn === true,
    isLive: record.isLive === true,
    homeName: record.homeName,
    homeBadge: record.homeBadge,
    awayName: record.awayName,
    awayBadge: record.awayBadge,
    sourceCount:
      typeof record.sourceCount === "number" && Number.isFinite(record.sourceCount)
        ? Math.max(0, record.sourceCount)
        : 0,
  };
}

function readStorage(): CardMatch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const matches: CardMatch[] = [];
    for (const entry of parsed) {
      const favorite = sanitizeFavorite(entry);
      if (!favorite || seen.has(favorite.id)) continue;
      seen.add(favorite.id);
      matches.push(favorite);
    }
    return matches;
  } catch {
    return [];
  }
}

function writeStorage(matches: CardMatch[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch {
    // Storage can be unavailable (private mode / quota). Keep the in-memory state.
  }
}

let state: readonly CardMatch[] | null = null;
let started = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== STORAGE_KEY) return;
  state = readStorage();
  emit();
}

function ensureStarted(): void {
  if (started || typeof window === "undefined") return;
  started = true;
  state = readStorage();
  window.addEventListener("storage", handleStorage);
}

function subscribe(listener: () => void): () => void {
  ensureStarted();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): readonly CardMatch[] | null {
  return state;
}

function getServerSnapshot(): readonly CardMatch[] | null {
  return null;
}

export function useFavorites(): readonly CardMatch[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function commit(next: CardMatch[]): void {
  state = next;
  writeStorage(next);
  emit();
}

export function toggleFavorite(match: CardMatch): void {
  ensureStarted();
  const current = state ?? readStorage();
  const exists = current.some((entry) => entry.id === match.id);
  const next = exists
    ? current.filter((entry) => entry.id !== match.id)
    : [match, ...current];
  commit(next);
}

export function removeFavorite(id: string): void {
  ensureStarted();
  const current = state ?? readStorage();
  commit(current.filter((entry) => entry.id !== id));
}

export function isFavorite(matchId: string): boolean {
  return (state ?? []).some((entry) => entry.id === matchId);
}
