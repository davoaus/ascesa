-- Plano de corrida editável por usuário: uma linha por semana, sessões em JSONB.
create table if not exists run_weeks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_no integer not null,
  sessions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists run_weeks_user_idx on run_weeks (user_id, week_no);

alter table run_weeks enable row level security;

drop policy if exists "run_weeks owner" on run_weeks;
create policy "run_weeks owner" on run_weeks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
