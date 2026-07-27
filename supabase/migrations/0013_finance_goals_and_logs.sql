-- Metas financeiras mensais recorrentes (poupar / gastar / dízimo) por usuário.
alter table profiles
  add column if not exists meta_poupar numeric,
  add column if not exists meta_gastar numeric,
  add column if not exists meta_dizimo numeric;

-- Registros financeiros categorizados, para medir progresso no mês.
create table if not exists finance_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  kind text not null check (kind in ('poupar', 'gastar', 'dizimo')),
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index if not exists finance_logs_user_month_idx
  on finance_logs (user_id, log_date);

alter table finance_logs enable row level security;

drop policy if exists "finance_logs owner" on finance_logs;
create policy "finance_logs owner" on finance_logs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
