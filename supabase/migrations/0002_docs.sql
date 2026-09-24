-- Documents for newer features: billing and entitlements, exam sprints, educator
-- content, tutor bookings and commissions, AI caches. Only the server (service
-- role) reads or writes these; every access is checked in server actions first.
create table if not exists public.docs (
  collection text not null,
  id text not null,
  owner uuid references auth.users (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);

create index if not exists docs_owner_idx on public.docs (collection, owner);

alter table public.docs enable row level security;
-- No policies: anon and authenticated roles get no access. The service role bypasses RLS.
