-- ASCESA — schema base
-- Modelo de dados do RPG de evolução física. O XP mede trabalho real, então o
-- registro guarda carga + reps + séries por exercício para calcular volume.
-- RLS em tudo: cada pessoa só enxerga os próprios dados (auth.uid() = user_id).

-- ---------- perfil ----------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text,
  bodyweight_kg numeric(6, 2),
  height_cm     numeric(5, 1),
  xp_total      integer     not null default 0,
  current_streak integer    not null default 0,
  longest_streak integer    not null default 0,
  last_completed_date date,
  created_at    timestamptz not null default now()
);

-- Atributos do personagem (cada atividade alimenta atributos diferentes).
create table public.user_attributes (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  forca       integer not null default 0,
  resistencia integer not null default 0,
  disciplina  integer not null default 0,
  mobilidade  integer not null default 0,
  saude       integer not null default 0,
  velocidade  integer not null default 0
);

-- ---------- catálogo de exercícios ----------
create table public.exercises (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  category      text not null check (category in ('push', 'pull', 'legs', 'core', 'cardio', 'mobility')),
  primary_muscle text,
  is_bodyweight boolean not null default false,
  is_default    boolean not null default true,
  created_by    uuid references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now()
);

-- Progresso por exercício (nível próprio de cada exercício).
create table public.exercise_progress (
  user_id         uuid not null references auth.users (id) on delete cascade,
  exercise_id     uuid not null references public.exercises (id) on delete cascade,
  exercise_level  integer not null default 1,
  exercise_xp     integer not null default 0,
  best_est_1rm_kg numeric(7, 2),
  best_volume_kg  numeric(9, 2),
  last_performed_at timestamptz,
  primary key (user_id, exercise_id)
);

-- ---------- treinos ----------
create table public.workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  performed_at    timestamptz not null default now(),
  duration_min    integer,
  total_volume_kg numeric(9, 2) not null default 0,
  xp_earned       integer not null default 0,
  notes           text,
  created_at      timestamptz not null default now()
);
create index workouts_user_performed_idx on public.workouts (user_id, performed_at desc);

create table public.workout_sets (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  set_index   integer not null,
  weight_kg   numeric(6, 2) not null default 0,
  reps        integer not null default 0,
  is_warmup   boolean not null default false,
  is_pr       boolean not null default false,
  -- volume = carga × reps, calculado pelo banco (é a base do XP).
  volume_kg   numeric(9, 2) generated always as (weight_kg * reps) stored
);
create index workout_sets_workout_idx on public.workout_sets (workout_id);

-- ---------- estilo de vida & ofensiva ----------
create table public.daily_checkins (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  checkin_date date not null,
  protein_hit  boolean not null default false,
  water_hit    boolean not null default false,
  sleep_hit    boolean not null default false,
  mobility_hit boolean not null default false,
  is_rest_day  boolean not null default false,
  xp_earned    integer not null default 0,
  unique (user_id, checkin_date)
);

create table public.streak_log (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  log_date         date not null,
  completed        boolean not null default false,
  is_protected_rest boolean not null default false,
  unique (user_id, log_date)
);

-- Razão de XP (ledger): toda concessão de XP vira uma linha auditável.
create table public.xp_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  source      text not null,
  amount      integer not null,
  workout_id  uuid references public.workouts (id) on delete set null,
  occurred_at timestamptz not null default now()
);
create index xp_events_user_idx on public.xp_events (user_id, occurred_at desc);

-- ---------- cria perfil + atributos ao cadastrar ----------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Atleta'));
  insert into public.user_attributes (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles          enable row level security;
alter table public.user_attributes   enable row level security;
alter table public.exercises         enable row level security;
alter table public.exercise_progress enable row level security;
alter table public.workouts          enable row level security;
alter table public.workout_sets      enable row level security;
alter table public.daily_checkins    enable row level security;
alter table public.streak_log        enable row level security;
alter table public.xp_events         enable row level security;

create policy "own profile"    on public.profiles        for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own attributes" on public.user_attributes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress"   on public.exercise_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own workouts"   on public.workouts        for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own checkins"   on public.daily_checkins  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own streak"     on public.streak_log      for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own xp events"  on public.xp_events       for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Séries pertencem ao dono do treino.
create policy "own sets" on public.workout_sets for all
  using (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid()));

-- Exercícios: catálogo padrão é visível a todos os autenticados; exercícios
-- customizados são privados de quem criou.
create policy "read default or own exercises" on public.exercises for select
  using (is_default or auth.uid() = created_by);
create policy "insert own exercises" on public.exercises for insert
  with check (auth.uid() = created_by and not is_default);
create policy "update own exercises" on public.exercises for update
  using (auth.uid() = created_by) with check (auth.uid() = created_by);
create policy "delete own exercises" on public.exercises for delete
  using (auth.uid() = created_by);
