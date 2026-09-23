# Groundwork

The best AP and SAT lessons on YouTube, organized by course, unit, and topic, ranked by how well they teach, and matched to each student's class calendar. YouTube's feed meets Khan Academy's structure.

## Run it

```bash
npm install
npm run dev          # http://127.0.0.1:3000
```

## The video library

Videos live in `src/data/youtube.json` (committed, so deploys need no API access). Rebuild it with either:

```bash
npm run ingest            # official YouTube Data API (needs YOUTUBE_API_KEY in .env.local)
npm run ingest:keyless    # no key: reads YouTube's public search/channel pages
npm run ingest:keyless -- --likes   # then fills like counts from the public Return YouTube Dislike API
```

Both search every curriculum topic, add broad course reviews, then crawl the full uploads of the channels that appear most often. Each video is classified into its topic by title and description (`src/lib/catalog/match.ts`); uploads that can't be placed confidently are dropped. Responses are cached in `.cache/`, so reruns are cheap and resumable.

**Prefer the official API for production.** Automated page reads aren't covered by YouTube's API terms, and YouTube can change its page format at any time. The keyless path exists so the library can be built without a key.

Clicking a video goes through `/go/:id`, which records the open in the student's history and redirects to YouTube.

## Ranking

`src/lib/ranking.ts`, explained at `/how-ranking-works`: helpfulness (Groundwork student votes anchored to YouTube like rate) 30%, like rate 20%, topic fit 20%, reach 15%, saves 10%, discussion 5%. Every feed can also be sorted by most helpful, views, likes, newest, shortest, longest, or most discussed, and filtered by length.

## Calendar sync

Students paste a private iCal link (Google Calendar, Canvas, Schoology, Apple Calendar, Outlook) or upload an `.ics` file during onboarding or on `/schedule`. `src/lib/ics.ts` parses events (folded lines, all-day dates, weekly recurrences), keeps school-related ones, and matches them to courses and topics. Upcoming tests and assignments drive the "Coming up on your calendar" shelf and the For you feed. Fetching is SSRF-guarded (`src/lib/schedule.ts`): https only, public IPs only, every redirect checked, 3 MB cap.

## Accounts and data

Without Supabase, accounts and activity are stored in `.data/state.json` (local development). **For real users, connect Supabase**:

1. Create a project, run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Add `{APP_URL}/auth/callback` as an Auth redirect URL; enable Google if you want the Google button.

The database stores only per-student data (profiles, history, saves, votes, mastery, schedules, subscriptions) under row-level security.

## Billing

Browsing is free. Groundwork Plus ($10/month, 30 days free) unlocks calendar sync. `npm run stripe:setup` creates the price; point a webhook at `/api/billing/webhook`. Without Stripe keys, checkout is simulated and labeled as such.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test                       # Playwright unit + end-to-end tests
node scripts/screens.mjs out   # desktop + mobile screenshots
```

AP® and SAT® are trademarks of the College Board, which is not affiliated with Groundwork. Videos belong to their creators and play on YouTube.
