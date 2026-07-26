-- Remove a necessidade de confirmação por e-mail: novo usuário já nasce confirmado.
create or replace function public.auto_confirm_user()
returns trigger language plpgsql security definer set search_path = auth, public as $$
begin
  if new.email_confirmed_at is null then new.email_confirmed_at := now(); end if;
  return new;
end; $$;
drop trigger if exists auto_confirm_on_signup on auth.users;
create trigger auto_confirm_on_signup before insert on auth.users
  for each row execute function public.auto_confirm_user();
revoke execute on function public.auto_confirm_user() from public, anon, authenticated;
