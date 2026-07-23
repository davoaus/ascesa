"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveStreak } from "@/lib/game/progression";

const XP_PER_KM = 12;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Registra uma corrida: XP por km, ofensiva e atributos de resistência. */
export async function logRun(input: { distanceKm: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const km = Math.max(0, input.distanceKm);
  if (km <= 0) return { error: "Informe a distância." };
  const xp = Math.round(km * XP_PER_KM);
  const today = todayLocal();

  await supabase
    .from("xp_events")
    .insert({ user_id: user.id, source: "Corrida", amount: xp });

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
    .select("resistencia, velocidade")
    .eq("user_id", user.id)
    .single();
  if (a) {
    await supabase
      .from("user_attributes")
      .update({
        resistencia: a.resistencia + Math.max(1, Math.round(km / 2)),
        velocidade: a.velocidade + 1,
      })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  return { xp };
}
