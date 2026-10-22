"use client";

import { useEffect } from "react";
import { formatTime } from "@/lib/format";
import type { TimeVariant } from "@/lib/types";

function isTimeVariant(value: string | undefined): value is TimeVariant {
  return (
    value === "time" ||
    value === "short" ||
    value === "card" ||
    value === "day" ||
    value === "full"
  );
}

function formatElement(element: HTMLTimeElement): void {
  const timestamp = Number(element.dataset.ts);
  if (!Number.isFinite(timestamp)) return;
  const variant = isTimeVariant(element.dataset.format) ? element.dataset.format : "card";
  const next = formatTime(timestamp, variant);
  if (element.textContent !== next) element.textContent = next;
  const title = formatTime(timestamp, "full");
  if (element.title !== title) element.title = title;
}

function scan(root: ParentNode): void {
  if (root instanceof HTMLTimeElement && root.matches("time[data-ts]")) {
    formatElement(root);
  }
  root.querySelectorAll?.("time[data-ts]").forEach((node) => {
    if (node instanceof HTMLTimeElement) formatElement(node);
  });
}

export function TimeSync() {
  useEffect(() => {
    scan(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) scan(node);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
