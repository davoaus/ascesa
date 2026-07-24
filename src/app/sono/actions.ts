"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveStreak } from "@/lib/game/progression";

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Registra o sono da noite: XP maior ao atingir a faixa ideal (7–9h). */
export async function logSleep(input: { hours: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const h = input.hours;
  if (!Number.isFinite(h) || h <= 0 || h > 16)
    return { error: "Informe as horas dormidas." };

  // Faixa ideal 7–9h vale cheio; abaixo/acima proporcional.
  const xp = h >= 7 && h <= 9 ? 40 : Math.max(8, Math.round((Math.min(h, 7) / 7) * 40));
  const today = todayLocal();

  await supabase
    .from("xp_events")
    .insert({ user_id: user.id, source: "Sono", amount: xp });

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total, current_streak, longest_streak, last_completed_date")
    .eq("id", user.id)
    .single();

  const { streak } = resolveStreak(
    {
      lastCompletedDate: profile?.last_completed_date ?? null,
      currentStreak: profile?.current_streak ?? 0,
    },
    today,
  );

  await supabase
    .from("profiles")
    .update({
      xp_total: (profile?.xp_total ?? 0) + xp,
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      last_completed_date: today,
    })
    .eq("id", user.id);

  await supabase.from("streak_log").upsert(
    { user_id: user.id, log_date: today, completed: true },
    { onConflict: "user_id,log_date" },
  );

  const { data: a } = await supabase
    .from("user_attributes")
    .select("saude")
    .eq("user_id", user.id)
    .single();
  if (a) {
    await supabase
      .from("user_attributes")
      .update({ saude: a.saude + (h >= 7 ? 2 : 1) })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  return { xp };
}
