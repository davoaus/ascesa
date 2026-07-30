"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveWeekSessions, addWeek, removeWeek, seedRunPlan } from "./actions";
import type { RunSession } from "@/lib/runPlan";

interface Week {
  id: string;
  weekNo: number;
  sessions: RunSession[];
}

const ACCENT = "#8fb6c9";

function WeekCard({ week }: { week: Week }) {
  const router = useRouter();
  const [sessions, setSessions] = useState<RunSession[]>(week.sessions);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const dirty = JSON.stringify(sessions) !== JSON.stringify(week.sessions);

  function beginDrag(e: React.PointerEvent, i: number) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragIndex(i);
  }
  function onMove(e: React.PointerEvent) {
    if (dragIndex == null) return;
    const y = e.clientY;
    let target = sessions.length - 1;
    for (let k = 0; k < sessions.length; k++) {
      const el = rowRefs.current[k];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (y < r.top + r.height / 2) {
        target = k;
        break;
      }
    }
    if (target === dragIndex) return;
    setSessions((prev) => {
      const next = [...prev];
      const [m] = next.splice(dragIndex, 1);
      next.splice(target, 0, m);
      return next;
    });
    setDragIndex(target);
    setSaved(false);
  }
  function endDrag() {
    if (dragIndex == null) return;
    setDragIndex(null);
    start(async () => {
      await saveWeekSessions(week.id, sessionsRef.current);
    });
  }

  function patch(i: number, field: keyof RunSession, value: string) {
    setSessions((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
    setSaved(false);
  }
  function addSession() {
    setSessions((prev) => [...prev, { day: "", desc: "" }]);
    setSaved(false);
  }
  function removeSession(i: number) {
    setSessions((prev) => prev.filter((_, idx) => idx !== i));
    setSaved(false);
  }
  function save() {
    start(async () => {
      await saveWeekSessions(week.id, sessions);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }
  function del() {
    if (!confirm(`Remover a Semana ${week.weekNo}?`)) return;
    start(async () => {
      await removeWeek(week.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-line bg-carvao p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black" style={{ color: ACCENT }}>
          Semana {week.weekNo}
        </p>
        <button
          type="button"
          onClick={del}
          disabled={pending}
          className="text-xs text-muted hover:text-brasa"
        >
          remover semana
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {sessions.map((s, i) => (
          <div
            key={i}
            ref={(el) => {
              rowRefs.current[i] = el;
            }}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`flex items-start gap-2 rounded-lg ${
              dragIndex === i ? "opacity-90 shadow-lg shadow-black/40" : ""
            }`}
          >
            <button
              type="button"
              aria-label="Arrastar para reordenar"
              onPointerDown={(e) => beginDrag(e, i)}
              className="mt-2 shrink-0 cursor-grab touch-none select-none px-0.5 text-muted hover:text-marfim active:cursor-grabbing"
            >
              ⋮⋮
            </button>
            <input
              value={s.day}
              onChange={(e) => patch(i, "day", e.target.value)}
              placeholder="Dia"
              className="w-16 shrink-0 rounded-lg border border-line bg-carvao-2 px-2 py-2 text-sm text-marfim placeholder:text-muted focus:border-aco focus:outline-none"
            />
            <textarea
              value={s.desc}
              onChange={(e) => patch(i, "desc", e.target.value)}
              placeholder="Ex: 8×400m a 5:30/km (1:30 trote)"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-line bg-carvao-2 px-2 py-2 text-sm text-marfim placeholder:text-muted focus:border-aco focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeSession(i)}
              className="shrink-0 px-1 py-2 text-muted hover:text-brasa"
              aria-label="Remover sessão"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={addSession}
          className="text-xs font-semibold text-muted hover:text-marfim"
        >
          + sessão
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-lg px-4 py-1.5 text-sm font-black text-carvao disabled:opacity-40"
          style={{ backgroundColor: ACCENT }}
        >
          {pending ? "..." : saved ? "Salvo ✓" : "Salvar"}
        </button>
      </div>
    </div>
  );
}

export default function RunPlanEditor({ initialWeeks }: { initialWeeks: Week[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  // Se a primeira renderização vier sem semanas (semeadura ainda não visível),
  // garante o plano padrão e recarrega.
  useEffect(() => {
    if (initialWeeks.length === 0) {
      seedRunPlan().then(() => router.refresh());
    }
  }, [initialWeeks.length, router]);

  function add() {
    start(async () => {
      await addWeek();
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-3">
      {initialWeeks.map((w) => (
        <WeekCard key={w.id} week={w} />
      ))}

      <button
        type="button"
        onClick={add}
        disabled={pending}
        className="rounded-xl border border-dashed border-line py-3 text-sm font-semibold text-muted hover:border-aco hover:text-marfim disabled:opacity-50"
      >
        {pending ? "..." : "+ Adicionar semana"}
      </button>
    </section>
  );
}
