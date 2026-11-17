/**
 * The fetch every Supabase client uses. Supabase being slow or unreachable used to stall every page
 * for 8–16 seconds (each request waited on the network). Now:
 *  - each call gives up after a few seconds, and
 *  - after a network failure, calls fail instantly for a short cool-down instead of each waiting again.
 * Pages already treat a failed read as "no live data", so the site stays fast while the database is down.
 */
const TIMEOUT_MS = Number(process.env.SUPABASE_TIMEOUT_MS) || 4000;
const COOLDOWN_MS = 20_000;

let downUntil = 0;

export function supabaseIsDown() {
  return Date.now() < downUntil;
}

export const resilientFetch: typeof fetch = async (input, init) => {
  if (supabaseIsDown()) throw new TypeError("Supabase unavailable (cooling down after a failed request)");
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  try {
    const res = await fetch(input, { ...init, signal });
    // 5xx from the gateway (paused project, overloaded pooler) counts as down too.
    if (res.status === 502 || res.status === 503 || res.status === 504 || res.status === 540) downUntil = Date.now() + COOLDOWN_MS;
    return res;
  } catch (err) {
    if (!init?.signal?.aborted) downUntil = Date.now() + COOLDOWN_MS;
    throw err;
  }
};
