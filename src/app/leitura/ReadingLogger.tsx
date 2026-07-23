"use client";

import { useState, useTransition } from "react";
import { logReading } from "./actions";

export default function ReadingLogger() {
  const [pages, setPages] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    const p = Number(pages.replace(",", "."));
    if (!Number.isFinite(p) || p <= 0) {
      setErr("Informe quantas páginas você leu.");
      return;
    }
    setErr(null);
    startTransition(async () => {
      const r = await logReading({ pages: p });
      if (r?.error) setErr(r.error);
      else {
        setMsg(`+${r?.xp} XP por ${Math.round(p)} páginas 📚`);
        setPages("");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-carvao-2 p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
        Registrar leitura
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          inputMode="numeric"
          value={pages}
          onChange={(e) => {
            setPages(e.target.value);
            setMsg(null);
          }}
          placeholder="Páginas lidas"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim tabular-nums placeholder:text-muted focus:outline-none"
          style={{ borderColor: pages ? "#b3a4e0" : undefined }}
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
