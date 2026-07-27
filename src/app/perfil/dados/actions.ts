"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

export interface TrainingExport {
  version: 1;
  app: "ascesa";
  exported_at: string;
  profile: Record<string, unknown> | null;
  workouts: {
    performed_at: string;
    total_volume_kg: number;
    xp_earned: number;
    notes: string | null;
    sets: {
      exercise: string;
      weight_kg: number;
      reps: number;
      is_warmup: boolean;
      is_pr: boolean;
      set_index: number;
    }[];
  }[];
}

/** Exporta o histórico de treino do usuário como objeto JSON (backup). */
export async function exportTrainingData(): Promise<TrainingExport> {
  const { supabase, user } = await requireUser();

  const [{ data: profile }, { data: workouts }, { data: exercises }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, bodyweight_kg, height_cm, goal, xp_total")
        .eq("id", user.id)
        .single(),
      supabase
        .from("workouts")
        .select("id, performed_at, total_volume_kg, xp_earned, notes")
        .order("performed_at"),
      supabase.from("exercises").select("id, name"),
    ]);

  const nameById = new Map((exercises ?? []).map((e) => [e.id, e.name]));
  const workoutIds = (workouts ?? []).map((w) => w.id);

  type SetRow = {
    workout_id: string;
    exercise_id: string;
    weight_kg: number;
    reps: number;
    is_warmup: boolean;
    is_pr: boolean;
    set_index: number;
  };

  const { data: sets } = workoutIds.length
    ? await supabase
        .from("workout_sets")
        .select("workout_id, exercise_id, weight_kg, reps, is_warmup, is_pr, set_index")
        .in("workout_id", workoutIds)
    : { data: [] as SetRow[] };

  const setsByWorkout = new Map<string, SetRow[]>();
  for (const s of sets ?? []) {
    if (!setsByWorkout.has(s.workout_id)) setsByWorkout.set(s.workout_id, []);
    setsByWorkout.get(s.workout_id)!.push(s);
  }

  return {
    version: 1,
    app: "ascesa",
    exported_at: new Date().toISOString(),
    profile: profile ?? null,
    workouts: (workouts ?? []).map((w) => ({
      performed_at: w.performed_at,
      total_volume_kg: Number(w.total_volume_kg),
      xp_earned: w.xp_earned,
      notes: w.notes,
      sets: (setsByWorkout.get(w.id) ?? [])
        .sort((a, b) => a.set_index - b.set_index)
        .map((s) => ({
          exercise: nameById.get(s.exercise_id) ?? "Exercício",
          weight_kg: Number(s.weight_kg),
          reps: s.reps,
          is_warmup: s.is_warmup,
          is_pr: s.is_pr,
          set_index: s.set_index,
        })),
    })),
  };
}

/**
 * Importa um backup: insere apenas os treinos que ainda não existem (mesma
 * data/hora), com as suas séries. Não recalcula XP nem progressão — é um
 * restauro de histórico, sem duplicar nem mexer no ranking.
 */
export async function importTrainingData(payload: unknown) {
  const { supabase, user } = await requireUser();

  const data = payload as Partial<TrainingExport>;
  if (!data || data.app !== "ascesa" || !Array.isArray(data.workouts)) {
    return { error: "Arquivo inválido — esperado um backup do ASCESA." };
  }

  const { data: existing } = await supabase
    .from("workouts")
    .select("performed_at");
  const have = new Set((existing ?? []).map((w) => w.performed_at));

  const { data: exercises } = await supabase.from("exercises").select("id, name");
  const idByName = new Map((exercises ?? []).map((e) => [e.name.toLowerCase(), e.id]));

  let imported = 0;
  for (const w of data.workouts) {
    if (!w?.performed_at || have.has(w.performed_at)) continue;

    const { data: created } = await supabase
      .from("workouts")
      .insert({
        user_id: user.id,
        performed_at: w.performed_at,
        total_volume_kg: w.total_volume_kg ?? 0,
        xp_earned: 0, // não recontabiliza XP no restauro
        notes: w.notes ?? null,
      })
      .select("id")
      .single();
    if (!created) continue;

    const rows = (w.sets ?? [])
      .map((s) => {
        const exId = idByName.get((s.exercise ?? "").toLowerCase());
        if (!exId) return null;
        return {
          workout_id: created.id,
          exercise_id: exId,
          weight_kg: s.weight_kg ?? 0,
          reps: s.reps ?? 0,
          is_warmup: s.is_warmup ?? false,
          is_pr: s.is_pr ?? false,
          set_index: s.set_index ?? 0,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (rows.length) await supabase.from("workout_sets").insert(rows);
    imported += 1;
  }

  revalidatePath("/perfil");
  return { imported };
}
