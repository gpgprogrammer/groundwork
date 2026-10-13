import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Short original explainers for topic pages (200–400 words each), written once by
 * scripts/write-explainers.ts and reviewed before they ship. Topic id -> markdown-free paragraphs.
 */
let cache: Record<string, string[]> | null = null;

export function explainerFor(topicId: string): string[] | null {
  if (!cache) {
    try {
      cache = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "explainers.json"), "utf8")) as Record<string, string[]>;
    } catch {
      cache = {};
    }
  }
  return cache[topicId] ?? null;
}
