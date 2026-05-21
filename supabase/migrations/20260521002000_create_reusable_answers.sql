create type public.reusable_answer_category as enum (
  'salary_expectation',
  'notice_period',
  'work_authorization',
  'relocation',
  'availability',
  'motivation',
  'experience_summary',
  'custom'
);

create table public.reusable_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  category public.reusable_answer_category not null default 'custom',
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reusable_answers_label_not_blank check (length(btrim(label)) > 0),
  constraint reusable_answers_question_not_blank check (length(btrim(question)) > 0),
  constraint reusable_answers_answer_not_blank check (length(btrim(answer)) > 0)
);

create index reusable_answers_user_id_idx
  on public.reusable_answers (user_id);

create index reusable_answers_user_id_category_idx
  on public.reusable_answers (user_id, category);

alter table public.reusable_answers enable row level security;

grant select, insert, update, delete
  on table public.reusable_answers
  to authenticated;

create policy "Users can read their own reusable answers"
  on public.reusable_answers
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create their own reusable answers"
  on public.reusable_answers
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own reusable answers"
  on public.reusable_answers
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own reusable answers"
  on public.reusable_answers
  for delete
  to authenticated
  using (user_id = auth.uid());

create or replace function public.set_reusable_answers_updated_at()
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

create trigger set_reusable_answers_updated_at
  before update on public.reusable_answers
  for each row
  execute function public.set_reusable_answers_updated_at();
