-- Metas de nutrição editáveis por usuário (texto, para aceitar faixas).
alter table public.profiles add column if not exists nutrition_kcal text;
alter table public.profiles add column if not exists nutrition_protein text;
alter table public.profiles add column if not exists nutrition_carb text;
alter table public.profiles add column if not exists nutrition_fat text;
