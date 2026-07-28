"use client";

import { useState, useTransition } from "react";
import { logReading } from "./actions";

export default function ReadingLogger() {
  const [unit, setUnit] = useState<"pages" | "minutes">("pages");
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const n = Number(value.replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      setErr(unit === "pages" ? "Informe as páginas." : "Informe os minutos.");
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await logReading({ amount: n, unit });
      if (r?.error) setErr(r.error);
      else {
        const label = unit === "pages" ? "páginas" : "min";
        setMsg(`+${r?.xp} XP por ${Math.round(n)} ${label} 📚`);
        setValue("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar leitura
      </p>

      <div className="mb-2 flex gap-2">
        {(
          [
            ["pages", "Páginas"],
            ["minutes", "Minutos"],
          ] as const
        ).map(([u, label]) => (
          <button
            key={u}
            type="button"
            onClick={() => {
              setUnit(u);
              setMsg(null);
            }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              unit === u
                ? "border-[#b3a4e0] bg-[#b3a4e0]/15 text-[#b3a4e0]"
                : "border-line bg-carvao text-muted hover:text-marfim"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setMsg(null);
          }}
          placeholder={unit === "pages" ? "Páginas lidas" : "Minutos de leitura"}
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim tabular-nums placeholder:text-muted focus:outline-none"
          style={{ borderColor: value ? "#b3a4e0" : undefined }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-lg px-5 py-2.5 font-black text-carvao disabled:opacity-50"
          style={{ backgroundColor: "#b3a4e0" }}
        >
          {pending ? "..." : "Registrar"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-2 text-sm text-ok">{msg}</p>}
    </section>
  );
}
