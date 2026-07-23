import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./entrar/actions";
import DailyCheckin from "./DailyCheckin";
import {
  levelProgress,
  worldForLevel,
  minStreakForLevel,
  nextBoss,
} from "@/lib/game/xp";

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, xp_total, current_streak, longest_streak")
    .eq("id", user!.id)
    .single();

  const { data: recent } = await supabase
    .from("workouts")
    .select("id, performed_at, total_volume_kg, xp_earned")
    .order("performed_at", { ascending: false })
    .limit(3);

  const { data: attrs } = await supabase
    .from("user_attributes")
    .select("forca, resistencia, disciplina, mobilidade, saude, velocidade")
    .eq("user_id", user!.id)
    .single();

  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("protein_hit, water_hit, sleep_hit, mobility_hit, is_rest_day")
    .eq("user_id", user!.id)
    .eq("checkin_date", todayLocal())
    .maybeSingle();

  const checkinInitial = {
    proteinHit: checkin?.protein_hit ?? false,
    waterHit: checkin?.water_hit ?? false,
    sleepHit: checkin?.sleep_hit ?? false,
    mobilityHit: checkin?.mobility_hit ?? false,
    isRestDay: checkin?.is_rest_day ?? false,
  };

  const attributeList: { label: string; value: number }[] = [
    { label: "Força", value: attrs?.forca ?? 0 },
    { label: "Resistência", value: attrs?.resistencia ?? 0 },
    { label: "Disciplina", value: attrs?.disciplina ?? 0 },
    { label: "Mobilidade", value: attrs?.mobilidade ?? 0 },
    { label: "Saúde", value: attrs?.saude ?? 0 },
    { label: "Velocidade", value: attrs?.velocidade ?? 0 },
  ];

  const xpTotal = profile?.xp_total ?? 0;
  const streak = profile?.current_streak ?? 0;
  const progress = levelProgress(xpTotal);
  const world = worldForLevel(progress.level);
  const boss = nextBoss(progress.level);
  const streakMin = minStreakForLevel(progress.level + 1);
  const streakOk = streak >= streakMin;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/perfil" className="group">
          <p className="text-xs font-black tracking-[0.42em] text-muted">ASCESA</p>
          <p className="text-sm text-muted group-hover:text-marfim">
            Olá, {profile?.display_name ?? "Atleta"} →
          </p>
        </Link>
        <form action={signOut}>
          <button className="text-xs text-muted hover:text-marfim">Sair</button>
        </form>
      </header>

      {/* Nível + ofensiva */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Mundo {world.id} · {world.name}
            </p>
            <p className="text-4xl font-black tracking-tight text-marfim">
              Nível {progress.level}
            </p>
          </div>
          <p className="text-lg font-black text-brasa">🔥 {streak}</p>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs tabular-nums text-muted">
            <span>
              {progress.xpIntoLevel.toLocaleString("pt-BR")} /{" "}
              {progress.xpForNextLevel.toLocaleString("pt-BR")} XP
            </span>
            <span>{xpTotal.toLocaleString("pt-BR")} XP total</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-carvao">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brasa-deep to-brasa"
              style={{ width: `${Math.round(progress.fraction * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Ofensiva mínima p/ nível {progress.level + 1}:{" "}
            <span className={streakOk ? "text-ok" : "text-brasa"}>
              {streakMin} dias {streakOk ? "✓" : ""}
            </span>
          </p>
        </div>
      </section>

      {boss && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            ⚔️ Próximo boss · nível {boss.level}
          </p>
          <p className="mt-1 text-xl font-black text-marfim">{boss.challenge}</p>
        </section>
      )}

      <Link
        href="/treino"
        className="rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-4 text-center font-black tracking-wide text-carvao"
      >
        Começar treino
      </Link>

      <DailyCheckin initial={checkinInitial} />

      {/* Atributos do personagem */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Atributos
        </p>
        <div className="grid grid-cols-3 gap-3">
          {attributeList.map((a) => (
            <div key={a.label} className="text-center">
              <p className="text-2xl font-black tabular-nums text-aco">
                {a.value}
              </p>
              <p className="text-xs text-muted">{a.label}</p>
            </div>
          ))}
        </div>
      </section>

      {recent && recent.length > 0 && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">
            Últimos treinos
          </p>
          <ul className="flex flex-col gap-1.5">
            {recent.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/treino/${w.id}/resumo`}
                  className="flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2 text-sm hover:border-brasa"
                >
                  <span className="text-muted">
                    {new Date(w.performed_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="tabular-nums">
                    <span className="text-muted">
                      {Number(w.total_volume_kg).toLocaleString("pt-BR")} kg
                    </span>
                    <span className="ml-3 font-black text-brasa">
                      +{w.xp_earned} XP
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-auto pt-4 text-center text-xs text-muted">
        O boss final é você.
      </p>
    </main>
  );
}
