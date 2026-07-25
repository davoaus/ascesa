import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProgramEditor, { type Prog } from "./ProgramEditor";

export default async function ProgramaPage() {
  const supabase = await createClient();

  const [{ data: programs }, { data: programExercises }, { data: exercises }] =
    await Promise.all([
      supabase.from("programs").select("id, name, sort_order").order("sort_order"),
      supabase
        .from("program_exercises")
        .select("id, program_id, exercise_id, target_sets, target_reps, sort_order")
        .order("sort_order"),
      supabase.from("exercises").select("id, name, primary_muscle").order("name"),
    ]);

  const nameById = new Map((exercises ?? []).map((e) => [e.id, e.name]));
  const days: Prog[] = (programs ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    exercises: (programExercises ?? [])
      .filter((pe) => pe.program_id === p.id)
      .map((pe) => ({
        id: pe.id,
        exerciseId: pe.exercise_id,
        name: nameById.get(pe.exercise_id) ?? "Exercício",
        targetSets: pe.target_sets,
        targetReps: pe.target_reps,
      })),
  }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/treino" className="text-sm text-muted hover:text-marfim">
          ← Treino
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">
          EDITAR PROGRAMA
        </p>
      </header>

      <p className="text-sm text-muted">
        Personalize seus dias: renomeie, adicione ou remova exercícios e ajuste
        séries × reps. As mudanças aparecem na hora no treino.
      </p>

      <ProgramEditor programs={days} exercises={exercises ?? []} />
    </main>
  );
}
