-- Resgates de recompensa de missão (idempotência por período).
create table public.mission_claims (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  mission_id text not null,
  period_key text not null,  -- diária: YYYY-MM-DD; semanal: segunda YYYY-MM-DD
  claimed_at timestamptz not null default now(),
  unique (user_id, mission_id, period_key)
);

alter table public.mission_claims enable row level security;
create policy "own mission claims" on public.mission_claims for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
