-- Groundwork schema. Apply with `supabase db push` or paste into the SQL editor.
-- The video library is static (src/data/youtube.json, built by `npm run ingest`);
-- the database holds per-student data only.

-- ─── People ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'student' check (role in ('student', 'creator')),
  onboarded boolean not null default false,
  course_ids text[] not null default '{}',
  exam_date date,
  goal text check (char_length(goal) <= 120),
  focus_topic_ids text[] not null default '{}',
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

-- ─── Learning activity (video ids are YouTube ids) ───────────────────────────

create table public.history (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null check (char_length(video_id) between 6 and 20),
  opened_at timestamptz not null default now(),
  opens int not null default 1,
  primary key (user_id, video_id)
);
create index history_recent_idx on public.history (user_id, opened_at desc);

create table public.saves (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null check (char_length(video_id) between 6 and 20),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.votes (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id text not null check (char_length(video_id) between 6 and 20),
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

create table public.mastery (
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id text not null check (char_length(topic_id) <= 80),
  created_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- Synced calendar (parsed events + the private feed URL). One per student.
create table public.schedules (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ─── Aggregate engagement (read by the server with the service role) ─────────

create view public.video_site_stats with (security_invoker = true) as
select video_id,
       sum(opens) as opens,
       sum(saves) as saves,
       sum(helpful) as helpful,
       sum(not_helpful) as not_helpful
from (
  select video_id, opens, 0 as saves, 0 as helpful, 0 as not_helpful from public.history
  union all select video_id, 0, 1, 0, 0 from public.saves
  union all select video_id, 0, 0, (value = 1)::int, (value = -1)::int from public.votes
) x
group by video_id;
revoke all on public.video_site_stats from anon, authenticated;

-- Opening a video: insert or bump, as the signed-in user.
create function public.record_open(p_video_id text) returns void
language sql security invoker set search_path = public as $$
  insert into public.history (user_id, video_id) values (auth.uid(), p_video_id)
  on conflict (user_id, video_id) do update set opens = history.opens + 1, opened_at = now();
$$;

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

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.history enable row level security;
alter table public.saves enable row level security;
alter table public.votes enable row level security;
alter table public.mastery enable row level security;
alter table public.schedules enable row level security;

create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Role and trial dates are only changed by the server (service role).
revoke update on public.profiles from authenticated, anon;
grant update (name, onboarded, course_ids, exam_date, goal, focus_topic_ids) on public.profiles to authenticated;

create policy "read own subscription" on public.subscriptions for select using (user_id = auth.uid());

create policy "own history" on public.history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own saves" on public.saves for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own votes" on public.votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own mastery" on public.mastery for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own schedule" on public.schedules for all using (user_id = auth.uid()) with check (user_id = auth.uid());
