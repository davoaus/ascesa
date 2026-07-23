"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveStreak } from "@/lib/game/progression";

const XP_PER_PAGE = 2;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** Registra uma sessão de leitura: XP por página + ofensiva + disciplina. */
export async function logReading(input: { pages: number }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const pages = Math.max(0, Math.round(input.pages));
  if (pages <= 0) return { error: "Informe quantas páginas você leu." };
  const xp = pages * XP_PER_PAGE;
  const today = todayLocal();

  await supabase
    .from("xp_events")
    .insert({ user_id: user.id, source: "Leitura", amount: xp });

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

  // Leitura constrói disciplina.
  const { data: a } = await supabase
    .from("user_attributes")
    .select("disciplina")
    .eq("user_id", user.id)
    .single();
  if (a) {
    await supabase
      .from("user_attributes")
      .update({ disciplina: a.disciplina + Math.max(1, Math.round(pages / 20)) })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  return { xp };
}
