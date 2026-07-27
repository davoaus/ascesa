import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { defaultRunWeeks, parseSessions } from "@/lib/runPlan";
import RunPlanEditor from "./RunPlanEditor";

export default async function CorridaPlanoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: rows } = await supabase
    .from("run_weeks")
    .select("id, week_no, sessions")
    .order("week_no");

  // Semeia o plano padrão na primeira visita.
  if (!rows || rows.length === 0) {
    await supabase.from("run_weeks").insert(
      defaultRunWeeks().map((w) => ({
        user_id: user!.id,
        week_no: w.weekNo,
        sessions: w.sessions as unknown as Json,
      })),
    );
    const reload = await supabase
      .from("run_weeks")
      .select("id, week_no, sessions")
      .order("week_no");
    rows = reload.data;
  }

  const weeks = (rows ?? []).map((r) => ({
    id: r.id,
    weekNo: r.week_no,
    sessions: parseSessions(r.sessions),
  }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/corrida" className="text-sm text-muted hover:text-marfim">
          ← Corrida
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">PLANO</p>
      </header>

      <div>
        <p className="text-2xl font-black text-marfim">Plano de corrida</p>
        <p className="text-sm text-muted">
          Edite as sessões, adicione ou remova semanas do seu jeito.
        </p>
      </div>

      <RunPlanEditor initialWeeks={weeks} />
    </main>
  );
}
