-- Groundwork schema. Apply with `supabase db push` or paste into the SQL editor.
-- The video library is static (src/data/youtube.json, built by `npm run ingest`);
-- the database holds per-student data only.

-- ─── People ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null default '',
  role text not null default 'student' check (role in ('student', 'tutor')),
  onboarded boolean not null default false,
  course_ids text[] not null default '{}',
  exam_date date,
  goal text check (char_length(goal) <= 120),
  focus_topic_ids text[] not null default '{}',
  location jsonb,
  created_at timestamptz not null default now()
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

-- ─── Tutoring marketplace ────────────────────────────────────────────────────

create table public.tutors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  headline text not null check (char_length(headline) <= 120),
  bio text not null check (char_length(bio) <= 2000),
  course_ids text[] not null default '{}',
  hourly_rate int check (hourly_rate between 0 and 1000),
  city text not null default '',
  region text not null default '',
  country text not null default '',
  online boolean not null default true,
  in_person boolean not null default false,
  booking_url text check (booking_url is null or booking_url like 'https://%'),
  years_experience int not null default 0,
  credentials text not null default '',
  created_at timestamptz not null default now()
);

create table public.tutor_reviews (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text not null default '' check (char_length(text) <= 2000),
  created_at timestamptz not null default now(),
  unique (tutor_id, user_id)
);

create table public.tutoring_requests (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutors (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  course_id text,
  message text not null check (char_length(message) between 1 and 2000),
  availability text not null default '',
  status text not null default 'new' check (status in ('new', 'replied', 'scheduled', 'archived')),
  created_at timestamptz not null default now()
);
create index tutoring_requests_tutor_idx on public.tutoring_requests (tutor_id, created_at desc);

-- Every referral to a tutor or partner service, the basis for commission reporting.
create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id text not null,
  kind text not null check (kind in ('service', 'tutor-booking', 'tutor-request')),
  user_id uuid references auth.users (id) on delete set null,
  course_id text,
  created_at timestamptz not null default now()
);
create index referrals_partner_idx on public.referrals (partner_id, created_at desc);

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

-- ─── New users get a profile ──────────────────────────────────────────────────

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Row level security ───────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.history enable row level security;
alter table public.saves enable row level security;
alter table public.votes enable row level security;
alter table public.mastery enable row level security;
alter table public.schedules enable row level security;

create policy "read own profile" on public.profiles for select using (id = auth.uid());
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
-- Role is only changed by the server (service role).
revoke update on public.profiles from authenticated, anon;
grant update (name, onboarded, course_ids, exam_date, goal, focus_topic_ids, location) on public.profiles to authenticated;

create policy "own history" on public.history for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own saves" on public.saves for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own votes" on public.votes for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own mastery" on public.mastery for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own schedule" on public.schedules for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table public.tutors enable row level security;
alter table public.tutor_reviews enable row level security;
alter table public.tutoring_requests enable row level security;
alter table public.referrals enable row level security;

create policy "tutors are public" on public.tutors for select using (true);
create policy "tutors manage own listing" on public.tutors for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "reviews are public" on public.tutor_reviews for select using (true);
create policy "write own review" on public.tutor_reviews for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tutors read their requests" on public.tutoring_requests for select
  using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
create policy "tutors update their requests" on public.tutoring_requests for update
  using (tutor_id in (select id from public.tutors where user_id = auth.uid()));
-- Requests and referrals are inserted by the server after validation; no client access to referrals.
