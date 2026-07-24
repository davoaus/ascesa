"use client";

import { useState, useTransition } from "react";
import { logSleep } from "./actions";

const ACCENT = "#7d8fd1";

export default function SleepLogger() {
  const [hours, setHours] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const h = Number(hours.replace(",", "."));
    if (!Number.isFinite(h) || h <= 0) {
      setErr("Informe as horas dormidas.");
      return;
    }
    setErr(null);
    start(async () => {
      const r = await logSleep({ hours: h });
      if (r?.error) setErr(r.error);
      else {
        setMsg(`+${r?.xp} XP por ${h}h de sono 😴`);
        setHours("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-carvao-2 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar sono
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="decimal"
          value={hours}
          onChange={(e) => {
            setHours(e.target.value);
            setMsg(null);
          }}
          placeholder="Horas dormidas (ex.: 7,5)"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim tabular-nums placeholder:text-muted focus:outline-none"
          style={{ borderColor: hours ? ACCENT : undefined }}
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
      <p className="mt-2 text-xs text-muted">Faixa ideal: 7–9h vale XP cheio.</p>
      {err && <p className="mt-1 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-1 text-sm text-ok">{msg}</p>}
    </section>
  );
}
