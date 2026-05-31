create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resumes_title_not_blank check (length(btrim(title)) > 0),
  constraint resumes_content_not_blank check (length(btrim(content)) > 0)
);

create index resumes_user_id_idx
  on public.resumes (user_id);

create unique index resumes_one_primary_per_user_idx
  on public.resumes (user_id)
  where is_primary;

alter table public.resumes enable row level security;

grant select, insert, update, delete
  on table public.resumes
  to authenticated;

create policy "Users can read their own resumes"
  on public.resumes
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own resumes"
  on public.resumes
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own resumes"
  on public.resumes
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own resumes"
  on public.resumes
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.set_resumes_updated_at()
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

create trigger set_resumes_updated_at
  before update on public.resumes
  for each row
  execute function public.set_resumes_updated_at();

create or replace function public.ensure_single_primary_resume()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.is_primary then
    update public.resumes
      set is_primary = false
      where user_id = new.user_id
        and user_id = auth.uid()
        and id <> new.id
        and is_primary = true;
  end if;

  return new;
end;
$$;

create trigger ensure_single_primary_resume
  before insert or update of is_primary on public.resumes
  for each row
  when (new.is_primary = true)
  execute function public.ensure_single_primary_resume();
