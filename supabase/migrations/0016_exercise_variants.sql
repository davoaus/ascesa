-- Opções (variações) por exercício do programa: o usuário escolhe qual fez.
alter table program_exercises
  add column if not exists variants text[] not null default '{}';

-- Variação efetivamente usada na série registrada (fica no histórico).
alter table workout_sets
  add column if not exists variant text;
