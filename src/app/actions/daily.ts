"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GAME_CONFIG } from "@/lib/game/config";
import { resolveStreak } from "@/lib/game/progression";

const LIFE = GAME_CONFIG.lifestyle;

export interface DailyGoals {
  proteinHit: boolean;
  waterHit: boolean;
  sleepHit: boolean;
  mobilityHit: boolean;
  isRestDay: boolean;
}

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/**
 * Check-in diário: metas de estilo de vida + dia de descanso. É a fonte única
 * de XP de estilo de vida e o que mantém a ofensiva viva nos dias sem
 * musculação (corrida, descanso). Idempotente: só concede XP de metas que ainda
 * não tinham sido batidas hoje.
 */
export async function saveDailyCheckin(input: DailyGoals) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const today = todayLocal();

  const { data: existing } = await supabase
    .from("daily_checkins")
    .select("protein_hit, water_hit, sleep_hit, mobility_hit, is_rest_day, xp_earned")
    .eq("user_id", user.id)
    .eq("checkin_date", today)
    .maybeSingle();

  // metas recém-batidas (eram false, agora true)
  const newSleep = input.sleepHit && !existing?.sleep_hit;
  const newMobility = input.mobilityHit && !existing?.mobility_hit;
  const lines: { source: string; amount: number }[] = [];
  if (input.proteinHit && !existing?.protein_hit)
    lines.push({ source: "Meta de proteína", amount: LIFE.protein });
  if (input.waterHit && !existing?.water_hit)
    lines.push({ source: "Hidratação", amount: LIFE.water });
  if (newSleep) lines.push({ source: "Meta de sono", amount: LIFE.sleep });
  if (newMobility) lines.push({ source: "Mobilidade", amount: LIFE.mobility });
  const gained = lines.reduce((sum, l) => sum + l.amount, 0);

  await supabase.from("daily_checkins").upsert(
    {
      user_id: user.id,
      checkin_date: today,
      protein_hit: input.proteinHit || !!existing?.protein_hit,
      water_hit: input.waterHit || !!existing?.water_hit,
      sleep_hit: input.sleepHit || !!existing?.sleep_hit,
      mobility_hit: input.mobilityHit || !!existing?.mobility_hit,
      is_rest_day: input.isRestDay || !!existing?.is_rest_day,
      xp_earned: (existing?.xp_earned ?? 0) + gained,
    },
    { onConflict: "user_id,checkin_date" },
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total, current_streak, longest_streak, last_completed_date")
    .eq("id", user.id)
    .single();

  if (lines.length) {
    await supabase
      .from("xp_events")
      .insert(lines.map((l) => ({ user_id: user.id, ...l })));
  }

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
      xp_total: (profile?.xp_total ?? 0) + gained,
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      last_completed_date: today,
    })
    .eq("id", user.id);

  await supabase.from("streak_log").upsert(
    {
      user_id: user.id,
      log_date: today,
      completed: true,
      is_protected_rest: input.isRestDay,
    },
    { onConflict: "user_id,log_date" },
  );

  // saúde vem do sono, mobilidade do alongamento
  if (newSleep || newMobility) {
    const { data: a } = await supabase
      .from("user_attributes")
      .select("saude, mobilidade")
      .eq("user_id", user.id)
      .single();
    if (a) {
      await supabase
        .from("user_attributes")
        .update({
          saude: a.saude + (newSleep ? 1 : 0),
          mobilidade: a.mobilidade + (newMobility ? 1 : 0),
        })
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/", "layout");
  return { gained };
}
