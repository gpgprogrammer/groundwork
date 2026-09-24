# Groundwork

Every AP course and the SAT, with the best YouTube lessons organized by course, unit, and topic, ranked by how well they teach, and matched to each student's class calendar. Plus a tutoring hub: the best tutors near you and online, the best free teachers on each topic, and trusted tutoring services. Free for students.

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

`src/lib/ranking.ts`, explained at `/how-ranking-works`: reach (log-scaled views) 25%, Groundwork student helpful votes 20%, YouTube like rate 20%, topic fit 20%, saves 10%, discussion 5%. Every feed can also be sorted by most helpful, views, likes, newest, shortest, longest, or most discussed, and filtered by length.

## Calendar sync

Students paste a private iCal link (Google Calendar, Canvas, Schoology, Apple Calendar, Outlook) or upload an `.ics` file during onboarding or on `/schedule`. `src/lib/ics.ts` parses events (folded lines, all-day dates, weekly recurrences), keeps school-related ones, and matches them to courses and topics. Upcoming tests and assignments drive the "Coming up on your calendar" shelf and the For you feed. Fetching is SSRF-guarded (`src/lib/schedule.ts`): https only, public IPs only, every redirect checked, 3 MB cap.

## Courses

All 40 AP courses plus SAT Math and SAT Reading & Writing (42 total, about 240 units and 570 topics), defined in `src/lib/catalog/content/` and assembled by `src/lib/catalog/build.ts`. Topic ids are scoped as `course-id/topic-slug`. AP Calculus AB is derived from BC (minus the BC-only units) and shares BC's videos for the overlapping topics. Adding a course is one `course(meta, units)` entry. The ingest scripts read the curriculum, so a new course gets videos on the next ingest (`--courses ap-foo,ap-bar` limits a run to specific courses).

## Tutoring and referrals

`/tutors` shows, per subject:

- **Tutors near you and online**, ranked by a Bayesian average of Groundwork student reviews (a tutor with one 5-star review doesn't outrank one with forty 4.8s). Location comes from the student's profile, or a cookie for visitors.
- **Best free teachers**: the YouTube creators whose lessons rank highest for that course or topic.
- **Tutoring services** (Wyzant, Varsity Tutors, The Princeton Review, Tutor.com, Schoolhouse.world, PrepScholar), deep-linked to the right subject and ZIP.

Tutors list themselves at `/tutors/join`. Students request sessions from a tutor's profile, and requests appear on the tutor's dashboard at `/tutor`. Students can review tutors (but tutors can't review themselves).

**Referrals.** Every outbound link goes through `/r/<service>` or `/r/tutor/<id>`, which logs a row in `referrals` (service, course, user if signed in, time) before redirecting. That's the ledger for commission deals. When a partner gives you an affiliate code, set `PARTNER_REF_<SERVICE_ID>` (e.g. `PARTNER_REF_WYZANT`) and it's appended to every link. Rankings never take payment into account.

## Accounts and data

Without Supabase, accounts and activity are stored in `.data/state.json` (local development). **For real users, connect Supabase**:

1. Create a project, run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Add `{APP_URL}/auth/callback` as an Auth redirect URL; enable Google if you want the Google button.

The database stores only per-student data (profiles, history, saves, votes, mastery, schedules, tutor listings, reviews, session requests, referrals) under row-level security.

## Pricing

Everything is free for students: no plan, no trial, no card. Revenue later comes from tutoring referrals (above).

## Quality checks

```bash
npm run typecheck
npm run lint
npm test                       # Playwright unit + end-to-end tests
node scripts/screens.mjs out   # desktop + mobile screenshots
```

AP® and SAT® are trademarks of the College Board, which is not affiliated with Groundwork. Videos belong to their creators and play on YouTube.
