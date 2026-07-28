"use client";

import { useState, useTransition } from "react";
import { saveDailyCheckin, type DailyGoals } from "./actions/daily";

const GOAL_LABELS = {
  proteinHit: "Proteína",
  waterHit: "Hidratação",
  sleepHit: "Sono",
  mobilityHit: "Mobilidade",
} as const;

type GoalKey = keyof typeof GOAL_LABELS;

export default function DailyCheckin({
  initial,
  visible = ["proteinHit", "waterHit", "sleepHit", "mobilityHit"],
  showRest = true,
  title = "Metas de hoje",
}: {
  initial: DailyGoals;
  visible?: GoalKey[];
  showRest?: boolean;
  title?: string;
}) {
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

  // "sujo" só considera os campos visíveis + descanso (se mostrado).
  const dirty =
    visible.some((k) => goals[k] !== initial[k]) ||
    (showRest && goals.isRestDay !== initial.isRestDay);

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {visible.map((key) => (
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
            {GOAL_LABELS[key]}
          </button>
        ))}
      </div>

      {showRest && (
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
      )}

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
