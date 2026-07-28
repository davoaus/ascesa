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

export interface ProgramDay {
  id: string;
  name: string;
  routine: RoutineItem[];
}

export interface ExerciseMeta {
  level: number;
  bestVolumeKg: number;
  lastSets: { weight: number; reps: number }[];
}

const inputClass =
  "w-full rounded-lg border border-line bg-carvao px-3 py-2.5 text-center text-marfim tabular-nums focus:border-brasa focus:outline-none";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default function WorkoutLogger({
  exercises,
  days = [],
  exerciseMeta = {},
}: {
  exercises: ExerciseOption[];
  days?: ProgramDay[];
  exerciseMeta?: Record<string, ExerciseMeta>;
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const activeDay = days[dayIndex] ?? null;
  const routine = activeDay?.routine ?? [];
  const [exerciseId, setExerciseId] = useState(
    days[0]?.routine[0]?.id ?? exercises[0]?.id ?? "",
  );
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nameById = useMemo(
    () => new Map(exercises.map((e) => [e.id, e.name])),
    [exercises],
  );

  const meta = exerciseMeta[exerciseId];

  // Checklist do dia: um exercício está "feito" quando tem ao menos uma série
  // registrada (fora aquecimento) nesta sessão.
  const doneIds = new Set(
    sets.filter((s) => !s.isWarmup).map((s) => s.exerciseId),
  );
  const doneCount = routine.filter((r) => doneIds.has(r.id)).length;

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
      const result = await finishWorkout({ sets, durationMin: 0 });
      if (result?.error) setError(result.error);
    });
  }

  function pickRoutine(item: RoutineItem) {
    setExerciseId(item.id);
    if (item.targetReps) setReps(String(item.targetReps));
  }

  function pickDay(index: number) {
    setDayIndex(index);
    const first = days[index]?.routine[0];
    if (first) setExerciseId(first.id);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* seletor de dia do split */}
      {days.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {days.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => pickDay(i)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                i === dayIndex
                  ? "border-brasa bg-brasa/15 text-brasa"
                  : "border-line bg-carvao-2 text-muted hover:text-marfim"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* checklist do dia — marca ✓ conforme você registra cada exercício */}
      {routine.length > 0 && (
        <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
              {activeDay?.name ?? "Meu programa"}
            </p>
            <p className="text-xs font-bold tabular-nums text-brasa">
              feitos {doneCount}/{routine.length}
            </p>
          </div>
          <ul className="flex flex-col gap-1.5">
            {routine.map((item) => {
              const active = item.id === exerciseId;
              const done = doneIds.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => pickRoutine(item)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "border-brasa bg-brasa/10"
                        : "border-line bg-carvao hover:border-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                          done
                            ? "border-ok bg-ok/20 text-ok"
                            : "border-muted text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span
                        className={
                          done
                            ? "text-muted line-through"
                            : active
                              ? "text-brasa"
                              : "text-marfim"
                        }
                      >
                        {item.name}
                      </span>
                    </span>
                    {item.targetSets && item.targetReps ? (
                      <span className="tabular-nums text-xs text-muted">
                        {item.targetSets}×{item.targetReps}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* seletor + entrada de série */}
      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
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

        {/* nível + última vez — o duelo com a versão de ontem */}
        {meta && (meta.lastSets.length > 0 || meta.level > 1) && (
          <div className="mt-3 rounded-lg border border-line bg-carvao px-3 py-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-aco">Nível {meta.level}</span>
              {meta.bestVolumeKg > 0 && (
                <span className="text-muted">recorde {fmt(meta.bestVolumeKg)} kg</span>
              )}
            </div>
            {meta.lastSets.length > 0 && (
              <p className="mt-1 text-muted">
                Última vez:{" "}
                <span className="tabular-nums text-marfim">
                  {meta.lastSets
                    .map((s) => `${fmt(s.weight)}×${s.reps}`)
                    .join(" · ")}
                </span>
              </p>
            )}
          </div>
        )}

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
        <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
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
            <span className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
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
