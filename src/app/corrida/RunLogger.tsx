"use client";

import { useState, useTransition } from "react";
import { logRun } from "./actions";

export default function RunLogger() {
  const [km, setKm] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const d = Number(km.replace(",", "."));
    if (!Number.isFinite(d) || d <= 0) {
      setErr("Informe a distância em km.");
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await logRun({ distanceKm: d });
      if (r?.error) setErr(r.error);
      else {
        setMsg(`+${r?.xp} XP pela corrida de ${d} km 🏃`);
        setKm("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar corrida
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="decimal"
          value={km}
          onChange={(e) => {
            setKm(e.target.value);
            setMsg(null);
          }}
          placeholder="Distância (km)"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim tabular-nums placeholder:text-muted focus:border-aco focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-lg bg-aco px-5 py-2.5 font-black text-carvao disabled:opacity-50"
        >
          {pending ? "..." : "Registrar"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-2 text-sm text-ok">{msg}</p>}
    </section>
  );
}
