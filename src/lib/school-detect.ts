import "server-only";
import { getStore } from "@/lib/data/store";

/**
 * Finds a student's school portal with as little typing as possible: from what
 * classmates at the same email domain already connected, or by checking whether
 * the school has a Blackbaud or Canvas site at the obvious address.
 */

export type SchoolPortal = { system: "blackbaud" | "canvas" | "schoology"; host: string; calendarUrl: string };

const FREEMAIL = /^(gmail|googlemail|icloud|me|mac|yahoo|ymail|outlook|hotmail|live|msn|aol|proton|protonmail|pm|gmx|mail|comcast|verizon|att|sbcglobal)\./i;

export function portalFor(host: string): SchoolPortal | null {
  const h = host.toLowerCase();
  if (h.endsWith(".myschoolapp.com") || h.endsWith(".blackbaud.com")) return { system: "blackbaud", host: h, calendarUrl: `https://${h}/app/student#calendar` };
  if (h.endsWith(".instructure.com")) return { system: "canvas", host: h, calendarUrl: `https://${h}/calendar` };
  if (h.endsWith(".schoology.com")) return { system: "schoology", host: h, calendarUrl: `https://${h}/calendar` };
  return null;
}

const domainOf = (email: string) => email.split("@")[1]?.toLowerCase() ?? "";

async function probe(url: string, ok: (res: Response) => boolean) {
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(4000), headers: { "User-Agent": "Mozilla/5.0 (Merit calendar setup)" }, cache: "no-store" });
    return ok(res);
  } catch {
    return false;
  }
}

/** Checks that a Blackbaud school site exists (it redirects to /app; unknown schools don't resolve). */
export async function blackbaudExists(prefix: string) {
  const p = prefix.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!p) return null;
  const ok = await probe(`https://${p}.myschoolapp.com/`, (r) => r.status >= 300 && r.status < 400 && /\/app/.test(r.headers.get("location") ?? ""));
  return ok ? portalFor(`${p}.myschoolapp.com`) : null;
}

export async function detectSchoolPortal(email: string): Promise<SchoolPortal | null> {
  const domain = domainOf(email);
  if (!domain || FREEMAIL.test(domain)) return null;
  const saved = await (await getStore()).getDoc<{ host: string }>("schoolPortals", domain);
  if (saved) return portalFor(saved.host);
  const labels = domain.split(".");
  const base = labels.length > 2 ? labels[labels.length - 2] : labels[0];
  const candidates = [...new Set([base, labels[0], base.replace(/-/g, "")])];
  for (const c of candidates) {
    const bb = await blackbaudExists(c);
    if (bb) return bb;
  }
  for (const c of candidates) {
    if (await probe(`https://${c}.instructure.com/`, (r) => r.status >= 300 && r.status < 400 && /login/.test(r.headers.get("location") ?? ""))) return portalFor(`${c}.instructure.com`);
  }
  return null;
}

/** After a student connects a school feed, classmates with the same email domain get it found for them. */
export async function rememberSchoolPortal(email: string, feedUrl: string) {
  const domain = domainOf(email);
  if (!domain || FREEMAIL.test(domain)) return;
  try {
    const portal = portalFor(new URL(feedUrl).hostname);
    if (portal) await (await getStore()).putDoc("schoolPortals", domain, { host: portal.host, at: new Date().toISOString() });
  } catch {}
}
