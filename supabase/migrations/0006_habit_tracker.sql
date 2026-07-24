-- Habit tracker: hábitos definidos pelo usuário + marcações por dia (grid mensal).
create table public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  emoji      text,
  color      text,
  sort_order integer not null default 0,
  archived   boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  log_date date not null,
  unique (habit_id, log_date)
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date);

alter table public.habits     enable row level security;
alter table public.habit_logs enable row level security;

create policy "own habits" on public.habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own habit logs" on public.habit_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
