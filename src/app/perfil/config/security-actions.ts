"use server";

import { createClient } from "@/lib/supabase/server";

/** Altera a senha do usuário logado (não precisa da senha antiga — usa a sessão). */
export async function changePassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: "A senha precisa ter ao menos 6 caracteres." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: "Não consegui trocar a senha. Tente de novo." };
  return { ok: true };
}
