create type public.resume_insight_status as enum (
  'draft',
  'reviewed',
  'stale',
  'failed'
);

create table public.resume_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  source_content_hash text not null,
  summary text not null,
  structured_data jsonb not null default '{}'::jsonb,
  profile_suggestions jsonb not null default '[]'::jsonb,
  reusable_answer_suggestions jsonb not null default '[]'::jsonb,
  missing_info_questions jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  limitations jsonb not null default '[]'::jsonb,
  model_id text,
  status public.resume_insight_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resume_insights_source_content_hash_not_blank
    check (length(btrim(source_content_hash)) > 0),
  constraint resume_insights_summary_not_blank
    check (length(btrim(summary)) > 0)
);

create index resume_insights_user_id_idx
  on public.resume_insights (user_id);

create index resume_insights_resume_id_idx
  on public.resume_insights (resume_id);

create index resume_insights_source_content_hash_idx
  on public.resume_insights (source_content_hash);

create index resume_insights_resume_id_source_content_hash_idx
  on public.resume_insights (resume_id, source_content_hash);

alter table public.resume_insights enable row level security;

grant select, insert, update, delete
  on table public.resume_insights
  to authenticated;

create policy "Users can read their own resume insights"
  on public.resume_insights
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create insights for their own resumes"
  on public.resume_insights
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.resumes
      where resumes.id = resume_insights.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can update insights for their own resumes"
  on public.resume_insights
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.resumes
      where resumes.id = resume_insights.resume_id
        and resumes.user_id = auth.uid()
    )
  );

create policy "Users can delete their own resume insights"
  on public.resume_insights
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.set_resume_insights_updated_at()
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

create trigger set_resume_insights_updated_at
  before update on public.resume_insights
  for each row
  execute function public.set_resume_insights_updated_at();
