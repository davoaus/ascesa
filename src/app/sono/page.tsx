import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import SleepLogger from "./SleepLogger";

const AREA = AREAS.find((a) => a.slug === "sono")!;

export default async function SonoPage() {
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
      <SleepLogger />
      <p className="px-1 text-xs text-muted">
        Dormir bem é recuperação — soma XP para o Sono e para o ranking, e reforça
        o atributo Saúde. Registre todo dia para manter a ofensiva.
      </p>
    </main>
  );
}
