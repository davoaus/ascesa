"use client";

import { useState, useTransition } from "react";
import { logFinance, type FinanceKind } from "./actions";

const KINDS: { kind: FinanceKind; label: string; emoji: string }[] = [
  { kind: "poupar", label: "Poupar", emoji: "🐷" },
  { kind: "gastar", label: "Gastar", emoji: "🧾" },
  { kind: "dizimo", label: "Dízimo", emoji: "🙏" },
];

const ACCENT = "#4fb286";

export default function FinanceLogger() {
  const [kind, setKind] = useState<FinanceKind>("poupar");
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const v = Number(amount.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) {
      setErr("Informe um valor válido.");
      return;
    }
    setErr(null);
    start(async () => {
      const r = await logFinance({ kind, amount: v });
      if (r?.error) setErr(r.error);
      else {
        const label = KINDS.find((k) => k.kind === kind)!.label.toLowerCase();
        const brl = v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        setMsg(
          r.xp
            ? `+${r.xp} XP · ${label} R$ ${brl} 💰`
            : `Registrado: ${label} R$ ${brl}`,
        );
        setAmount("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar lançamento
      </p>

      <div className="mb-2 flex gap-2">
        {KINDS.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => {
              setKind(k.kind);
              setMsg(null);
            }}
            className={`flex-1 rounded-full border px-2 py-1.5 text-xs font-semibold transition-colors ${
              kind === k.kind
                ? "border-[#4fb286] bg-[#4fb286]/15 text-[#4fb286]"
                : "border-line bg-carvao text-muted hover:text-marfim"
            }`}
          >
            {k.emoji} {k.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setMsg(null);
          }}
          placeholder="Valor (R$)"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim tabular-nums placeholder:text-muted focus:outline-none"
          style={{ borderColor: amount ? ACCENT : undefined }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-lg px-5 py-2.5 font-black text-carvao disabled:opacity-50"
          style={{ backgroundColor: ACCENT }}
        >
          {pending ? "..." : "Registrar"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Poupar e dízimo dão XP e reforçam a Disciplina. Gasto entra no
        acompanhamento do limite do mês.
      </p>
      {err && <p className="mt-1 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-1 text-sm text-ok">{msg}</p>}
    </section>
  );
}
