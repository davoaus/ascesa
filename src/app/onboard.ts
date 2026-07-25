"use server";

import { createClient } from "@/lib/supabase/server";

export async function markOnboarded() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("profiles").update({ onboarded: true }).eq("id", user.id);
  return { ok: true };
}
