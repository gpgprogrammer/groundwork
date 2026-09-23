import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { curriculum } from "@/lib/catalog";
import type { ScheduleEvent } from "@/lib/types";
import { eventsFromIcs } from "./ics";

export { parseIcs } from "./ics";

export function buildEvents(ics: string, courseHints: string[]): ScheduleEvent[] {
  return eventsFromIcs(ics, curriculum, courseHints);
}

/**
 * Calendar sync: fetches and parses iCalendar (.ics) feeds from Google
 * Calendar, Apple Calendar, Canvas, Schoology, Outlook, and anything else that
 * publishes an iCal address, then matches events to curriculum topics.
 */

const MAX_BYTES = 3 * 1024 * 1024;

export class ScheduleError extends Error {}

function isPrivateAddress(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") || v.startsWith("::ffff:") && isPrivateAddress(v.slice(7));
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublicHost(url: URL) {
  if (url.protocol !== "https:") throw new ScheduleError("Use an https:// (or webcal://) calendar link.");
  const host = url.hostname;
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true }).catch(() => [])).map((a) => a.address);
  if (!addresses.length) throw new ScheduleError("We couldn't reach that calendar's server.");
  if (addresses.some(isPrivateAddress)) throw new ScheduleError("That calendar address isn't allowed.");
}

/** Fetches a calendar feed, refusing internal addresses and oversized files. */
export async function fetchCalendar(rawUrl: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl.trim().replace(/^webcal:\/\//i, "https://"));
  } catch {
    throw new ScheduleError("That doesn't look like a calendar link.");
  }
  let res: Response | null = null;
  // Follow up to 3 redirects by hand so every hop is checked.
  for (let hop = 0; hop < 4; hop++) {
    await assertPublicHost(url);
    res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { Accept: "text/calendar, */*" } }).catch(() => {
      throw new ScheduleError("We couldn't download that calendar. Check that the link is the public (secret) iCal address.");
    });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!location) break;
    url = new URL(location, url);
    res = null;
  }
  if (!res) throw new ScheduleError("That calendar link redirected too many times.");
  if (!res.ok) throw new ScheduleError(`The calendar server answered ${res.status}. Check the link and try again.`);
  const reader = res.body?.getReader();
  if (!reader) throw new ScheduleError("That calendar was empty.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) throw new ScheduleError("That calendar is too large to import (over 3 MB).");
    chunks.push(value);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text.includes("BEGIN:VCALENDAR")) throw new ScheduleError("That link didn't return a calendar. Use the iCal/ICS address, not the web page.");
  return text;
}

