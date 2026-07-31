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
    .select("program_id, exercise_id, target_sets, target_reps, sort_order, variants")
    .order("sort_order");

  const exerciseById = new Map((exercises ?? []).map((e) => [e.id, e]));

  // "Última vez" + nível por exercício — a progressão inteligente (o duelo com
  // a versão de ontem). Carrega o desempenho da sessão mais recente de cada
  // exercício e o nível/recorde já acumulados.
  const { data: progress } = await supabase
    .from("exercise_progress")
    .select("exercise_id, exercise_level, best_volume_kg");

  const { data: recentWorkouts } = await supabase
    .from("workouts")
    .select("id, performed_at")
    .order("performed_at", { ascending: false })
    .limit(50);
  const perfById = new Map((recentWorkouts ?? []).map((w) => [w.id, w.performed_at]));
  const workoutIds = (recentWorkouts ?? []).map((w) => w.id);

  const { data: recentSets } = workoutIds.length
    ? await supabase
        .from("workout_sets")
        .select("workout_id, exercise_id, weight_kg, reps, is_warmup")
        .in("workout_id", workoutIds)
    : { data: [] };

  // Para cada exercício, junta as séries do treino mais recente em que apareceu.
  const byExerciseWorkout = new Map<string, Map<string, { weight: number; reps: number }[]>>();
  for (const s of recentSets ?? []) {
    if (s.is_warmup) continue;
    if (!byExerciseWorkout.has(s.exercise_id)) byExerciseWorkout.set(s.exercise_id, new Map());
    const perWorkout = byExerciseWorkout.get(s.exercise_id)!;
    if (!perWorkout.has(s.workout_id)) perWorkout.set(s.workout_id, []);
    perWorkout.get(s.workout_id)!.push({ weight: Number(s.weight_kg), reps: s.reps });
  }

  const progressById = new Map((progress ?? []).map((p) => [p.exercise_id, p]));

  const exerciseMeta: Record<
    string,
    { level: number; bestVolumeKg: number; lastSets: { weight: number; reps: number }[] }
  > = {};
  for (const ex of exercises ?? []) {
    const p = progressById.get(ex.id);
    let lastSets: { weight: number; reps: number }[] = [];
    const perWorkout = byExerciseWorkout.get(ex.id);
    if (perWorkout) {
      let latestId: string | null = null;
      let latestPerf = "";
      for (const wid of perWorkout.keys()) {
        const perf = perfById.get(wid) ?? "";
        if (perf > latestPerf) {
          latestPerf = perf;
          latestId = wid;
        }
      }
      if (latestId) lastSets = perWorkout.get(latestId)!;
    }
    if (p || lastSets.length) {
      exerciseMeta[ex.id] = {
        level: p?.exercise_level ?? 1,
        bestVolumeKg: Number(p?.best_volume_kg ?? 0),
        lastSets,
      };
    }
  }

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
              variants: pe.variants ?? [],
            }
          : null;
      })
      .filter((r): r is NonNullable<typeof r> => r !== null),
  }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/musculacao" className="text-sm text-muted hover:text-marfim">
          ← Voltar
        </Link>
        <Link
          href="/treino/programa"
          className="text-sm text-muted hover:text-marfim"
        >
          ✏️ Editar programa
        </Link>
      </header>

      <p className="text-2xl font-black text-marfim">
        Um duelo com a versão de ontem.
      </p>

      <WorkoutLogger
        exercises={exercises ?? []}
        days={days}
        exerciseMeta={exerciseMeta}
      />
    </main>
  );
}
