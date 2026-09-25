import "server-only";
import { getStore } from "@/lib/data/store";
import { buildEvents } from "@/lib/schedule";
import type { ScheduleEvent } from "@/lib/types";

/**
 * "Connect Google Calendar": one click, a Google popup, done. Reads the student's
 * calendars (including the ones Google Classroom makes for each class) with
 * read-only access, and re-syncs on its own. Needs GOOGLE_CLIENT_ID and
 * GOOGLE_CLIENT_SECRET (a Google Cloud OAuth client with the Calendar API on).
 */

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
export const googleCalendarEnabled = Boolean(CLIENT_ID && CLIENT_SECRET);
export const GOOGLE_SOURCE_ID = "src_google";

const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";
const redirectUri = (origin: string) => `${origin}/api/calendar/google/callback`;

export function googleAuthUrl(origin: string, state: string, email: string) {
  const qs = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    login_hint: email,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${qs}`;
}

async function token(body: Record<string, string>) {
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, ...body }), cache: "no-store" });
  const json = (await res.json()) as { access_token?: string; refresh_token?: string; error?: string; error_description?: string };
  if (!res.ok || !json.access_token) throw new Error(json.error_description ?? json.error ?? `Google sign-in failed (${res.status})`);
  return json;
}

export async function exchangeCode(code: string, origin: string) {
  return token({ code, grant_type: "authorization_code", redirect_uri: redirectUri(origin) });
}

type Stored = { refreshToken: string; connectedAt: string };

export async function saveGoogleToken(userId: string, refreshToken: string) {
  await (await getStore()).putDoc("googleCalendar", userId, { refreshToken, connectedAt: new Date().toISOString() } satisfies Stored, userId);
}

export async function forgetGoogle(userId: string) {
  const store = await getStore();
  const t = await store.getDoc<Stored>("googleCalendar", userId);
  if (t) await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(t.refreshToken)}`, { method: "POST" }).catch(() => {});
  await store.deleteDoc("googleCalendar", userId);
}

type GCal = { id: string; summary: string; primary?: boolean; selected?: boolean; hidden?: boolean };
type GEvent = { id: string; status?: string; summary?: string; description?: string; start?: { date?: string; dateTime?: string }; end?: { date?: string; dateTime?: string } };

const SKIP_CALENDAR = /#(holiday|contacts|weeknum)@|addressbook#|birthdays/i;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const icsTime = (t: { date?: string; dateTime?: string }) =>
  t.date ? `;VALUE=DATE:${t.date.replace(/-/g, "")}` : `:${new Date(t.dateTime!).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`;

/** Turns one Google calendar into iCalendar text, so it goes through the same classifier as every other calendar. */
function toIcs(cal: GCal, events: GEvent[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `X-WR-CALNAME:${esc(cal.summary)}`];
  for (const e of events) {
    if (!e.start || e.status === "cancelled") continue;
    lines.push("BEGIN:VEVENT", `UID:${e.id}@google`, `SUMMARY:${esc(e.summary ?? "")}`, `DTSTART${icsTime(e.start)}`);
    if (e.end) lines.push(`DTEND${icsTime(e.end)}`);
    // The calendar's name (for Classroom, the class) helps match the course.
    lines.push(`DESCRIPTION:${esc(`${cal.summary}\n${(e.description ?? "").slice(0, 400)}`)}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Fetches the student's calendars and returns the schoolwork in them. */
export async function syncGoogle(userId: string, courseHints: string[]): Promise<{ events: ScheduleEvent[]; calendars: number }> {
  const stored = await (await getStore()).getDoc<Stored>("googleCalendar", userId);
  if (!stored) throw new Error("Google Calendar isn't connected.");
  const { access_token } = await token({ refresh_token: stored.refreshToken, grant_type: "refresh_token" });
  const auth = { headers: { Authorization: `Bearer ${access_token}` }, cache: "no-store" as const };
  const list = (await (await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=100", auth)).json()) as { items?: GCal[] };
  const calendars = (list.items ?? []).filter((c) => !c.hidden && !SKIP_CALENDAR.test(c.id)).slice(0, 25);
  const from = new Date(Date.now() - 14 * 86400000).toISOString();
  const to = new Date(Date.now() + 200 * 86400000).toISOString();
  const events: ScheduleEvent[] = [];
  for (const cal of calendars) {
    const qs = new URLSearchParams({ timeMin: from, timeMax: to, singleEvents: "true", orderBy: "startTime", maxResults: "2500" });
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${qs}`, auth);
    if (!res.ok) continue;
    const data = (await res.json()) as { items?: GEvent[] };
    // Every calendar except the student's own is treated as a class calendar (Classroom makes one per class).
    events.push(...buildEvents(toIcs(cal, data.items ?? []), courseHints, { school: !cal.primary }).map((e) => ({ ...e, uid: `g:${cal.id}:${e.uid}` })));
  }
  return { events, calendars: calendars.length };
}
