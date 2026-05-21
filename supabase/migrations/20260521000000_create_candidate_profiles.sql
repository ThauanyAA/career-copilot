create table public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  headline text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  target_roles text[] not null default '{}',
  skills text[] not null default '{}',
  salary_expectation text,
  notice_period text,
  work_authorization text,
  english_level text,
  relocation_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidate_profiles enable row level security;

grant select, insert, update, delete
  on table public.candidate_profiles
  to authenticated;

create policy "Users can read their own candidate profile"
  on public.candidate_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own candidate profile"
  on public.candidate_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own candidate profile"
  on public.candidate_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own candidate profile"
  on public.candidate_profiles
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.set_candidate_profiles_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_candidate_profiles_updated_at
  before update on public.candidate_profiles
  for each row
  execute function public.set_candidate_profiles_updated_at();
