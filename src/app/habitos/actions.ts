"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveStreak } from "@/lib/game/progression";

const XP_PER_HABIT = 8;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

const PALETTE = ["#8fb6c9", "#b3a4e0", "#a4c46b", "#efc75e", "#f59a2d", "#e4572e"];

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

export async function addHabit(input: { name: string; emoji?: string }) {
  const { supabase, user } = await requireUser();
  const name = input.name.trim();
  if (!name) return { error: "Dê um nome ao hábito." };

  const { count } = await supabase
    .from("habits")
    .select("id", { count: "exact", head: true })
    .eq("archived", false);
  const n = count ?? 0;

  await supabase.from("habits").insert({
    user_id: user.id,
    name,
    emoji: input.emoji?.trim() || "✅",
    color: PALETTE[n % PALETTE.length],
    sort_order: n + 1,
  });

  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

export async function archiveHabit(habitId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("habits")
    .update({ archived: true })
    .eq("id", habitId)
    .eq("user_id", user.id);
  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

/** Apaga o hábito de vez (e, por cascade, todas as marcações dele). */
export async function deleteHabit(habitId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("habits").delete().eq("id", habitId).eq("user_id", user.id);
  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

/** Move o hábito para cima/baixo trocando o sort_order com o vizinho. */
export async function moveHabit(habitId: string, dir: "up" | "down") {
  const { supabase, user } = await requireUser();
  const { data: list } = await supabase
    .from("habits")
    .select("id, sort_order")
    .eq("user_id", user.id)
    .eq("archived", false)
    .order("sort_order");
  if (!list) return { ok: false };

  const i = list.findIndex((h) => h.id === habitId);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true };

  const a = list[i];
  const b = list[j];
  await supabase.from("habits").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("habits").update({ sort_order: a.sort_order }).eq("id", b.id);
  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

/** Reordena todos os hábitos de uma vez, na ordem recebida (arrastar-e-soltar). */
export async function reorderHabits(orderedIds: string[]) {
  const { supabase, user } = await requireUser();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("habits")
        .update({ sort_order: i + 1 })
        .eq("id", id)
        .eq("user_id", user.id),
    ),
  );
  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

/** Define (ou limpa) a data de início do hábito. */
export async function setHabitStartDate(habitId: string, date: string | null) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("habits")
    .update({ start_date: date || null })
    .eq("id", habitId)
    .eq("user_id", user.id);
  revalidatePath("/habitos");
  revalidatePath("/hoje");
  return { ok: true };
}

/** Marca/desmarca um hábito num dia. Marcar dá XP à área Hábitos; desmarcar
 *  remove um XP equivalente para manter o placar honesto. */
export async function toggleHabit(input: { habitId: string; date: string }) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", input.habitId)
    .eq("log_date", input.date)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total, current_streak, longest_streak, last_completed_date")
    .eq("id", user.id)
    .single();
  const today = todayLocal();

  if (existing) {
    await supabase.from("habit_logs").delete().eq("id", existing.id);
    const { data: ev } = await supabase
      .from("xp_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("source", "Hábito")
      .order("occurred_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (ev) await supabase.from("xp_events").delete().eq("id", ev.id);
    await supabase
      .from("profiles")
      .update({ xp_total: Math.max(0, (profile?.xp_total ?? 0) - XP_PER_HABIT) })
      .eq("id", user.id);
    revalidatePath("/", "layout");
    return { done: false };
  }

  await supabase
    .from("habit_logs")
    .insert({ user_id: user.id, habit_id: input.habitId, log_date: input.date });
  await supabase
    .from("xp_events")
    .insert({ user_id: user.id, source: "Hábito", amount: XP_PER_HABIT });

  const patch: {
    xp_total: number;
    current_streak?: number;
    longest_streak?: number;
    last_completed_date?: string;
  } = {
    xp_total: (profile?.xp_total ?? 0) + XP_PER_HABIT,
  };
  if (input.date === today) {
    const { streak } = resolveStreak(
      {
        lastCompletedDate: profile?.last_completed_date ?? null,
        currentStreak: profile?.current_streak ?? 0,
      },
      today,
    );
    patch.current_streak = streak;
    patch.longest_streak = Math.max(streak, profile?.longest_streak ?? 0);
    patch.last_completed_date = today;
    await supabase.from("streak_log").upsert(
      { user_id: user.id, log_date: today, completed: true },
      { onConflict: "user_id,log_date" },
    );
  }
  await supabase.from("profiles").update(patch).eq("id", user.id);

  revalidatePath("/", "layout");
  return { done: true };
}
