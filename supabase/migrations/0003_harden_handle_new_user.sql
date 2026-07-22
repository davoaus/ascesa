-- handle_new_user() só deve rodar via trigger em auth.users, nunca como RPC
-- pública. Sem isto, o advisor de segurança do Supabase acusa a função como
-- SECURITY DEFINER exposta em /rest/v1/rpc. O trigger continua funcionando
-- porque roda com o dono da tabela.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
