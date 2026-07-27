-- Datas de início por atividade não-hábito.
-- Corrida: quando o plano começou (define a semana atual automaticamente).
-- Leitura: desde quando estou registrando leitura.
alter table profiles
  add column if not exists run_start_date date,
  add column if not exists reading_start_date date;
