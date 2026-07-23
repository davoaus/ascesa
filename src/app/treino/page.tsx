import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "./WorkoutLogger";

export default async function TreinoPage() {
  const supabase = await createClient();
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, primary_muscle")
    .order("name");

  // Programas do usuário — a rotina (split de dias) que aparece pré-carregada.
  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, sort_order")
    .order("sort_order");

  const { data: allProgramExercises } = await supabase
    .from("program_exercises")
    .select("program_id, exercise_id, target_sets, target_reps, sort_order")
    .order("sort_order");

  const exerciseById = new Map((exercises ?? []).map((e) => [e.id, e]));

  const days = (programs ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    routine: (allProgramExercises ?? [])
      .filter((pe) => pe.program_id === p.id)
      .map((pe) => {
        const ex = exerciseById.get(pe.exercise_id);
        return ex
          ? {
              id: ex.id,
              name: ex.name,
              targetSets: pe.target_sets,
              targetReps: pe.target_reps,
            }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
  }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Voltar
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">TREINO</p>
      </header>

      <p className="text-2xl font-black text-marfim">
        Um duelo com a versão de ontem.
      </p>

      <WorkoutLogger exercises={exercises ?? []} days={days} />
    </main>
  );
}
