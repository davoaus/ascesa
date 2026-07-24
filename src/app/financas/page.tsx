import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import SavingLogger from "./SavingLogger";

const AREA = AREAS.find((a) => a.slug === "financas")!;

export default async function FinancasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: profile }] = await Promise.all([
    supabase.from("xp_events").select("source, amount"),
    supabase.from("profiles").select("current_streak").eq("id", user!.id).single(),
  ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />
      <SavingLogger />
      <p className="px-1 text-xs text-muted">
        Controle financeiro também é evolução. Cada economia registrada soma XP
        para as Finanças e para o ranking, e reforça a Disciplina.
      </p>
    </main>
  );
}
