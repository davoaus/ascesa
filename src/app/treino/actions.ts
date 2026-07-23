"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeWorkoutXp } from "@/lib/game/xp";
import { resolveStreak, attributeGains } from "@/lib/game/progression";

export interface LoggedSet {
  exerciseId: string;
  weightKg: number;
  reps: number;
  isWarmup: boolean;
}

export interface FinishWorkoutInput {
  sets: LoggedSet[];
  durationMin: number;
}

/** Data de hoje no fuso do usuário (streak é sobre o dia dele, não UTC). */
function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

/** 1RM estimado (Epley) — usado para detectar recorde de força. */
function estimated1rm(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  return weightKg * (1 + reps / 30);
}

/**
 * Persiste o treino inteiro de uma vez (local-first: a academia tem sinal ruim,
 * então o app só toca a rede ao finalizar), detecta progressão e recordes,
 * concede XP pelo motor do jogo e atualiza ofensiva.
 */
export async function finishWorkout(input: FinishWorkoutInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const working = input.sets.filter((s) => !s.isWarmup && s.reps > 0);
  if (working.length === 0) return { error: "Registre pelo menos uma série." };

  // 1. cria o treino
  const { data: workout, error: wErr } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, duration_min: input.durationMin })
    .select("id")
    .single();
  if (wErr || !workout) return { error: "Não foi possível salvar o treino." };

  // 2. melhor série por exercício nesta sessão
  const bestByExercise = new Map<string, { volume: number; oneRm: number }>();
  for (const s of working) {
    const volume = s.weightKg * s.reps;
    const oneRm = estimated1rm(s.weightKg, s.reps);
    const prev = bestByExercise.get(s.exerciseId);
    bestByExercise.set(s.exerciseId, {
      volume: Math.max(volume, prev?.volume ?? 0),
      oneRm: Math.max(oneRm, prev?.oneRm ?? 0),
    });
  }

  // 3. compara com o histórico para achar progressão e recordes
  const exerciseIds = [...bestByExercise.keys()];
  const { data: history } = await supabase
    .from("exercise_progress")
    .select("exercise_id, best_volume_kg, best_est_1rm_kg, exercise_xp, exercise_level")
    .in("exercise_id", exerciseIds);

  const prevById = new Map(history?.map((h) => [h.exercise_id, h]) ?? []);
  const prExerciseIds = new Set<string>();
  let hadProgression = false;

  for (const [exerciseId, best] of bestByExercise) {
    const prev = prevById.get(exerciseId);
    const prevVolume = Number(prev?.best_volume_kg ?? 0);
    const prevOneRm = Number(prev?.best_est_1rm_kg ?? 0);
    if (best.volume > prevVolume) hadProgression = true;
    if (best.oneRm > prevOneRm && prevOneRm > 0) prExerciseIds.add(exerciseId);

    await supabase.from("exercise_progress").upsert(
      {
        user_id: user.id,
        exercise_id: exerciseId,
        best_volume_kg: Math.max(best.volume, prevVolume),
        best_est_1rm_kg: Math.max(best.oneRm, prevOneRm),
        exercise_xp: (prev?.exercise_xp ?? 0) + Math.round(best.volume / 100),
        exercise_level: (prev?.exercise_level ?? 1) + (best.volume > prevVolume ? 1 : 0),
        last_performed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,exercise_id" },
    );
  }

  // 4. séries
  const rows = input.sets.map((s, i) => ({
    workout_id: workout.id,
    exercise_id: s.exerciseId,
    set_index: i + 1,
    weight_kg: s.weightKg,
    reps: s.reps,
    is_warmup: s.isWarmup,
    is_pr: !s.isWarmup && prExerciseIds.has(s.exerciseId),
  }));
  await supabase.from("workout_sets").insert(rows);

  // 5. XP pelo motor do jogo (volume + evolução + estilo de vida)
  const volumeKg = working.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const { lines, total } = computeWorkoutXp({
    volumeKg,
    hadProgression,
    newPr: prExerciseIds.size > 0,
  });

  await supabase
    .from("workouts")
    .update({ total_volume_kg: volumeKg, xp_earned: total })
    .eq("id", workout.id);

  await supabase.from("xp_events").insert(
    lines.map((l) => ({
      user_id: user.id,
      source: l.label,
      amount: l.xp,
      workout_id: workout.id,
    })),
  );

  // 6. ofensiva + XP acumulado
  const today = todayLocal();
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
      xp_total: (profile?.xp_total ?? 0) + total,
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      last_completed_date: today,
    })
    .eq("id", user.id);

  await supabase
    .from("streak_log")
    .upsert(
      { user_id: user.id, log_date: today, completed: true },
      { onConflict: "user_id,log_date" },
    );

  // 7. atributos do personagem (força do volume, disciplina da ofensiva;
  // saúde/mobilidade vêm do check-in diário)
  const gains = attributeGains({ volumeKg, streak });
  const { data: attrs } = await supabase
    .from("user_attributes")
    .select("forca, resistencia, disciplina, mobilidade, saude, velocidade")
    .eq("user_id", user.id)
    .single();
  if (attrs) {
    await supabase
      .from("user_attributes")
      .update({
        forca: attrs.forca + (gains.forca ?? 0),
        resistencia: attrs.resistencia + (gains.resistencia ?? 0),
        disciplina: attrs.disciplina + (gains.disciplina ?? 0),
        mobilidade: attrs.mobilidade + (gains.mobilidade ?? 0),
        saude: attrs.saude + (gains.saude ?? 0),
        velocidade: attrs.velocidade + (gains.velocidade ?? 0),
      })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  redirect(`/treino/${workout.id}/resumo`);
}
