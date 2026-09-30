# Merit 2.0

A complete visual and UX redesign of Merit Learning, built alongside Merit 1.0 without touching it.

- **Where it lives:** git worktree `~/merit-2`, branch `merit-2.0`, branched from `main` at `3e0550b` (the commit production runs).
- **Merit 1.0:** untouched in `~/groundwork` (including its uncommitted work), still deployed at https://meritlearning.org.
- **Rollback:** nothing to roll back. Production, its Vercel project, env vars, database, and domain were not changed. To discard 2.0: `git worktree remove ~/merit-2 && git branch -D merit-2.0` (from `~/groundwork`).

## Run it

```bash
cd ~/merit-2
npm install            # first time only
npm run preview:2      # http://127.0.0.1:3200
npm run test:2         # full Playwright e2e suite against an isolated build on :3200
npm run shots:2 -- <outDir> [--dark] [--mobile-only|--desktop-only] [--auth=gw_session=...] /route ...
node scripts/qa-session.mjs [teacher]   # creates a local test account and prints its session cookie
```

With no `.env.local`, Merit runs on its built-in **local file store** (`.data/state.json`, gitignored): real sign-up, onboarding, plans, calendars, Sprints, tutoring, and bookings, with no production data involved. Payments run in **test mode** (purchases are granted free, no Stripe calls). Merit AI runs in its **fallback mode** (lessons without a model) unless an AI Gateway key is present.

To point a preview at real services later, copy the env var *names* from `.env.example` and use a **separate** Supabase project and Stripe test keys. Do not reuse production credentials for a preview.

## How it connects to existing services

2.0 is a presentation-layer rebuild. It reuses, unchanged:
- every route and URL (no new or renamed routes, so SEO and bookmarks are intact),
- all server actions (`src/app/actions/*`), API routes (`src/app/api/*`), and redirects (`/go`, `/r`, `/home`, `/watch`),
- all business logic and data access (`src/lib/*`: catalog, ranking, feed, plan, sprint, schedule parsing, billing access, tutoring, bookings, uploads, AI tools),
- auth (Supabase or local sessions), billing (Stripe checkout, portal, webhooks, gifts, Connect payouts), analytics tracking (`/api/track`, funnel events), and metadata/OG images.

What changed is the UI layer: design tokens, primitives, app shell and navigation, and every page and component's markup and styling.

## Design system: "Bold & colorful"

The first pass was a refresh that kept the old layouts; you said it looked the same, and chose the **Bold & colorful** direction (Duolingo / Brilliant energy). The current build is a structural redesign:

- **Five color worlds.** Learn is Merit blue (and every course uses its own two colors), Practice / Exam Sprint is ember, Plan is green, Tutors is violet, Ask AI is pink. Each world has full-bleed hero bands (`WorldBand` in `src/components/learn-band.tsx`).
- **Course worlds.** Course and topic pages open with a hero in the course's own colors and a **unit path** you move along; topics sit on a vertical path with done / up next / not started nodes. Home shows your courses as color cards with their unit paths.
- **Tactile controls.** Buttons and tappable tiles sit on a solid ledge and sink when pressed (`.press` + `--ledge`); tiles are 24px with 2px outlines. Headings use the rounded Nunito face (the wordmark's), body text stays Figtree.
- **Navigation.** The YouTube-style sidebar is gone: a top bar with Learn / Practice / Plan / Tutors / Ask AI (each in its color), a sub-bar for the section you're in, a phone tab bar, and a drawer with everything else.
- **Tokens** (`src/app/globals.css`): cool neutrals, the five world colors with press shades, semantic positive/warn/danger, full light and dark themes; white text only on fills that pass WCAG AA.
- **Motion** (CSS only, no new dependencies): staggered `rise` entries, `pop` menus, bottom-sheet dialogs on phones, `check-pop` on completing tasks and topics, press feedback; everything collapses under reduced motion.

## How it was built (tools and skills)

- **Plan:** UI/UX Pro Max (product, typography, and UX research; its claymorphism and orange-CTA suggestions were rejected as too childish for 15 to 18 year olds), then Taste (design read, dials, anti-slop rules).
- **Build:** Frontend Design principles on the project's own primitives. shadcn/ui MCP was available but not used: Merit has no shadcn setup and adopting it would add dependencies without improving the result.
- **Critique:** Impeccable's detector and Web Interface Guidelines, fixes applied.
- **Motion:** Emil Kowalski's design-engineering rules (strong ease-out, short durations, origin-aware popovers, press feedback, reduced motion), implemented in CSS.
- **Performance:** Vercel React best practices, applied where they fit (the Merit AI chat bundle now loads on demand; one font family instead of five; no new dependencies).
- **Verify:** Playwright e2e suite, Playwright MCP interaction checks, and a screenshot sweep (`scripts/shots.mjs`).

## Information architecture

- **Signed-out:** top navigation (Courses, Lessons, Merit AI, Exam Sprint, Tutors, Pricing), search, Sign in, Get started, and a full site footer.
- **Signed-in:** grouped sidebar (Learn / Study tools / You / Your courses / More from Merit), collapsible to a rail; account menu with every destination the old one had.
- **Phones:** bottom tab bar (Home, Courses, Ask AI, Plan or Sprint, More) plus a full navigation drawer. Merit AI is a tab on phones and a floating panel on desktop.
- **Home:** visitors get a new landing page (course finder in the hero, real product preview, course directory, how Merit helps, how to start, audiences, FAQ). Students get a personal dashboard (continue where you left off, tonight's plan, upcoming tests, your courses).

## Feature inventory and parity checklist

Status: **Implemented** = redesigned and wired to the same logic; **Tested** = exercised by the e2e suite or a scripted browser check in this session; **Blocked** = needs an external service not available locally.

E2E = covered by the Playwright suite (`npm run test:2`); MCP = exercised through the Playwright MCP server; Visual = screenshotted at 1280px and 390px (light, and dark for key pages) with no console errors or horizontal overflow.

| Area | Routes / surfaces | Status |
|---|---|---|
| Landing (signed out) | `/` hero, course finder, product preview, course directory, bento, how to start, audiences, FAQ, final CTA | Implemented · E2E · MCP · Visual |
| Student home (signed in) | `/` continue, tonight, coming up, your courses, onboarding redirect | Implemented · E2E · Visual |
| Navigation | top bar, search suggestions (`/api/search`), ⌘K and /, account menu, sidebar and rail, phone tabs, drawer, footer, skip link | Implemented · E2E · MCP · Visual |
| Lessons feed | `/lessons` chips, sort and length menus, infinite scroll (`/api/feed`), calendar shelf, tutor check-in, Sprint and Plus cards, tutors' videos and quick-lesson shelves, `/home` redirect | Implemented · E2E · MCP · Visual |
| Video actions | open on YouTube via `/go/:id`, Watch later, helpful votes, copy link, channel link, toast | Implemented · E2E (save) · Visual; history test fails in the 1.0 baseline too |
| Courses | `/courses` filter and categories; `/courses/[course]` outline, progress, all videos by unit, top teachers, Exam CTA, course search | Implemented · E2E · Visual |
| Topics | `/courses/[course]/[topic]` ranked lessons, sort, mastery toggle, guides, tutors' videos, unit nav, next topic, fallback lessons, Ask AI | Implemented · E2E · Visual |
| Search | `/search` type chips, course filter, topics, channels, tutors, guides, Merit videos, videos | Implemented · E2E · MCP · Visual |
| Quick lessons, channels | `/shorts`, `/channel/[id]` | Implemented · Visual |
| Merit AI | `/ask`, floating panel (desktop), Ask AI tab (phones), tool cards, quizzes, limits, retry | Implemented · E2E (fallback mode) · MCP · Visual; live model not tested (no key locally) |
| Plan (Plus) | `/plan` tonight, week, check-off, reminders feed (`/api/plan/feed`), settings, locked preview | Implemented · E2E · Visual |
| Schedule | `/schedule` paste, file, link, Google; import preview; sources; resync; hide; wrong match; focus topics; locked sample week | Implemented · E2E · Visual; Google OAuth needs credentials |
| Progress, library | `/progress`, `/library` tabs, clear history, empty states | Implemented · E2E · Visual |
| Exam Sprint | `/sprint`, `/sprint/new`, `/sprint/[id]`, diagnostic, practice, checkpoint, cram sheets, FRQ coach, trial, unlock, settings, delete | Implemented · E2E (create, diagnostic, unlock) · Visual; AI-written questions need a model key |
| Tutors | `/tutors` subject and location, near and online tutors, creators, services (`/r/*` referrals); `/tutors/[id]` booking, message, reviews, report | Implemented · E2E · Visual |
| Tutor side | `/tutors/join`, `/tutor` dashboard, availability, requests, referred students, `/tutor/payouts`, `/tutors/partners` | Implemented · E2E · Visual |
| Bookings | `/bookings`, `/bookings/[id]` confirm, decline, complete, cancel, pay, 10% fee | Implemented · E2E |
| Teachers | `/studio` marketing, profile setup, dashboard, `/studio/video`, `/studio/guide`, `/studio/upload`, `/guides/[id]`, `/educators/[id]` | Implemented · E2E (guide) · Visual |
| Merit videos | `/videos`, `/videos/[id]` player, pending review, delete | Implemented · Visual (list); **Blocked** locally: uploads need Supabase storage (fails in the 1.0 baseline too) |
| Pricing and billing | `/pricing`, `/pricing/parents` gift checkout, `/settings/billing`, checkout routes, paused and test modes | Implemented · E2E (test-mode purchase) · Visual; live Stripe not exercised |
| Account | `/signup` student or teacher, `/login`, `/forgot-password`, `/reset-password`, `/onboarding`, `/settings`, sign out, OAuth buttons | Implemented · E2E · Visual; reset email needs Supabase SMTP (fails in the 1.0 baseline too) |
| Prompts | welcome dialog, schedule promo (5-minute timer), report dialog | Implemented · E2E |
| Admin | `/admin`, `/admin/users` (+ CSV), `/admin/analytics` | Implemented; not rendered locally (needs ADMIN_EMAILS) |
| Content and system | `/about`, `/how-ranking-works`, `/privacy`, `/terms`, 404, error, loading, global error, OG image, sitemap, robots | Implemented · E2E (404, OG) · Visual |

## Test results

| Run | Passed | Failed |
|---|---|---|
| Merit 1.0 baseline (`e2e/flows.spec.ts`, untouched code, same isolated setup) | 26 / 30 | 4 |
| Merit 2.0 (`e2e/flows.spec.ts`) | 27 / 30 | 3 |
| Merit 2.0 bold redesign, full suite (flows + unit + 1 new test) | 43 / 46 | 3 (same three) |

The remaining failures are identical in 1.0 and 2.0 and come from the local environment, not the UI: video upload (needs Supabase storage), password-reset email (needs Supabase SMTP), and a history check that fails the same way on the old code. The teacher-account test, flaky on 1.0, passes on 2.0.

Also checked: `tsc --noEmit` and `eslint` clean; Impeccable detector (1 finding, fixed); Web Interface Guidelines review (fixes applied); 38-route sweep at desktop and phone with no console errors or overflow; Playwright MCP interaction run (course finder, search, sort, tabs, drawer, Ask AI).

## Remaining limitations

- No preview deployment was made. A Vercel preview of this branch would inherit the project's Preview environment variables, which may point at the production database, and the Hobby plan can't password-protect it. Recommended: a separate Supabase project and Stripe test keys for Preview, then `vercel deploy` from `~/merit-2`.
- Not exercised locally: live Merit AI answers and AI-written Sprint questions (need a model key), live Stripe, Google Calendar OAuth, email, video uploads, and admin pages.
- The uncommitted work in `~/groundwork` (the in-progress landing page and billing changes) isn't in 2.0, which branches from the committed `main`. Merge whatever of it you want to keep.
- Behavior changes worth knowing: phones get a bottom tab bar and the floating Merit AI button is desktop-only; the report dialog now also closes with Escape; onboarding gained a course filter; the Sprint ember color moved from `#e0531c` to `#c94b16` so white text passes contrast.

## Migrating to production (when you decide to)

1. Review locally, then in a protected preview deployment backed by non-production services.
2. Bring in the 1.0 changes you want to keep (rebase `merit-2.0` onto the new `main`).
3. Open a PR from `merit-2.0` into `main`; run `npm run build`, `npm run lint`, `npm test`.
4. Deploy a preview, verify, then promote. Rollback is promoting the previous Vercel deployment; there's no data migration because 2.0 changes no data shapes.
