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

// ---------- programas (dias) ----------

export async function addProgram(name: string) {
  const { supabase, user } = await requireUser();
  const n = name.trim() || "Novo dia";
  const { data: max } = await supabase
    .from("programs")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase.from("programs").insert({
    user_id: user.id,
    name: n,
    is_default: false,
    sort_order: (max?.sort_order ?? 0) + 1,
  });
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

export async function renameProgram(programId: string, name: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("programs")
    .update({ name: name.trim() || "Dia" })
    .eq("id", programId)
    .eq("user_id", user.id);
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

export async function deleteProgram(programId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("programs").delete().eq("id", programId).eq("user_id", user.id);
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

// ---------- exercícios do programa ----------

export async function addExercise(input: {
  programId: string;
  exerciseId: string;
  sets: number | null;
  reps: number | null;
}) {
  const { supabase } = await requireUser();
  const { count } = await supabase
    .from("program_exercises")
    .select("id", { count: "exact", head: true })
    .eq("program_id", input.programId);
  await supabase.from("program_exercises").insert({
    program_id: input.programId,
    exercise_id: input.exerciseId,
    target_sets: input.sets,
    target_reps: input.reps,
    sort_order: (count ?? 0) + 1,
  });
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "exercicio"}-${Math.random().toString(36).slice(2, 7)}`;
}

const EXERCISE_CATEGORIES = ["push", "pull", "legs", "core", "cardio", "mobility"];

/** Cria um exercício próprio (fora do catálogo) e já o adiciona ao dia. */
export async function addCustomExercise(input: {
  programId: string;
  name: string;
  category: string;
  muscle: string | null;
  sets: number | null;
  reps: number | null;
}) {
  const { supabase, user } = await requireUser();
  const name = input.name.trim();
  if (!name) return { error: "Dê um nome ao exercício." };
  const category = EXERCISE_CATEGORIES.includes(input.category)
    ? input.category
    : "push";

  const { data: created, error } = await supabase
    .from("exercises")
    .insert({
      name,
      slug: slugify(name),
      category,
      primary_muscle: input.muscle?.trim() || null,
      is_bodyweight: false,
      is_default: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !created) return { error: "Não consegui criar o exercício." };

  const { count } = await supabase
    .from("program_exercises")
    .select("id", { count: "exact", head: true })
    .eq("program_id", input.programId);
  await supabase.from("program_exercises").insert({
    program_id: input.programId,
    exercise_id: created.id,
    target_sets: input.sets,
    target_reps: input.reps,
    sort_order: (count ?? 0) + 1,
  });

  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

/** Reordena um exercício dentro do dia trocando o sort_order com o vizinho. */
export async function moveExercise(programExerciseId: string, dir: "up" | "down") {
  const { supabase } = await requireUser();

  const { data: current } = await supabase
    .from("program_exercises")
    .select("id, program_id, sort_order")
    .eq("id", programExerciseId)
    .single();
  if (!current) return { ok: false };

  const { data: siblings } = await supabase
    .from("program_exercises")
    .select("id, sort_order")
    .eq("program_id", current.program_id)
    .order("sort_order");
  if (!siblings) return { ok: false };

  const idx = siblings.findIndex((s) => s.id === current.id);
  const swapIdx = dir === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { ok: false };

  const neighbor = siblings[swapIdx];
  await supabase
    .from("program_exercises")
    .update({ sort_order: neighbor.sort_order })
    .eq("id", current.id);
  await supabase
    .from("program_exercises")
    .update({ sort_order: current.sort_order })
    .eq("id", neighbor.id);

  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

/** Reordena os exercícios de um dia de uma vez (arrastar-e-soltar). */
export async function reorderExercises(orderedIds: string[]) {
  const { supabase } = await requireUser();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase
        .from("program_exercises")
        .update({ sort_order: i + 1 })
        .eq("id", id),
    ),
  );
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

export async function removeExercise(programExerciseId: string) {
  const { supabase } = await requireUser();
  await supabase.from("program_exercises").delete().eq("id", programExerciseId);
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}

export async function updateExercise(input: {
  id: string;
  sets: number | null;
  reps: number | null;
}) {
  const { supabase } = await requireUser();
  await supabase
    .from("program_exercises")
    .update({ target_sets: input.sets, target_reps: input.reps })
    .eq("id", input.id);
  revalidatePath("/treino/programa");
  revalidatePath("/treino");
  return { ok: true };
}
