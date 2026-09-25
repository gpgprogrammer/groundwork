import "server-only";
import { randomUUID } from "node:crypto";
import { getStore } from "@/lib/data/store";

/** Errors the site hit, kept in Merit's own database so admins can see what broke. */
export type ErrorEntry = {
  at: string;
  source: "server" | "browser";
  message: string;
  digest?: string;
  path?: string;
  route?: string;
  kind?: string;
  stack?: string;
};

const clip = (s: string | undefined, n: number) => (s ? s.slice(0, n) : undefined);

/** Not bugs: the visitor closed the page or lost connection mid-load. */
const NOISE = /destination stream closed early|aborted|ECONNRESET|EPIPE|NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK/i;

export async function logError(e: Omit<ErrorEntry, "at">) {
  if (NOISE.test(e.message)) return;
  try {
    const entry: ErrorEntry = {
      at: new Date().toISOString(),
      source: e.source,
      message: clip(e.message, 500) ?? "Unknown error",
      ...(e.digest ? { digest: clip(e.digest, 60) } : {}),
      ...(e.path ? { path: clip(e.path.split("?")[0], 300) } : {}),
      ...(e.route ? { route: clip(e.route, 200) } : {}),
      ...(e.kind ? { kind: clip(e.kind, 40) } : {}),
      ...(e.stack ? { stack: clip(e.stack, 2000) } : {}),
    };
    await (await getStore()).putDoc("errors", `${entry.at}_${randomUUID().slice(0, 6)}`, entry);
  } catch (err) {
    // Never let error logging cause another error.
    console.error("[error-log] could not save", err);
  }
}

/** Recent errors grouped by message, most frequent first. */
export async function recentErrors(days = 7) {
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const all = (await (await getStore()).listDocs<ErrorEntry>("errors")).filter((e) => e.at >= since);
  const groups = new Map<string, { message: string; source: ErrorEntry["source"]; count: number; last: ErrorEntry; paths: Set<string> }>();
  for (const e of all) {
    const key = `${e.source}|${e.message}`;
    const g = groups.get(key) ?? { message: e.message, source: e.source, count: 0, last: e, paths: new Set<string>() };
    g.count++;
    if (e.at > g.last.at) g.last = e;
    if (e.path) g.paths.add(e.path);
    groups.set(key, g);
  }
  return { total: all.length, groups: [...groups.values()].sort((a, b) => b.count - a.count || b.last.at.localeCompare(a.last.at)).slice(0, 30) };
}
