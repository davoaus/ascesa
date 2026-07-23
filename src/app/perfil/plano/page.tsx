import Link from "next/link";
import { WEEK_PLAN, REST_REFERENCE, RUN_PLAN, NUTRITION } from "@/lib/plan";

export default function PlanoPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/perfil" className="text-sm text-muted hover:text-marfim">
          ← Perfil
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">MEU PLANO</p>
      </header>

      {/* semana */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          A semana
        </p>
        <ul className="flex flex-col gap-1.5">
          {WEEK_PLAN.map((d) => (
            <li
              key={d.day}
              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm ${
                d.rest ? "border-line bg-carvao/60" : "border-line bg-carvao"
              }`}
            >
              <span className="flex flex-col">
                <span className="font-bold text-marfim">{d.day}</span>
                <span className="text-xs text-muted">{d.focus}</span>
              </span>
              {d.run && (
                <span className="rounded-md bg-aco/15 px-2 py-0.5 text-xs font-semibold text-aco">
                  🏃 {d.run}
                </span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Descanso entre séries: {REST_REFERENCE}</p>
      </section>

      {/* corrida */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">
          Corrida · 4 semanas
        </p>
        <p className="mb-3 text-xs text-muted">{RUN_PLAN.days.join("  ·  ")}</p>
        <div className="flex flex-col gap-2">
          {RUN_PLAN.weeks.map((w) => (
            <div key={w.n} className="rounded-lg border border-line bg-carvao p-3">
              <p className="mb-1.5 text-xs font-black text-brasa">Semana {w.n}</p>
              <ul className="flex flex-col gap-1 text-sm text-marfim">
                <li>
                  <span className="text-muted">Seg:</span> {w.seg}
                </li>
                <li>
                  <span className="text-muted">Qua:</span> {w.qua}
                </li>
                <li>
                  <span className="text-muted">Sáb:</span> {w.sab}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* alimentação */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">
          Alimentação · {NUTRITION.objetivo}
        </p>
        <div className="mb-3 grid grid-cols-4 gap-2 text-center">
          {[
            ["kcal", NUTRITION.metas.kcal],
            ["Proteína", NUTRITION.metas.proteina],
            ["Carbo", NUTRITION.metas.carbo],
            ["Gordura", NUTRITION.metas.gordura],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-carvao p-2">
              <p className="text-sm font-black text-marfim">{v}</p>
              <p className="text-[10px] text-muted">{k}</p>
            </div>
          ))}
        </div>

        <p className="mb-1 text-xs font-semibold text-muted">Carbo por dia</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {NUTRITION.carboPorDia.map((c) => (
            <span
              key={c.day}
              className="rounded-md border border-line bg-carvao px-2 py-1 text-xs text-marfim"
            >
              {c.day}: <span className="text-muted">{c.carbo}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {NUTRITION.refeicoes.map((r) => (
            <details
              key={r.nome}
              className="rounded-lg border border-line bg-carvao p-3"
            >
              <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-marfim">
                <span>
                  {r.nome}{" "}
                  <span className="text-xs font-normal text-muted">· {r.hora}</span>
                </span>
                <span className="text-xs font-semibold text-brasa">{r.proteina}</span>
              </summary>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-muted">
                {r.opcoes.map((o, i) => (
                  <li key={i}>· {o}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        <p className="mt-3 rounded-lg border border-brasa/30 bg-brasa/5 px-3 py-2 text-xs text-marfim">
          🍕 <b>Refeição livre:</b> {NUTRITION.refeicaoLivre}
        </p>
        <p className="mt-2 text-xs text-muted">{NUTRITION.notas}</p>
      </section>
    </main>
  );
}
