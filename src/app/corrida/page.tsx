import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import { defaultRunWeeks, parseSessions, currentWeekNo } from "@/lib/runPlan";
import AreaHeader from "../AreaHeader";
import RunLogger from "./RunLogger";
import RunStartControl from "./RunStartControl";

const AREA = AREAS.find((a) => a.slug === "corrida")!;

function spToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(
    new Date(),
  );
}

export default async function CorridaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = spToday();

  const [{ data: events }, { data: profile }, { data: rows }] = await Promise.all([
    supabase.from("xp_events").select("source, amount"),
    supabase
      .from("profiles")
      .select("current_streak, run_start_date")
      .eq("id", user!.id)
      .single(),
    supabase.from("run_weeks").select("week_no, sessions").order("week_no"),
  ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));

  const weeks =
    rows && rows.length > 0
      ? rows.map((r) => ({ weekNo: r.week_no, sessions: parseSessions(r.sessions) }))
      : defaultRunWeeks();

  const weekNo = currentWeekNo(profile?.run_start_date ?? null, today, weeks.length);
  const week = weeks.find((w) => w.weekNo === weekNo) ?? weeks[0];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />

      <RunLogger />

      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="border-l-[3px] border-aco pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
            Plano · Semana {week.weekNo}
            {profile?.run_start_date && (
              <span className="ml-1.5 text-ouro">(atual)</span>
            )}
          </p>
          <Link
            href="/corrida/plano"
            className="text-xs font-semibold text-aco hover:underline"
          >
            Editar
          </Link>
        </div>
        <div className="rounded-lg border border-line bg-carvao p-3">
          <ul className="flex flex-col gap-1.5 text-sm text-marfim">
            {week.sessions.map((s, i) => (
              <li key={i}>
                <span className="text-muted">{s.day}:</span> {s.desc}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3">
          <RunStartControl startDate={profile?.run_start_date ?? null} />
        </div>
        <Link
          href="/perfil/plano"
          className="mt-3 flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2.5 text-sm text-marfim hover:border-aco"
        >
          <span>Ver o plano completo</span>
          <span className="text-muted">›</span>
        </Link>
      </section>
    </main>
  );
}
