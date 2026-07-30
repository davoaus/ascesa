"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { reorderExercises, removeExercise, updateExercise } from "./actions";
import type { ProgEx } from "./ProgramEditor";

const numClass =
  "w-12 rounded-md border border-line bg-carvao px-1 py-1 text-center text-sm text-marfim tabular-nums focus:border-brasa focus:outline-none";

export default function ExerciseList({ exercises }: { exercises: ProgEx[] }) {
  const [items, setItems] = useState<ProgEx[]>(exercises);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, start] = useTransition();
  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const startOrder = useRef<string[]>([]);

  useEffect(() => {
    if (dragId) return;
    const a = exercises.map((e) => e.id).join("|");
    const b = items.map((e) => e.id).join("|");
    if (a !== b) {
      const sameSet =
        exercises.length === items.length &&
        exercises.every((e) => items.some((i) => i.id === e.id));
      if (!sameSet) setItems(exercises);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises]);

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  function beginDrag(e: React.PointerEvent, id: string) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    startOrder.current = items.map((i) => i.id);
    setDragId(id);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragId) return;
    const y = e.clientY;
    let target = items.length - 1;
    for (let k = 0; k < items.length; k++) {
      const el = liRefs.current.get(items[k].id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        target = k;
        break;
      }
    }
    const from = items.findIndex((i) => i.id === dragId);
    if (from === -1 || from === target) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(target, 0, moved);
    setItems(next);
  }
  function endDrag() {
    if (!dragId) return;
    setDragId(null);
    const now = items.map((i) => i.id);
    if (now.join("|") !== startOrder.current.join("|")) {
      start(async () => {
        await reorderExercises(now);
      });
    }
  }

  if (items.length === 0)
    return <p className="text-sm text-muted">Nenhum exercício ainda.</p>;

  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((ex) => (
        <li
          key={ex.id}
          ref={(el) => {
            if (el) liRefs.current.set(ex.id, el);
            else liRefs.current.delete(ex.id);
          }}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`flex items-center gap-2 rounded-lg border bg-carvao px-3 py-2 text-sm transition-shadow ${
            dragId === ex.id
              ? "border-brasa shadow-lg shadow-black/40 opacity-90"
              : "border-line"
          }`}
        >
          <button
            type="button"
            aria-label="Arrastar para reordenar"
            onPointerDown={(e) => beginDrag(e, ex.id)}
            className="cursor-grab touch-none select-none px-0.5 text-muted hover:text-marfim active:cursor-grabbing"
          >
            ⋮⋮
          </button>
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
            onClick={() => {
              setItems((prev) => prev.filter((i) => i.id !== ex.id));
              start(async () => void (await removeExercise(ex.id)));
            }}
            className="ml-1 text-muted hover:text-brasa-deep"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
