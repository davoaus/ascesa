-- Novo usuário passa a receber: perfil, atributos, programa inicial e hábitos.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Atleta'));
  insert into public.user_attributes (user_id) values (new.id);

  insert into public.programs (user_id, name, is_default, sort_order)
  values (new.id, 'Treino inicial · Full body', false, 1)
  returning id into pid;

  insert into public.program_exercises (program_id, exercise_id, target_sets, target_reps, sort_order)
  select pid, e.id, v.sets, v.reps, v.ord
  from (values
    ('agachamento', 3, 8, 1),
    ('supino-reto', 3, 10, 2),
    ('remada-curvada', 3, 10, 3),
    ('desenvolvimento', 3, 10, 4),
    ('rosca-direta', 3, 12, 5),
    ('prancha', 3, null, 6)
  ) as v(slug, sets, reps, ord)
  join public.exercises e on e.slug = v.slug;

  insert into public.habits (user_id, name, emoji, color, sort_order) values
    (new.id, 'Beber água',  '💧', '#8fb6c9', 1),
    (new.id, 'Dormir cedo', '😴', '#b3a4e0', 2),
    (new.id, 'Meditar',     '🧘', '#a4c46b', 3);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
