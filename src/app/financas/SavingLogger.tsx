"use client";

import { useState, useTransition } from "react";
import { logSaving } from "./actions";

const ACCENT = "#4fb286";

export default function SavingLogger() {
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const v = Number(amount.replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) {
      setErr("Informe o valor guardado.");
      return;
    }
    setErr(null);
    start(async () => {
      const r = await logSaving({ amount: v });
      if (r?.error) setErr(r.error);
      else {
        setMsg(`+${r?.xp} XP por guardar R$ ${v.toLocaleString("pt-BR")} 💰`);
        setAmount("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-carvao-2 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar economia
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setMsg(null);
          }}
          placeholder="Quanto guardei hoje (R$)"
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
        Guardou, deixou de gastar à toa ou aportou? Registre — cada economia conta.
      </p>
      {err && <p className="mt-1 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-1 text-sm text-ok">{msg}</p>}
    </section>
  );
}
