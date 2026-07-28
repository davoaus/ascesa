"use client";

import { useState, useTransition } from "react";
import { setFinanceGoals } from "./actions";

export interface FinanceGoalsData {
  metaPoupar: number | null;
  metaGastar: number | null;
  metaDizimo: number | null;
  poupado: number;
  gasto: number;
  dizimado: number;
}

const brl = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Bar({
  label,
  emoji,
  value,
  goal,
  invert = false,
}: {
  label: string;
  emoji: string;
  value: number;
  goal: number | null;
  /** invert=true → passar da meta é RUIM (limite de gasto). */
  invert?: boolean;
}) {
  const pct = goal && goal > 0 ? Math.min(100, (value / goal) * 100) : 0;
  const over = goal != null && goal > 0 && value > goal;
  const good = invert ? !over : pct >= 100;
  const color = invert ? (over ? "#e4572e" : "#4fb286") : good ? "#4fb286" : "#8fb6c9";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="text-marfim">
          {emoji} {label}
        </span>
        <span className="tabular-nums text-muted">
          {brl(value)}
          {goal ? (
            <span className="text-muted">
              {" "}
              / {brl(goal)}
            </span>
          ) : (
            <span className="text-muted"> · sem meta</span>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-carvao">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {invert && over && (
        <p className="mt-1 text-xs text-brasa">
          Estourou o limite em {brl(value - goal!)}.
        </p>
      )}
    </div>
  );
}

export default function FinanceGoals({ data }: { data: FinanceGoalsData }) {
  const [poupar, setPoupar] = useState(data.metaPoupar?.toString() ?? "");
  const [gastar, setGastar] = useState(data.metaGastar?.toString() ?? "");
  const [dizimo, setDizimo] = useState(data.metaDizimo?.toString() ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const num = (s: string) => {
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  function save() {
    start(async () => {
      await setFinanceGoals({
        poupar: num(poupar),
        gastar: num(gastar),
        dizimo: num(dizimo),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
          Metas do mês
        </p>
        <p className="text-xs capitalize text-muted">{monthLabel}</p>
      </div>

      <div className="flex flex-col gap-3">
        <Bar emoji="🐷" label="Poupança" value={data.poupado} goal={data.metaPoupar} />
        <Bar emoji="🙏" label="Dízimo" value={data.dizimado} goal={data.metaDizimo} />
        <Bar
          emoji="🧾"
          label="Gastos"
          value={data.gasto}
          goal={data.metaGastar}
          invert
        />
      </div>

      <details className="mt-4 border-t border-line pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-marfim">
          Definir metas mensais
        </summary>
        <div className="mt-3 flex flex-col gap-2">
          {(
            [
              ["Poupar (R$)", poupar, setPoupar],
              ["Limite de gasto (R$)", gastar, setGastar],
              ["Dízimo (R$)", dizimo, setDizimo],
            ] as const
          ).map(([label, val, setter]) => (
            <label key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{label}</span>
              <input
                inputMode="decimal"
                value={val}
                onChange={(e) => setter(e.target.value)}
                placeholder="—"
                className="w-32 rounded-lg border border-line bg-carvao px-3 py-2 text-right text-marfim tabular-nums placeholder:text-muted focus:border-[#4fb286] focus:outline-none"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="mt-1 rounded-lg bg-[#4fb286] px-4 py-2 font-black text-carvao disabled:opacity-50"
          >
            {pending ? "..." : saved ? "Salvo ✓" : "Salvar metas"}
          </button>
        </div>
      </details>
    </section>
  );
}
