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
