"use client";

import { useMemo, useState, useTransition } from "react";
import { finishWorkout, type LoggedSet } from "./actions";
import { xpFromVolume } from "@/lib/game/xp";

export interface ExerciseOption {
  id: string;
  name: string;
  primary_muscle: string | null;
}

export interface RoutineItem {
  id: string;
  name: string;
  targetSets: number | null;
  targetReps: number | null;
}

const inputClass =
  "w-full rounded-lg border border-line bg-carvao px-3 py-2.5 text-center text-marfim tabular-nums focus:border-brasa focus:outline-none";

export default function WorkoutLogger({
  exercises,
  routine = [],
  programName = null,
}: {
  exercises: ExerciseOption[];
  routine?: RoutineItem[];
  programName?: string | null;
}) {
  const [exerciseId, setExerciseId] = useState(
    routine[0]?.id ?? exercises[0]?.id ?? "",
  );
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [lifestyle, setLifestyle] = useState({
    proteinHit: false,
    waterHit: false,
    sleepHit: false,
    mobilityHit: false,
  });
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nameById = useMemo(
    () => new Map(exercises.map((e) => [e.id, e.name])),
    [exercises],
  );

  const volume = sets
    .filter((s) => !s.isWarmup)
    .reduce((sum, s) => sum + s.weightKg * s.reps, 0);

  function addSet() {
    const w = Number(weight.replace(",", "."));
    const r = Number(reps);
    if (!exerciseId || !Number.isFinite(w) || !Number.isFinite(r) || r <= 0) {
      setError("Informe carga e repetições.");
      return;
    }
    setError(null);
    setSets((prev) => [
      ...prev,
      { exerciseId, weightKg: w, reps: r, isWarmup: false },
    ]);
    setReps("");
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function finish() {
    setError(null);
    startTransition(async () => {
      const result = await finishWorkout({
        sets,
        durationMin: 0,
        ...lifestyle,
      });
      if (result?.error) setError(result.error);
    });
  }

  function pickRoutine(item: RoutineItem) {
    setExerciseId(item.id);
    if (item.targetReps) setReps(String(item.targetReps));
  }

  return (
    <div className="flex flex-col gap-4">
      {/* programa do dia — a rotina pré-carregada */}
      {routine.length > 0 && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            {programName ?? "Meu programa"}
          </p>
          <div className="flex flex-wrap gap-2">
            {routine.map((item) => {
              const active = item.id === exerciseId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pickRoutine(item)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "border-brasa bg-brasa/10 text-brasa"
                      : "border-line bg-carvao text-muted hover:text-marfim"
                  }`}
                >
                  {item.name}
                  {item.targetSets && item.targetReps ? (
                    <span className="ml-1 text-xs opacity-70">
                      {item.targetSets}×{item.targetReps}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* seletor + entrada de série */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim focus:border-brasa focus:outline-none"
        >
          {exercises.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.primary_muscle ? ` · ${e.primary_muscle}` : ""}
            </option>
          ))}
        </select>

        <div className="mt-3 grid grid-cols-[1fr_1fr_auto] items-center gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Carga (kg)</span>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="60"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Reps</span>
            <input
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10"
              className={inputClass}
            />
          </label>
          <button
            type="button"
            onClick={addSet}
            className="mt-5 rounded-lg bg-brasa px-4 py-2.5 font-black text-carvao"
          >
            +
          </button>
        </div>
      </section>

      {/* séries registradas */}
      {sets.length > 0 && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            Séries · {sets.length}
          </p>
          <ul className="flex flex-col gap-1.5">
            {sets.map((s, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2 text-sm"
              >
                <span className="text-marfim">{nameById.get(s.exerciseId)}</span>
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-muted">
                    {s.weightKg} kg × {s.reps}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSet(i)}
                    aria-label="Remover série"
                    className="text-muted hover:text-brasa"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              Volume · XP do treino
            </span>
            <span className="tabular-nums">
              <span className="text-marfim">
                {volume.toLocaleString("pt-BR")} kg
              </span>
              <span className="ml-3 font-black text-brasa">
                +{xpFromVolume(volume)} XP
              </span>
            </span>
          </div>
        </section>
      )}

      {/* estilo de vida do dia */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
          Metas do dia
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ["proteinHit", "Proteína"],
              ["waterHit", "Hidratação"],
              ["sleepHit", "Sono"],
              ["mobilityHit", "Mobilidade"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setLifestyle((p) => ({ ...p, [key]: !p[key] }))
              }
              className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                lifestyle[key]
                  ? "border-brasa bg-brasa/10 text-brasa"
                  : "border-line bg-carvao text-muted"
              }`}
            >
              {lifestyle[key] ? "✓ " : ""}
              {label}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-brasa-deep/50 bg-brasa-deep/10 px-3 py-2 text-sm text-brasa">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={finish}
        disabled={pending || sets.length === 0}
        className="rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-4 font-black tracking-wide text-carvao disabled:opacity-40"
      >
        {pending ? "Salvando..." : "Finalizar treino"}
      </button>
    </div>
  );
}
