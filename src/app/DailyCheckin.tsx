"use client";

import { useState, useTransition } from "react";
import { saveDailyCheckin, type DailyGoals } from "./actions/daily";

const GOALS = [
  ["proteinHit", "Proteína"],
  ["waterHit", "Hidratação"],
  ["sleepHit", "Sono"],
  ["mobilityHit", "Mobilidade"],
] as const;

export default function DailyCheckin({ initial }: { initial: DailyGoals }) {
  const [goals, setGoals] = useState<DailyGoals>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(key: keyof DailyGoals) {
    setGoals((g) => ({ ...g, [key]: !g[key] }));
    setSaved(false);
  }

  function save() {
    startTransition(async () => {
      await saveDailyCheckin(goals);
      setSaved(true);
    });
  }

  const dirty =
    goals.proteinHit !== initial.proteinHit ||
    goals.waterHit !== initial.waterHit ||
    goals.sleepHit !== initial.sleepHit ||
    goals.mobilityHit !== initial.mobilityHit ||
    goals.isRestDay !== initial.isRestDay;

  return (
    <section className="rounded-2xl border border-line bg-carvao-2 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
        Metas de hoje
      </p>
      <div className="grid grid-cols-2 gap-2">
        {GOALS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
              goals[key]
                ? "border-brasa bg-brasa/10 text-brasa"
                : "border-line bg-carvao text-muted"
            }`}
          >
            {goals[key] ? "✓ " : ""}
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => toggle("isRestDay")}
        className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-sm transition-colors ${
          goals.isRestDay
            ? "border-aco bg-aco/10 text-aco"
            : "border-line bg-carvao text-muted"
        }`}
      >
        {goals.isRestDay ? "✓ " : ""}
        Dia de descanso (protege a ofensiva)
      </button>

      {dirty ? (
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="mt-3 w-full rounded-lg bg-gradient-to-r from-brasa to-ouro px-3 py-2.5 text-sm font-black text-carvao disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Salvar metas"}
        </button>
      ) : saved ? (
        <p className="mt-3 text-center text-xs text-ok">Metas registradas ✓</p>
      ) : null}
    </section>
  );
}
