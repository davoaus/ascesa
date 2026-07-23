import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import RunLogger from "./RunLogger";
import { RUN_PLAN } from "@/lib/plan";

const AREA = AREAS.find((a) => a.slug === "corrida")!;

export default async function CorridaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: profile }] = await Promise.all([
    supabase.from("xp_events").select("source, amount"),
    supabase
      .from("profiles")
      .select("current_streak")
      .eq("id", user!.id)
      .single(),
  ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />

      <RunLogger />

      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">
          Plano · esta semana
        </p>
        <p className="mb-3 text-xs text-muted">{RUN_PLAN.days.join("  ·  ")}</p>
        <div className="rounded-lg border border-line bg-carvao p-3">
          <p className="mb-1.5 text-xs font-black text-aco">Semana 1</p>
          <ul className="flex flex-col gap-1 text-sm text-marfim">
            <li>
              <span className="text-muted">Seg:</span> {RUN_PLAN.weeks[0].seg}
            </li>
            <li>
              <span className="text-muted">Qua:</span> {RUN_PLAN.weeks[0].qua}
            </li>
            <li>
              <span className="text-muted">Sáb:</span> {RUN_PLAN.weeks[0].sab}
            </li>
          </ul>
        </div>
        <Link
          href="/perfil/plano"
          className="mt-3 flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2.5 text-sm text-marfim hover:border-aco"
        >
          <span>Ver as 4 semanas</span>
          <span className="text-muted">›</span>
        </Link>
      </section>
    </main>
  );
}
