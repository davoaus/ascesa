import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  levelProgress,
  worldForLevel,
  minStreakForLevel,
} from "@/lib/game/xp";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: attrs }, { data: progress }, { data: exercises }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, bodyweight_kg, xp_total, current_streak, longest_streak")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("user_attributes")
        .select("forca, resistencia, disciplina, mobilidade, saude, velocidade")
        .eq("user_id", user!.id)
        .single(),
      supabase
        .from("exercise_progress")
        .select("exercise_id, exercise_level, best_volume_kg, best_est_1rm_kg, last_performed_at")
        .order("exercise_level", { ascending: false }),
      supabase.from("exercises").select("id, name, primary_muscle"),
    ]);

  const { data: workouts } = await supabase
    .from("workouts")
    .select("total_volume_kg, performed_at");
  const { count: prCount } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("is_pr", true);
  const { count: checkinCount } = await supabase
    .from("daily_checkins")
    .select("id", { count: "exact", head: true });

  const nameById = new Map((exercises ?? []).map((e) => [e.id, e]));
  const xpTotal = profile?.xp_total ?? 0;
  const prog = levelProgress(xpTotal);
  const world = worldForLevel(prog.level);
  const streak = profile?.current_streak ?? 0;
  const totalVolume = (workouts ?? []).reduce(
    (s, w) => s + Number(w.total_volume_kg),
    0,
  );

  // Volume por semana (segunda a domingo), últimas 8 semanas.
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

  // geometria do gráfico
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

  const attributeList = [
    { label: "Força", value: attrs?.forca ?? 0 },
    { label: "Resistência", value: attrs?.resistencia ?? 0 },
    { label: "Disciplina", value: attrs?.disciplina ?? 0 },
    { label: "Mobilidade", value: attrs?.mobilidade ?? 0 },
    { label: "Saúde", value: attrs?.saude ?? 0 },
    { label: "Velocidade", value: attrs?.velocidade ?? 0 },
  ];

  const stats = [
    { label: "Treinos", value: fmt((workouts ?? []).length) },
    { label: "Volume total", value: `${fmt(Math.round(totalVolume))} kg` },
    { label: "Recordes", value: fmt(prCount ?? 0) },
    { label: "Dias com metas", value: fmt(checkinCount ?? 0) },
    { label: "Maior ofensiva", value: `${fmt(profile?.longest_streak ?? 0)} d` },
    { label: "XP total", value: fmt(xpTotal) },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Voltar
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">PERFIL</p>
      </header>

      {/* resumo do personagem */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-5">
        <p className="text-3xl font-black text-marfim">
          {profile?.display_name ?? "Atleta"}
        </p>
        <p className="mt-1 text-sm text-muted">
          Nível {prog.level} · Mundo {world.id} · {world.name}
          {profile?.bodyweight_kg ? ` · ${fmt(Number(profile.bodyweight_kg))} kg` : ""}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="font-black text-brasa">🔥 {streak} dias</span>
          <span className="text-muted">
            ofensiva mín. p/ nível {prog.level + 1}:{" "}
            {minStreakForLevel(prog.level + 1)}
          </span>
        </div>
      </section>

      {/* estatísticas */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Estatísticas
        </p>
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

      {/* evolução — volume por semana */}
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
          {/* baseline recessiva */}
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
                  <text
                    x={x + colW / 2}
                    y={CH - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#9d9077"
                  >
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

      {/* atributos */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Atributos
        </p>
        <div className="grid grid-cols-3 gap-3">
          {attributeList.map((a) => (
            <div key={a.label} className="text-center">
              <p className="text-2xl font-black tabular-nums text-aco">{a.value}</p>
              <p className="text-xs text-muted">{a.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* níveis por exercício */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Níveis por exercício
        </p>
        {(progress ?? []).length === 0 ? (
          <p className="text-sm text-muted">
            Registre treinos para os exercícios ganharem nível.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {(progress ?? []).map((p) => {
              const ex = nameById.get(p.exercise_id);
              return (
                <li
                  key={p.exercise_id}
                  className="flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-md bg-aco/15 px-2 py-0.5 text-xs font-black text-aco">
                      Nv {p.exercise_level}
                    </span>
                    <span className="text-marfim">{ex?.name ?? "Exercício"}</span>
                  </span>
                  <span className="tabular-nums text-xs text-muted">
                    {p.best_volume_kg ? `${fmt(Number(p.best_volume_kg))} kg` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
