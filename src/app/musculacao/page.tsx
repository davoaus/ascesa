import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  levelProgress,
  worldForLevel,
  minStreakForLevel,
  nextBoss,
} from "@/lib/game/xp";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";

const AREA = AREAS.find((a) => a.slug === "musculacao")!;
const fmt = (n: number) => n.toLocaleString("pt-BR");

export default async function MusculacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: recent }, { data: events }, { data: profile }, { data: progress }, { data: exercises }] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("id, performed_at, total_volume_kg, xp_earned")
        .order("performed_at", { ascending: false })
        .limit(3),
      supabase.from("xp_events").select("source, amount"),
      supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("exercise_progress")
        .select("exercise_id, exercise_level, best_volume_kg")
        .order("exercise_level", { ascending: false }),
      supabase.from("exercises").select("id, name"),
    ]);

  const { data: workouts } = await supabase
    .from("workouts")
    .select("total_volume_kg, performed_at");
  const { count: prCount } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("is_pr", true);

  const areaXpValue = areaXp(AREA, sumXpBySource(events ?? []));
  const prog = levelProgress(areaXpValue);
  const world = worldForLevel(prog.level);
  const boss = nextBoss(prog.level);
  const streak = profile?.current_streak ?? 0;
  const streakMin = minStreakForLevel(prog.level + 1);
  const nameById = new Map((exercises ?? []).map((e) => [e.id, e.name]));
  const totalVolume = (workouts ?? []).reduce(
    (s, w) => s + Number(w.total_volume_kg),
    0,
  );

  // Volume por semana (últimas 8 semanas).
  function mondayKey(iso: string): string {
    const d = new Date(iso);
    const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    u.setUTCDate(u.getUTCDate() - ((u.getUTCDay() + 6) % 7));
    return u.toISOString().slice(0, 10);
  }
  const volByWeek = new Map<string, number>();
  for (const w of workouts ?? []) {
    const k = mondayKey(w.performed_at);
    volByWeek.set(k, (volByWeek.get(k) ?? 0) + Number(w.total_volume_kg));
  }
  const baseMon = new Date(mondayKey(new Date().toISOString()) + "T00:00:00Z");
  const weeks = Array.from({ length: 8 }, (_, idx) => {
    const i = 7 - idx;
    const d = new Date(baseMon);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      label: `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      volume: volByWeek.get(key) ?? 0,
    };
  });
  const maxVol = Math.max(1, ...weeks.map((w) => w.volume));
  const maxIdx = weeks.reduce((best, w, i) => (w.volume > weeks[best].volume ? i : best), 0);
  const thisWeek = weeks[weeks.length - 1].volume;
  const lastWeek = weeks[weeks.length - 2].volume;
  const weekDelta = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : null;

  const CW = 328, CH = 118, padB = 20, padT = 10;
  const chartH = CH - padB - padT;
  const band = CW / weeks.length;
  const colW = Math.min(22, band - 6);
  const col = (v: number) => (v / maxVol) * chartH;
  function colPath(x: number, h: number): string {
    const r = Math.min(4, h / 2);
    const yTop = padT + (chartH - h);
    const yBase = padT + chartH;
    return `M${x},${yBase} L${x},${yTop + r} Q${x},${yTop} ${x + r},${yTop} L${x + colW - r},${yTop} Q${x + colW},${yTop} ${x + colW},${yTop + r} L${x + colW},${yBase} Z`;
  }

  const stats = [
    { label: "Treinos", value: fmt((workouts ?? []).length) },
    { label: "Volume total", value: `${fmt(Math.round(totalVolume))} kg` },
    { label: "Recordes", value: fmt(prCount ?? 0) },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Áreas
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">
          🏋️ MUSCULAÇÃO
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-carvao-2 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Mundo {world.id} · {world.name}
            </p>
            <p className="text-4xl font-black tracking-tight text-marfim">
              Nível {prog.level}
            </p>
          </div>
          <p className="text-lg font-black text-brasa">🔥 {streak}</p>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs tabular-nums text-muted">
            <span>
              {fmt(prog.xpIntoLevel)} / {fmt(prog.xpForNextLevel)} XP
            </span>
            <span>{fmt(areaXpValue)} XP na área</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-carvao">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brasa-deep to-brasa"
              style={{ width: `${Math.round(prog.fraction * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Ofensiva mínima p/ nível {prog.level + 1}: {streakMin} dias
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

      {/* estatísticas de treino */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-black tabular-nums text-marfim">
                {s.value}
              </p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* volume por semana */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            Volume por semana
          </p>
          {weekDelta !== null && (
            <span
              className={`text-xs font-bold ${weekDelta >= 0 ? "text-ok" : "text-brasa-deep"}`}
            >
              {weekDelta >= 0 ? "↑" : "↓"} {Math.abs(weekDelta)}% vs semana passada
            </span>
          )}
        </div>
        <p className="mt-1 text-2xl font-black tabular-nums text-marfim">
          {fmt(Math.round(thisWeek))} kg{" "}
          <span className="text-sm font-normal text-muted">esta semana</span>
        </p>
        <svg
          viewBox={`0 0 ${CW} ${CH}`}
          className="mt-2 w-full"
          role="img"
          aria-label="Volume de treino por semana nas últimas 8 semanas"
        >
          <defs>
            <linearGradient id="colGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#e4572e" />
              <stop offset="1" stopColor="#f59a2d" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={padT + chartH}
            x2={CW}
            y2={padT + chartH}
            stroke="#362c1d"
            strokeWidth="1"
          />
          {weeks.map((w, i) => {
            const h = col(w.volume);
            const x = i * band + (band - colW) / 2;
            const isLast = i === weeks.length - 1;
            return (
              <g key={w.key}>
                {h > 0 && (
                  <path
                    d={colPath(x, h)}
                    fill="url(#colGrad)"
                    fillOpacity={isLast ? 1 : 0.55}
                  />
                )}
                {(i === 0 || isLast) && (
                  <text x={x + colW / 2} y={CH - 6} textAnchor="middle" fontSize="9" fill="#9d9077">
                    {w.label}
                  </text>
                )}
                {i === maxIdx && w.volume > 0 && (
                  <text
                    x={x + colW / 2}
                    y={padT + (chartH - h) - 4}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="#f0e7d4"
                  >
                    {fmt(Math.round(w.volume))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </section>

      {/* níveis por exercício */}
      {(progress ?? []).length > 0 && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            Níveis por exercício
          </p>
          <ul className="flex flex-col gap-1.5">
            {(progress ?? []).map((p) => (
              <li
                key={p.exercise_id}
                className="flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-md bg-aco/15 px-2 py-0.5 text-xs font-black text-aco">
                    Nv {p.exercise_level}
                  </span>
                  <span className="text-marfim">
                    {nameById.get(p.exercise_id) ?? "Exercício"}
                  </span>
                </span>
                <span className="tabular-nums text-xs text-muted">
                  {p.best_volume_kg ? `${fmt(Number(p.best_volume_kg))} kg` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                      {fmt(Number(w.total_volume_kg))} kg
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
    </main>
  );
}
