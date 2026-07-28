import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import DailyCheckin from "../DailyCheckin";
import { NUTRITION } from "@/lib/plan";

const AREA = AREAS.find((a) => a.slug === "alimentacao")!;

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function AlimentacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: events }, { data: profile }, { data: checkin }] =
    await Promise.all([
      supabase.from("xp_events").select("source, amount"),
      supabase
        .from("profiles")
        .select("current_streak, nutrition_kcal, nutrition_protein, nutrition_carb, nutrition_fat")
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
        visible={["proteinHit"]}
        showRest={false}
        title="Bati a proteína hoje"
      />

      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
          Metas · {NUTRITION.objetivo}
        </p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            ["kcal", profile?.nutrition_kcal ?? NUTRITION.metas.kcal],
            ["Proteína", profile?.nutrition_protein ?? NUTRITION.metas.proteina],
            ["Carbo", profile?.nutrition_carb ?? NUTRITION.metas.carbo],
            ["Gordura", profile?.nutrition_fat ?? NUTRITION.metas.gordura],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line bg-carvao p-2">
              <p className="text-sm font-black text-marfim">{v}</p>
              <p className="text-[10px] text-muted">{k}</p>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/perfil/plano"
        className="flex items-center justify-between rounded-xl border border-line bg-carvao-2 px-4 py-3.5 text-sm text-marfim hover:border-ok"
      >
        <span>🍽️ Ver o plano alimentar completo</span>
        <span className="text-muted">›</span>
      </Link>
    </main>
  );
}
