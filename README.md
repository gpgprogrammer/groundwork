# Groundwork

Short, excellent lessons for AP and SAT, ranked by how well they teach.

Students pick a course, drill down (course → unit → concept → topic), read a two-sentence explanation, and watch the lessons other students actually finish. Every lesson spotlights its educator, and tutoring is offered once, after the lesson: “Liked this lesson? Learn with Sarah.”

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

No setup required. With no env vars, the app runs in **demo mode**:

- Data lives in `.data/demo-state.json` (delete it to reset; it reseeds itself).
- Two seeded accounts (password `groundwork`), also available as one-click buttons on `/login`:
  - **Student**: `maya@demo.groundwork.study`. Mid-trial, with history, saves, and votes.
  - **Educator**: `sarah@demo.groundwork.study`. Has a creator studio with analytics and tutoring requests.
- Checkout is simulated (clearly labeled on the billing page).

## Production setup

Copy `.env.example` to `.env.local` and fill it in.

**Supabase (auth + Postgres)**
1. Create a project. Run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` (regenerate with `npm run db:seed` after editing content).
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
3. In Auth settings, add `<APP_URL>/auth/callback` as a redirect URL. Enabling Google shows the Google button.
4. To link an existing educator row to a real account: `update educators set owner_id = '<auth user id>' where handle = 'sarah-chen'; update profiles set role = 'creator', educator_id = 'edu_sarah-chen' where id = '<auth user id>';`

**Stripe ($10/month after a free month)**
1. `STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup` creates the product and price and prints `STRIPE_PRICE_ID`.
2. Point a webhook at `/api/billing/webhook` for `checkout.session.completed` and `customer.subscription.*`, then set `STRIPE_WEBHOOK_SECRET`.
3. Enable the Customer Portal in the Stripe dashboard. Whatever is left of the student's free month carries over as a Stripe trial, so subscribing early never costs them free days.

No keys are hardcoded anywhere. Each integration turns on when its variables are present.

## How ranking works

`src/lib/ranking.ts`, with the full explanation at `/how-ranking-works`.

| Signal | Weight | Notes |
| --- | --- | --- |
| Completion rate | 35% | Bayesian-smoothed toward 45% over 150 views |
| Helpful votes | 25% | Wilson lower bound, so 900/1000 beats 9/10 |
| Saves per viewer | 20% | Smoothed and capped at 12% |
| Engagement quality | 15% | Watch depth, rewatches, early drop-off |
| Views | 5% | Log-scaled, used as a tiebreaker |

A lesson only counts as completed when the viewer reaches 90% **and** actually watched at least half of it, so seeking to the end doesn't inflate the score. Live engagement is merged into baseline stats by the `video_stats` view in Postgres, or by the demo store locally.

## Architecture

```
src/
  app/(site)/          Landing, courses, topics, watch, educators, search, dashboard, library, settings, creator studio
  app/(focus)/         Sign in, sign up, onboarding (minimal chrome)
  app/actions/         Server actions: auth, learning (save/vote/profile/tutoring), creator
  app/api/             search, progress beacons, Stripe checkout/portal/webhook
  lib/catalog/         Curriculum content, catalog builder, indexed catalog
  lib/data/            Store interface + demo (JSON) and Supabase implementations
  lib/ranking.ts       Quality score
  lib/search.ts        Field-weighted, typo-tolerant search
  lib/recommend.ts     Continue watching, next topic, recommendations
  proxy.ts             Supabase session refresh (Next 16 "proxy", formerly middleware)
supabase/              Schema with RLS, trigger, stats view, FTS/trigram indexes; generated seed
```

## About the seed content

The curriculum (6 courses, 91 topics with real summaries) was written for this app. The **educators are fictional**, and the **272 lessons have no video files**: their titles, chapters, and engagement stats are generated deterministically from the curriculum. Those lessons play in a built-in chapter player that has a real clock, scrubbing, speed control, keyboard shortcuts, resume, and progress reporting. Lessons created in the studio with a media URL play as real video through the same tracking. Replace the seed with real lessons and educators before launch.

Marketing copy (FAQ answers, educator credentials, "AP Reader" claims) is placeholder and should be reviewed before public use.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test                       # Playwright: unit tests + end-to-end flows (starts dev server if needed)
node scripts/screens.mjs out   # desktop + mobile screenshots of every page
```
