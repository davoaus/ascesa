-- Flag para o tutorial de boas-vindas (mostra só na primeira vez).
alter table public.profiles add column if not exists onboarded boolean not null default false;
