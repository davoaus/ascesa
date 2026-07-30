"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { reorderHabits, deleteHabit, setHabitStartDate } from "./actions";
import type { Habit } from "./HabitTracker";

export default function HabitManager({ habits }: { habits: Habit[] }) {
  const [items, setItems] = useState<Habit[]>(habits);
  const [dragId, setDragId] = useState<string | null>(null);
  const [, start] = useTransition();
  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const startOrder = useRef<string[]>([]);

  // Sincroniza com o servidor quando um hábito é adicionado/removido em outro
  // lugar (mas nunca no meio de um arraste).
  useEffect(() => {
    if (dragId) return;
    const serverIds = habits.map((h) => h.id).join("|");
    const localIds = items.map((h) => h.id).join("|");
    if (serverIds !== localIds) {
      const sameSet =
        habits.length === items.length &&
        habits.every((h) => items.some((i) => i.id === h.id));
      if (!sameSet) setItems(habits);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habits]);

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
        await reorderHabits(now);
      });
    }
  }

  function remove(id: string, name: string) {
    if (!confirm(`Apagar "${name}" e todas as marcações?`)) return;
    setItems((prev) => prev.filter((h) => h.id !== id));
    start(async () => {
      await deleteHabit(id);
    });
  }

  return (
    <ul className="mt-3 flex flex-col gap-2">
      {items.map((h) => (
        <li
          key={h.id}
          ref={(el) => {
            if (el) liRefs.current.set(h.id, el);
            else liRefs.current.delete(h.id);
          }}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`rounded-lg border bg-carvao px-3 py-2 text-sm transition-shadow ${
            dragId === h.id
              ? "border-brasa shadow-lg shadow-black/40 opacity-90"
              : "border-line"
          }`}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Arrastar para reordenar"
              onPointerDown={(e) => beginDrag(e, h.id)}
              className="cursor-grab touch-none select-none px-1 text-muted hover:text-marfim active:cursor-grabbing"
            >
              ⋮⋮
            </button>
            <span className="flex-1 truncate text-marfim">
              {h.emoji} {h.name}
            </span>
            <button
              type="button"
              onClick={() => remove(h.id, h.name)}
              className="text-xs text-muted hover:text-brasa-deep"
            >
              apagar
            </button>
          </div>
          <label className="mt-2 flex items-center gap-2 text-xs text-muted">
            Início:
            <input
              type="date"
              defaultValue={h.startDate ?? ""}
              onChange={(e) =>
                start(async () => void setHabitStartDate(h.id, e.target.value))
              }
              className="rounded-md border border-line bg-carvao-2 px-2 py-1 text-marfim focus:border-brasa focus:outline-none"
            />
          </label>
        </li>
      ))}
    </ul>
  );
}
