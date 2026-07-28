"use client";

import { useState, useTransition } from "react";
import {
  addProgram,
  renameProgram,
  deleteProgram,
  addExercise,
  addCustomExercise,
  moveExercise,
  removeExercise,
  updateExercise,
} from "./actions";

export interface ProgEx {
  id: string; // program_exercise id
  exerciseId: string;
  name: string;
  targetSets: number | null;
  targetReps: number | null;
}
export interface Prog {
  id: string;
  name: string;
  exercises: ProgEx[];
}
export interface ExerciseOption {
  id: string;
  name: string;
  primary_muscle: string | null;
}

const numClass =
  "w-12 rounded-md border border-line bg-carvao px-1 py-1 text-center text-sm text-marfim tabular-nums focus:border-brasa focus:outline-none";

export default function ProgramEditor({
  programs,
  exercises,
}: {
  programs: Prog[];
  exercises: ExerciseOption[];
}) {
  const [dayIndex, setDayIndex] = useState(0);
  const [newEx, setNewEx] = useState(exercises[0]?.id ?? "");
  const [newSets, setNewSets] = useState("3");
  const [newReps, setNewReps] = useState("10");
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState("");
  const [customCat, setCustomCat] = useState("push");
  const [pending, start] = useTransition();

  const day = programs[Math.min(dayIndex, Math.max(0, programs.length - 1))] ?? null;

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* abas dos dias */}
      <div className="flex flex-wrap gap-2">
        {programs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setDayIndex(i)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              i === dayIndex
                ? "border-brasa bg-brasa/15 text-brasa"
                : "border-line bg-carvao-2 text-muted hover:text-marfim"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => start(async () => void (await addProgram("Novo dia")))}
          disabled={pending}
          className="rounded-full border border-line bg-carvao-2 px-3 py-1.5 text-sm text-muted hover:text-marfim"
        >
          ＋ Novo dia
        </button>
      </div>

      {day && (
        <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
          {/* nome do dia + excluir */}
          <div className="mb-3 flex items-center gap-2">
            <input
              defaultValue={day.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== day.name)
                  start(async () => void (await renameProgram(day.id, e.target.value)));
              }}
              className="flex-1 rounded-lg border border-line bg-carvao px-3 py-2 text-marfim focus:border-brasa focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (confirm(`Excluir "${day.name}"?`))
                  start(async () => {
                    await deleteProgram(day.id);
                    setDayIndex(0);
                  });
              }}
              className="rounded-lg border border-line px-3 py-2 text-xs text-muted hover:border-brasa-deep hover:text-brasa-deep"
            >
              Excluir dia
            </button>
          </div>

          {/* exercícios */}
          <ul className="flex flex-col gap-1.5">
            {day.exercises.map((ex, exIdx) => (
              <li
                key={ex.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-carvao px-3 py-2 text-sm"
              >
                <span className="flex flex-col leading-none">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={exIdx === 0 || pending}
                    onClick={() => start(async () => void (await moveExercise(ex.id, "up")))}
                    className="text-xs text-muted hover:text-marfim disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    aria-label="Descer"
                    disabled={exIdx === day.exercises.length - 1 || pending}
                    onClick={() => start(async () => void (await moveExercise(ex.id, "down")))}
                    className="text-xs text-muted hover:text-marfim disabled:opacity-30"
                  >
                    ▼
                  </button>
                </span>
                <span className="flex-1 truncate text-marfim">{ex.name}</span>
                <input
                  defaultValue={ex.targetSets ?? ""}
                  inputMode="numeric"
                  aria-label="séries"
                  onBlur={(e) =>
                    start(async () =>
                      void (await updateExercise({
                        id: ex.id,
                        sets: num(e.target.value),
                        reps: ex.targetReps,
                      })),
                    )
                  }
                  className={numClass}
                />
                <span className="text-muted">×</span>
                <input
                  defaultValue={ex.targetReps ?? ""}
                  inputMode="numeric"
                  aria-label="repetições"
                  onBlur={(e) =>
                    start(async () =>
                      void (await updateExercise({
                        id: ex.id,
                        sets: ex.targetSets,
                        reps: num(e.target.value),
                      })),
                    )
                  }
                  className={numClass}
                />
                <button
                  type="button"
                  aria-label="Remover"
                  onClick={() => start(async () => void (await removeExercise(ex.id)))}
                  className="ml-1 text-muted hover:text-brasa-deep"
                >
                  ✕
                </button>
              </li>
            ))}
            {day.exercises.length === 0 && (
              <li className="text-sm text-muted">Nenhum exercício ainda.</li>
            )}
          </ul>

          {/* adicionar exercício */}
          <div className="mt-3 border-t border-line pt-3">
            <div className="mb-2 flex gap-2">
              {(
                [
                  ["catalog", "Do catálogo"],
                  ["custom", "Criar novo"],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                    mode === m
                      ? "border-brasa bg-brasa/15 text-brasa"
                      : "border-line bg-carvao text-muted hover:text-marfim"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "catalog" ? (
              <>
                <select
                  value={newEx}
                  onChange={(e) => setNewEx(e.target.value)}
                  className="mb-2 w-full rounded-lg border border-line bg-carvao px-3 py-2 text-marfim focus:border-brasa focus:outline-none"
                >
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                      {e.primary_muscle ? ` · ${e.primary_muscle}` : ""}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input value={newSets} onChange={(e) => setNewSets(e.target.value)} inputMode="numeric" aria-label="séries" className={numClass} />
                  <span className="text-muted">×</span>
                  <input value={newReps} onChange={(e) => setNewReps(e.target.value)} inputMode="numeric" aria-label="repetições" className={numClass} />
                  <button
                    type="button"
                    disabled={pending || !newEx}
                    onClick={() =>
                      start(async () =>
                        void (await addExercise({
                          programId: day.id,
                          exerciseId: newEx,
                          sets: num(newSets),
                          reps: num(newReps),
                        })),
                      )
                    }
                    className="ml-auto rounded-lg bg-brasa px-4 py-2 text-sm font-black text-carvao disabled:opacity-50"
                  >
                    Adicionar
                  </button>
                </div>
              </>
            ) : (
              <>
                <input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nome do exercício"
                  className="mb-2 w-full rounded-lg border border-line bg-carvao px-3 py-2 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
                />
                <input
                  value={customMuscle}
                  onChange={(e) => setCustomMuscle(e.target.value)}
                  placeholder="Músculo (opcional)"
                  className="mb-2 w-full rounded-lg border border-line bg-carvao px-3 py-2 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
                />
                <select
                  value={customCat}
                  onChange={(e) => setCustomCat(e.target.value)}
                  aria-label="Categoria"
                  className="mb-2 w-full rounded-lg border border-line bg-carvao px-3 py-2 text-marfim focus:border-brasa focus:outline-none"
                >
                  {(
                    [
                      ["push", "Empurrar · peito/ombro/tríceps"],
                      ["pull", "Puxar · costas/bíceps"],
                      ["legs", "Pernas"],
                      ["core", "Core · abdômen"],
                      ["cardio", "Cardio"],
                      ["mobility", "Mobilidade"],
                    ] as const
                  ).map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input value={newSets} onChange={(e) => setNewSets(e.target.value)} inputMode="numeric" aria-label="séries" className={numClass} />
                  <span className="text-muted">×</span>
                  <input value={newReps} onChange={(e) => setNewReps(e.target.value)} inputMode="numeric" aria-label="repetições" className={numClass} />
                  <button
                    type="button"
                    disabled={pending || !customName.trim()}
                    onClick={() =>
                      start(async () => {
                        await addCustomExercise({
                          programId: day.id,
                          name: customName,
                          category: customCat,
                          muscle: customMuscle,
                          sets: num(newSets),
                          reps: num(newReps),
                        });
                        setCustomName("");
                        setCustomMuscle("");
                      })
                    }
                    className="ml-auto rounded-lg bg-brasa px-4 py-2 text-sm font-black text-carvao disabled:opacity-50"
                  >
                    Criar e adicionar
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
