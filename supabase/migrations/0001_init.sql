-- Groundwork schema. Apply with `supabase db push` or paste into the SQL editor.

create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ─── Catalog ──────────────────────────────────────────────────────────────────

create table public.courses (
  id text primary key,
  slug text not null unique,
  title text not null,
  short_title text not null,
  exam text not null check (exam in ('AP', 'SAT')),
  subject text not null,
  description text not null,
  hue int not null default 230,
  exam_month text not null default '',
  position int not null default 0
);

create table public.units (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  position int not null
);

create table public.concepts (
  id text primary key,
  unit_id text not null references public.units (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  slug text not null,
  title text not null,
  position int not null
);

-- array_to_string is only STABLE, so generated columns need an immutable wrapper.
create function public.immutable_join(text[]) returns text
language sql immutable parallel safe as $$ select array_to_string($1, ' ') $$;

create table public.topics (
  id text primary key,
  concept_id text not null references public.concepts (id) on delete cascade,
  unit_id text not null references public.units (id) on delete cascade,
  course_id text not null references public.courses (id) on delete cascade,
  slug text not null unique,
  title text not null,
  summary text not null,
  glyph text not null default '',
  key_points text[] not null default '{}',
  aliases text[] not null default '{}',
  position int not null,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(public.immutable_join(aliases), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'C')
  ) stored
);
create index topics_search_idx on public.topics using gin (search);
create index topics_title_trgm_idx on public.topics using gin (title gin_trgm_ops);
create index topics_course_idx on public.topics (course_id, position);

create table public.educators (
  id text primary key,
  handle text not null unique,
  owner_id uuid unique references auth.users (id) on delete set null,
  name text not null,
  headline text not null default '',
  bio text not null default '',
  subjects text[] not null default '{}',
  course_ids text[] not null default '{}',
  credentials text[] not null default '{}',
  rating numeric(3, 2) not null default 0,
  rating_count int not null default 0,
  hourly_rate int not null default 0,
  years_teaching int not null default 0,
  location text not null default '',
  response_time text not null default '',
  accepting_students boolean not null default true,
  booking_url text,
  hue int not null default 230
);

create table public.videos (
  id text primary key default ('v' || substr(md5(gen_random_uuid()::text), 1, 8)),
  topic_id text not null references public.topics (id) on delete cascade,
  educator_id text not null references public.educators (id) on delete cascade,
  title text not null,
  description text not null default '',
  style text not null check (style in ('Concept', 'Practice', 'Common mistakes', 'Exam strategy')),
  duration_sec int not null check (duration_sec > 0),
  published_at timestamptz not null default now(),
  chapters jsonb not null default '[]',
  media_url text,
  status text not null default 'published' check (status in ('published', 'draft')),
  -- Baseline engagement imported from before launch (zero for new uploads).
  base_views int not null default 0,
  base_completions int not null default 0,
  base_avg_watch_fraction numeric not null default 0,
  base_helpful int not null default 0,
  base_not_helpful int not null default 0,
  base_saves int not null default 0,
  base_rewatch_rate numeric not null default 0,
  base_early_drop_rate numeric not null default 0.3,
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
  ) stored
);
create index videos_topic_idx on public.videos (topic_id);
create index videos_educator_idx on public.videos (educator_id);
create index videos_search_idx on public.videos using gin (search);

-- ─── People ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'student' check (role in ('student', 'creator')),
  educator_id text references public.educators (id) on delete set null,
  onboarded boolean not null default false,
  course_ids text[] not null default '{}',
  exam_date date,
  goal text,
  daily_minutes int,
  created_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '30 days')
);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'none' check (status in ('none', 'trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ─── Learning activity ────────────────────────────────────────────────────────

create table public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.videos (id) on delete cascade,
  position int not null default 0,
  seconds_watched int not null default 0,
  duration int not null,
  completed boolean not null default false,
  watch_count int not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, video_id)
);
create index progress_user_recent_idx on public.progress (user_id, updated_at desc);

create table public.saves (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.votes (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null references public.videos (id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.tutoring_requests (
  id uuid primary key default gen_random_uuid(),
  educator_id text not null references public.educators (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  course_id text references public.courses (id) on delete set null,
  message text not null check (char_length(message) between 1 and 2000),
  availability text not null default '',
  status text not null default 'new' check (status in ('new', 'replied', 'scheduled', 'archived')),
  source_video_id text references public.videos (id) on delete set null,
  created_at timestamptz not null default now()
);
create index tutoring_educator_idx on public.tutoring_requests (educator_id, created_at desc);

-- ─── Live stats (aggregates only; no per-user data leaves this view) ─────────

create view public.video_stats as
select
  v.id as video_id,
  v.base_views + coalesce(p.views, 0) as views,
  v.base_completions + coalesce(p.completions, 0) as completions,
  case when v.base_views + coalesce(p.views, 0) = 0 then 0
       else (v.base_avg_watch_fraction * v.base_views + coalesce(p.watch_fraction_sum, 0))
            / (v.base_views + coalesce(p.views, 0)) end as avg_watch_fraction,
  v.base_helpful + coalesce(vt.helpful, 0) as helpful,
  v.base_not_helpful + coalesce(vt.not_helpful, 0) as not_helpful,
  v.base_saves + coalesce(s.saves, 0) as saves,
  case when v.base_views + coalesce(p.views, 0) = 0 then 0
       else (v.base_rewatch_rate * v.base_views + coalesce(p.rewatches, 0))
            / (v.base_views + coalesce(p.views, 0)) end as rewatch_rate,
  v.base_early_drop_rate as early_drop_rate
from public.videos v
left join (
  select video_id,
         count(*) as views,
         count(*) filter (where completed) as completions,
         sum(least(1, seconds_watched::numeric / nullif(duration, 0))) as watch_fraction_sum,
         count(*) filter (where watch_count > 1) as rewatches
  from public.progress group by video_id
) p on p.video_id = v.id
left join (
  select video_id,
         count(*) filter (where value = 1) as helpful,
         count(*) filter (where value = -1) as not_helpful
  from public.votes group by video_id
) vt on vt.video_id = v.id
left join (select video_id, count(*) as saves from public.saves group by video_id) s on s.video_id = v.id;

-- ─── New users get a profile, a 30-day trial, and an empty subscription ──────

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.subscriptions (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row level security ───────────────────────────────────────────────────────

alter table public.courses enable row level security;
alter table public.units enable row level security;
alter table public.concepts enable row level security;
alter table public.topics enable row level security;
alter table public.educators enable row level security;
alter table public.videos enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.progress enable row level security;
alter table public.saves enable row level security;
alter table public.votes enable row level security;
alter table public.tutoring_requests enable row level security;

create policy "catalog is public" on public.courses for select using (true);
create policy "catalog is public" on public.units for select using (true);
create policy "catalog is public" on public.concepts for select using (true);
create policy "catalog is public" on public.topics for select using (true);
create policy "educators are public" on public.educators for select using (true);
create policy "educators edit own profile" on public.educators for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "published videos are public" on public.videos for select
  using (status = 'published' or educator_id in (select id from public.educators where owner_id = auth.uid()));
create policy "educators add own videos" on public.videos for insert
  with check (educator_id in (select id from public.educators where owner_id = auth.uid()) and base_views = 0);
create policy "educators edit own videos" on public.videos for update
  using (educator_id in (select id from public.educators where owner_id = auth.uid()));

create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Role, educator link, and trial dates are only changed by the server (service role).
revoke update on public.profiles from authenticated, anon;
grant update (name, onboarded, course_ids, exam_date, goal, daily_minutes) on public.profiles to authenticated;

create policy "read own subscription" on public.subscriptions for select using (user_id = auth.uid());

create policy "own progress" on public.progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own saves" on public.saves for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own votes" on public.votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "anyone can request tutoring" on public.tutoring_requests for insert
  with check (status = 'new' and (user_id is null or user_id = auth.uid()));
create policy "educators read their requests" on public.tutoring_requests for select
  using (educator_id in (select id from public.educators where owner_id = auth.uid()));
create policy "educators update their requests" on public.tutoring_requests for update
  using (educator_id in (select id from public.educators where owner_id = auth.uid()));

grant select on public.video_stats to anon, authenticated;
