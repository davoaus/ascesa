import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadMissions } from "./data";
import type { MissionState } from "@/lib/missions";
import ClaimButton from "./ClaimButton";

function MissionList({ missions }: { missions: MissionState[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {missions.map((m) => (
        <li
          key={m.id}
          className="rounded-lg border border-line bg-carvao px-3 py-2.5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                  m.done ? "text-carvao" : "border-muted text-transparent"
                }`}
                style={
                  m.done
                    ? { backgroundColor: m.accent, borderColor: m.accent }
                    : undefined
                }
                aria-hidden
              >
                ✓
              </span>
              <span
                className={m.done ? "text-muted line-through" : "text-marfim"}
              >
                {m.title}
              </span>
            </span>
            {m.done && m.claimed ? (
              <span className="text-xs font-bold text-ok">+{m.reward} XP ✓</span>
            ) : m.done ? (
              <ClaimButton missionId={m.id} reward={m.reward} />
            ) : (
              <span className="text-xs tabular-nums text-muted">
                {m.value}/{m.target} · +{m.reward}
              </span>
            )}
          </div>
          {m.target > 1 && (
            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-carvao-3">
              <span
                className="block h-full rounded-full"
                style={{
                  width: `${Math.round((m.value / m.target) * 100)}%`,
                  backgroundColor: m.accent,
                }}
              />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function MissoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const m = await loadMissions(supabase, user!.id);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Áreas
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">🎯 MISSÕES</p>
      </header>

      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
            Hoje
          </p>
          <p className="text-xs font-bold tabular-nums text-brasa">
            {m.dailyDone}/{m.dailyTotal} concluídas
          </p>
        </div>
        <MissionList missions={m.daily} />
      </section>

      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
            Esta semana
          </p>
          <p className="text-xs font-bold tabular-nums text-brasa">
            {m.weeklyDone}/{m.weeklyTotal} concluídas
          </p>
        </div>
        <MissionList missions={m.weekly} />
      </section>

      <p className="px-1 text-xs text-muted">
        As missões completam sozinhas conforme você registra suas atividades.
        Elas mostram o caminho — cada uma puxa para uma área e para o ranking.
      </p>
    </main>
  );
}
