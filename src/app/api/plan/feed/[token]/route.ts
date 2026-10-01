import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";
import { planToIcs } from "@/lib/plan";
import { getPlanPrefs, userForFeed } from "@/lib/plan-store";

/**
 * Private calendar feed from the retired nightly study plan. Kept so calendars already
 * subscribed to it don't error; it now has no events, so old study sessions drop off.
 */
export async function GET(_: Request, ctx: RouteContext<"/api/plan/feed/[token]">) {
  const token = (await ctx.params).token.replace(/\.ics$/, "");
  const userId = await userForFeed(token);
  if (!userId) return new Response("Not found", { status: 404 });
  const store = await getStore();
  const state = await store.getUserState(userId);
  if (!state) return new Response("Not found", { status: 404 });
  const prefs = await getPlanPrefs(userId);
  return new Response(planToIcs([], prefs, env.appUrl), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=900" },
  });
}
