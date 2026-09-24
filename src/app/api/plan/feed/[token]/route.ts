import { hasPlus, getBilling, plusAccess } from "@/lib/billing/access";
import { getCatalog } from "@/lib/catalog";
import { getStore } from "@/lib/data/store";
import { env } from "@/lib/env";
import { buildPlan, planToIcs } from "@/lib/plan";
import { getPlanPrefs, userForFeed } from "@/lib/plan-store";

/** Private calendar feed of the student's study plan. Their calendar app handles the reminders. */
export async function GET(_: Request, ctx: RouteContext<"/api/plan/feed/[token]">) {
  const token = (await ctx.params).token.replace(/\.ics$/, "");
  const userId = await userForFeed(token);
  if (!userId) return new Response("Not found", { status: 404 });
  const store = await getStore();
  const state = await store.getUserState(userId);
  if (!state) return new Response("Not found", { status: 404 });
  const access = plusAccess(state.profile, await getBilling(userId));
  const prefs = await getPlanPrefs(userId);
  const plan = hasPlus(access) ? buildPlan(await getCatalog(), state, prefs, 14) : [];
  return new Response(planToIcs(plan, prefs, env.appUrl), {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "private, max-age=900" },
  });
}
