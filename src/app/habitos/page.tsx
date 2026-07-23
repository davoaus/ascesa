import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import DailyCheckin from "../DailyCheckin";

const AREA = AREAS.find((a) => a.slug === "habitos")!;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function HabitosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: profile }, { data: checkin }] =
    await Promise.all([
      supabase.from("xp_events").select("source, amount"),
      supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("daily_checkins")
        .select("protein_hit, water_hit, sleep_hit, mobility_hit, is_rest_day")
        .eq("user_id", user!.id)
        .eq("checkin_date", todayLocal())
        .maybeSingle(),
    ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));
  const initial = {
    proteinHit: checkin?.protein_hit ?? false,
    waterHit: checkin?.water_hit ?? false,
    sleepHit: checkin?.sleep_hit ?? false,
    mobilityHit: checkin?.mobility_hit ?? false,
    isRestDay: checkin?.is_rest_day ?? false,
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />

      <DailyCheckin
        initial={initial}
        visible={["waterHit", "sleepHit", "mobilityHit"]}
        showRest
        title="Hábitos de hoje"
      />

      <p className="px-1 text-xs text-muted">
        Cada hábito marcado soma XP para esta área e para o seu ranking global.
        Manter os dias seguidos protege sua ofensiva.
      </p>
    </main>
  );
}
