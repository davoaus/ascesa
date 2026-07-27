import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadMissions } from "../missoes/data";
import ClaimButton from "../missoes/ClaimButton";
import TodayHabits from "./TodayHabits";
import RunLogger from "../corrida/RunLogger";
import ReadingLogger from "../leitura/ReadingLogger";
import SleepLogger from "../sono/SleepLogger";
import FinanceLogger from "../financas/FinanceLogger";

function spToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function HojePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = spToday();

  const [missions, { data: habits }, { data: todayLogs }] = await Promise.all([
    loadMissions(supabase, user!.id),
    supabase
      .from("habits")
      .select("id, name, emoji, color")
      .eq("archived", false)
      .order("sort_order"),
    supabase
      .from("habit_logs")
      .select("habit_id")
      .eq("log_date", today),
  ]);

  const doneIds = new Set((todayLogs ?? []).map((l) => l.habit_id));
  const todayHabits = (habits ?? []).map((h) => ({
    ...h,
    doneToday: doneIds.has(h.id),
  }));

  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Áreas
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">🎯 HOJE</p>
      </header>

      <div>
        <p className="text-2xl font-black text-marfim">Seu dia</p>
        <p className="text-sm capitalize text-muted">{dateLabel}</p>
      </div>

      {/* missões de hoje */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Missões de hoje
          </p>
          <p className="text-xs font-bold tabular-nums text-brasa">
            {missions.dailyDone}/{missions.dailyTotal}
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {missions.daily.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-line bg-carvao px-3 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    m.done ? "text-carvao" : "border-muted text-transparent"
                  }`}
                  style={m.done ? { backgroundColor: m.accent, borderColor: m.accent } : undefined}
                  aria-hidden
                >
                  ✓
                </span>
                <span className={m.done ? "text-muted line-through" : "text-marfim"}>
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
            </li>
          ))}
        </ul>
      </section>

      {/* hábitos de hoje */}
      <TodayHabits habits={todayHabits} today={today} />

      {/* treino */}
      <Link
        href="/treino"
        className="rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-4 text-center font-black tracking-wide text-carvao"
      >
        🏋️ Registrar treino
      </Link>

      {/* registros rápidos */}
      <p className="mt-1 px-1 text-xs font-bold uppercase tracking-widest text-muted">
        Registros rápidos
      </p>
      <RunLogger />
      <ReadingLogger />
      <SleepLogger />
      <FinanceLogger />
    </main>
  );
}
