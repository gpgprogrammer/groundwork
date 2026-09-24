/** Time-zone conversions without a library (pure; safe on client and server). */

/** Minutes the zone is ahead of UTC at a moment. */
export function offsetMinutes(at: number, tz: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(at))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - at) / 60000);
}

export function validTimeZone(tz: string | null | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock parts in a zone → the UTC instant (ms). */
export function wallToUtc(y: number, mo: number, d: number, h: number, mi: number, s: number, tz: string) {
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  const first = guess - offsetMinutes(guess, tz) * 60000;
  return first - (offsetMinutes(first, tz) - offsetMinutes(guess, tz)) * 60000;
}

/** "2026-10-02" + "16:30" in a zone → the UTC instant (ms). */
export function zonedToUtc(date: string, time: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  return wallToUtc(y, m, d, h, mi, 0, tz);
}
