# Merit Learning

Merit ("merit: academic tutoring") helps high schoolers master every AP course and the SAT: the best lessons for every topic, an AI study partner, a nightly study plan, Exam Sprints, teacher-added content, and a tutor marketplace with booking and commission tracking.

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

`src/lib/ranking.ts`, explained at `/how-ranking-works`: reach (log-scaled views) 25%, Merit student helpful votes 20%, YouTube like rate 20%, topic fit 20%, saves 10%, discussion 5%. Every feed can also be sorted by most helpful, views, likes, newest, shortest, longest, or most discussed, and filtered by length.

## Calendar sync

Calendar sync needs Plus or the Exam Sprint pass. Students can connect several calendars at once: iCal links (Blackbaud, Canvas, Schoology, Veracross, Google/Classroom, Outlook, Apple, Brightspace, Moodle), `.ics` uploads, PDF or CSV exports, or pasted text. PDFs and text are read into a review list; nothing is added until the student checks it. Only tests, quizzes, and assignments are kept; canceled events, removed dates, and moved occurrences are honored; a class or topic is attached only when the event names it. Students can hide events or clear a wrong match. Linked calendars refresh every six hours.


Students paste a private iCal link (Google Calendar, Canvas, Schoology, Apple Calendar, Outlook) or upload an `.ics` file during onboarding or on `/schedule`. `src/lib/ics.ts` parses events (folded lines, all-day dates, weekly recurrences), keeps school-related ones, and matches them to courses and topics. Upcoming tests and assignments drive the "Coming up on your calendar" shelf and the For you feed. Fetching is SSRF-guarded (`src/lib/schedule.ts`): https only, public IPs only, every redirect checked, 3 MB cap.

## Courses

All 40 AP courses plus SAT Math and SAT Reading & Writing (42 total, about 240 units and 570 topics), defined in `src/lib/catalog/content/` and assembled by `src/lib/catalog/build.ts`. Topic ids are scoped as `course-id/topic-slug`. AP Calculus AB is derived from BC (minus the BC-only units) and shares BC's videos for the overlapping topics. Adding a course is one `course(meta, units)` entry. The ingest scripts read the curriculum, so a new course gets videos on the next ingest (`--courses ap-foo,ap-bar` limits a run to specific courses).

## Tutoring and referrals

`/tutors` shows, per subject:

- **Tutors near you and online**, ranked by a Bayesian average of Merit student reviews (a tutor with one 5-star review doesn't outrank one with forty 4.8s). Location comes from the student's profile, or a cookie for visitors.
- **Best free teachers**: the YouTube creators whose lessons rank highest for that course or topic.
- **Tutoring services** (Wyzant, Varsity Tutors, The Princeton Review, Tutor.com, Schoolhouse.world, PrepScholar), deep-linked to the right subject and ZIP.

Tutors list themselves at `/tutors/join`. Students request sessions from a tutor's profile, and requests appear on the tutor's dashboard at `/tutor`. Students can review tutors (but tutors can't review themselves).

**Bookings and the 10% commission.** Tutors accept the Merit Partner Terms when they list, then set weekly hours on `/tutor`. Students book open slots from a tutor's profile; the tutor confirms, then marks the session completed. If the tutor has connected Stripe payouts (`/tutor/payouts`, Stripe Connect Express), the student pays through Merit and the 10% is taken as an application fee automatically. Otherwise the student pays the tutor directly and the 10% is recorded as owed; the tutor settles it from `/tutor/payouts`.

**Partners and referrals.** Tutoring businesses apply at `/tutors/partners` and appear on the Tutors page once approved at `/admin`. Every outbound link goes through `/r/<service>` or `/r/tutor/<id>`, which logs a referral. When a partner gives you an affiliate code, set `PARTNER_REF_<SERVICE_ID>`. Rankings never take payment into account.

**Admin.** `/admin` (for the emails in `ADMIN_EMAILS`) shows MRR, Sprint sales, tutoring volume and fees, referral clicks, partner applications, tutor verification, and moderation of teacher content.

## Accounts and data

Without Supabase, accounts and activity are stored in `.data/state.json` (local development). **For real users, connect Supabase**:

1. Create a project, run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. Add `{APP_URL}/auth/callback` as an Auth redirect URL. Enable the Google and Apple providers in Supabase Auth; the buttons appear automatically (`NEXT_PUBLIC_OAUTH_PROVIDERS`, default `google,apple`).

The database stores only per-student data (profiles, history, saves, votes, mastery, schedules, tutor listings, reviews, session requests, referrals), plus a `docs` table (migration `0002_docs.sql`) for billing, sprints, teacher content, bookings, and AI caches under row-level security.

## Pricing and payments

Defined in `src/lib/billing/plans.ts`.

- **Free**: courses, lessons, tutor search, Merit AI (30 questions/day; 5 signed out).
- **Merit Plus**: $4.99/month or $39.99/year: study plan (`/plan`), calendar sync (`/schedule`), reminders (a private iCal feed with alarms), and progress (`/progress`). New accounts get Plus free for `NEXT_PUBLIC_PLUS_TRIAL_DAYS` days (default 30, no card).
- **Exam Sprint**: $14.99 once, **permanently** unlocks Sprints for every class: the AP/SAT exam or any quiz or test on the student's calendar (scoped to the units it covers). Also unlocks calendar sync. The diagnostic is free.
- **Parent checkout** (`/pricing/parents`): anyone can pay for a student's Plus year or Sprint. It unlocks when the student signs in with that email.

Stripe: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, then point a webhook at `/api/billing/webhook` (events: `checkout.session.completed`, `customer.subscription.*`, `account.updated`). Prices are sent inline, so no Stripe products need to be created. **Without a key, checkout runs in labeled test mode**: purchases are granted with no charge.

## Merit AI

`/ask` plus the floating "Ask Merit" panel on every page (Cmd/Ctrl+J). It uses the AI SDK with the Vercel AI Gateway (`MERIT_AI_MODEL`, default `anthropic/claude-sonnet-5`). Its tools search the lesson library, look up curriculum topics and outlines, read the student's plan, find tutors, and render interactive quizzes. On Vercel it authenticates with the deployment's OIDC token. **The Vercel team needs a card on file to unlock AI Gateway credits, or set `ANTHROPIC_API_KEY` to call Anthropic directly.** Until then, Merit AI answers with the best-ranked lessons instead of an explanation. Sprint questions and cram sheets are generated once per topic or unit and cached for everyone.

## Teacher studio

`/studio`: teachers set up a profile, add any public YouTube lesson to a topic with a note, and write study guides. Their picks show a "Picked by …" badge in feeds, and guides appear on the topic page. Public profiles are at `/educators/[id]`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test                       # Playwright unit + end-to-end tests
node scripts/screens.mjs out   # desktop + mobile screenshots
```

AP® and SAT® are trademarks of the College Board, which is not affiliated with Merit. Videos belong to their creators and play on YouTube.
