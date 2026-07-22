-- Programa de treino: a rotina de exercícios do usuário, pré-carregada na tela
-- de treino. user_id nulo = programa padrão (visível a todos).
create table public.programs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users (id) on delete cascade,
  name       text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.program_exercises (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  target_sets integer,
  target_reps integer,
  sort_order  integer not null default 0
);
create index program_exercises_program_idx on public.program_exercises (program_id, sort_order);

alter table public.programs          enable row level security;
alter table public.program_exercises enable row level security;

create policy "read default or own programs" on public.programs for select
  using (is_default or auth.uid() = user_id);
create policy "insert own programs" on public.programs for insert
  with check (auth.uid() = user_id and not is_default);
create policy "update own programs" on public.programs for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own programs" on public.programs for delete
  using (auth.uid() = user_id);

create policy "read program exercises" on public.program_exercises for select
  using (exists (select 1 from public.programs p
                 where p.id = program_id and (p.is_default or p.user_id = auth.uid())));
create policy "write own program exercises" on public.program_exercises for all
  using (exists (select 1 from public.programs p
                 where p.id = program_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.programs p
                 where p.id = program_id and p.user_id = auth.uid()));

-- Programa padrão inicial (full body), para o primeiro login não vir vazio.
with prog as (
  insert into public.programs (user_id, name, is_default)
  values (null, 'Treino inicial · Full body', true)
  returning id
)
insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
select prog.id, e.id, v.sets, v.reps, v.ord
from prog
join (values
  ('agachamento', 3, 8, 1),
  ('supino-reto', 3, 10, 2),
  ('remada-curvada', 3, 10, 3),
  ('desenvolvimento', 3, 10, 4),
  ('rosca-direta', 3, 12, 5),
  ('prancha', 3, 1, 6)
) as v(slug, sets, reps, ord) on true
join public.exercises e on e.slug = v.slug;
