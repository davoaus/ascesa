import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "./WorkoutLogger";

export default async function TreinoPage() {
  const supabase = await createClient();
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, primary_muscle")
    .order("name");

  // Programa do usuário (o seu, se existir; senão o padrão). É a rotina que
  // aparece pré-carregada — o "os dados que eu anoto" do treino.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: programs } = await supabase
    .from("programs")
    .select("id, name, is_default, user_id")
    .order("is_default"); // false (do usuário) antes de true (padrão)
  const program = programs?.[0] ?? null;

  const { data: programExercises } = program
    ? await supabase
        .from("program_exercises")
        .select("exercise_id, target_sets, target_reps, sort_order")
        .eq("program_id", program.id)
        .order("sort_order")
    : { data: null };

  const routine = (programExercises ?? [])
    .map((pe) => {
      const ex = exercises?.find((e) => e.id === pe.exercise_id);
      return ex
        ? {
            id: ex.id,
            name: ex.name,
            targetSets: pe.target_sets,
            targetReps: pe.target_reps,
          }
        : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  void user;

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

      <WorkoutLogger
        exercises={exercises ?? []}
        routine={routine}
        programName={program?.name ?? null}
      />
    </main>
  );
}
