import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { levelForXp, levelProgress } from "@/lib/game/xp";
import { AREAS, areaXp, sumXpBySource, rankForLevel } from "@/lib/areas";
import StrengthProgress, { type ExerciseSeries } from "./StrengthProgress";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: attrs }, { data: events }, { count: activeDays }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, bodyweight_kg, goal, xp_total, current_streak, longest_streak")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("user_attributes")
        .select("forca, resistencia, disciplina, mobilidade, saude, velocidade")
        .eq("user_id", user!.id)
        .single(),
      supabase.from("xp_events").select("source, amount"),
      supabase
        .from("streak_log")
        .select("id", { count: "exact", head: true })
        .eq("completed", true),
    ]);

  // Progressão de força: 1RM estimado (Epley) e tonelagem por sessão/exercício.
  const { data: recentWorkouts } = await supabase
    .from("workouts")
    .select("id, performed_at")
    .order("performed_at")
    .limit(80);
  const wIds = (recentWorkouts ?? []).map((w) => w.id);
  const [{ data: pSets }, { data: exList }] = await Promise.all([
    wIds.length
      ? supabase
          .from("workout_sets")
          .select("workout_id, exercise_id, weight_kg, reps, is_warmup")
          .in("workout_id", wIds)
      : Promise.resolve({ data: [] as { workout_id: string; exercise_id: string; weight_kg: number; reps: number; is_warmup: boolean }[] }),
    supabase.from("exercises").select("id, name"),
  ]);
  const exName = new Map((exList ?? []).map((e) => [e.id, e.name]));
  const perfById = new Map((recentWorkouts ?? []).map((w) => [w.id, w.performed_at]));

  // exercise_id -> workout_id -> {best est1rm, tonnage}
  const acc = new Map<string, Map<string, { e1rm: number; ton: number }>>();
  for (const s of pSets ?? []) {
    if (s.is_warmup) continue;
    const w = Number(s.weight_kg);
    const r = s.reps;
    if (!(w > 0) || !(r > 0)) continue;
    const e1rm = w * (1 + r / 30);
    if (!acc.has(s.exercise_id)) acc.set(s.exercise_id, new Map());
    const perW = acc.get(s.exercise_id)!;
    const cur = perW.get(s.workout_id) ?? { e1rm: 0, ton: 0 };
    perW.set(s.workout_id, {
      e1rm: Math.max(cur.e1rm, e1rm),
      ton: cur.ton + w * r,
    });
  }
  const strengthSeries: ExerciseSeries[] = [];
  for (const [exId, perW] of acc) {
    const points = [...perW.entries()]
      .map(([wid, v]) => ({
        date: (perfById.get(wid) ?? "").slice(0, 10),
        e1rm: Math.round(v.e1rm * 10) / 10,
        ton: Math.round(v.ton),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    if (points.length >= 1) {
      strengthSeries.push({ name: exName.get(exId) ?? "Exercício", points });
    }
  }
  strengthSeries.sort((a, b) => b.points.length - a.points.length);

  const xpBySource = sumXpBySource(events ?? []);
  const xpTotal = profile?.xp_total ?? 0;
  const globalLevel = levelForXp(xpTotal);
  const rank = rankForLevel(globalLevel);
  const streak = profile?.current_streak ?? 0;

  const areas = AREAS.map((a) => {
    const xp = areaXp(a, xpBySource);
    const p = levelProgress(xp);
    return { ...a, xp, level: p.level, fraction: p.fraction };
  }).sort((x, y) => y.xp - x.xp);
  const activeAreas = areas.filter((a) => a.xp > 0).length;

  const attributeList = [
    { label: "Força", value: attrs?.forca ?? 0 },
    { label: "Resistência", value: attrs?.resistencia ?? 0 },
    { label: "Disciplina", value: attrs?.disciplina ?? 0 },
    { label: "Mobilidade", value: attrs?.mobilidade ?? 0 },
    { label: "Saúde", value: attrs?.saude ?? 0 },
    { label: "Velocidade", value: attrs?.velocidade ?? 0 },
  ];

  const stats = [
    { label: "Pontos", value: fmt(xpTotal) },
    { label: "Maior ofensiva", value: `${fmt(profile?.longest_streak ?? 0)} d` },
    { label: "Dias ativos", value: fmt(activeDays ?? 0) },
    { label: "Áreas ativas", value: `${activeAreas}/${AREAS.length}` },
    { label: "Nível global", value: fmt(globalLevel) },
    { label: "Ofensiva", value: `🔥 ${streak}` },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Áreas
        </Link>
        <Link href="/perfil/config" className="text-sm text-muted hover:text-marfim">
          ⚙ Configurações
        </Link>
      </header>

      {/* personagem + patente */}
      <section className="rounded-2xl border border-line bg-gradient-to-br from-carvao-3 to-carvao-2 p-5">
        <p className="text-3xl font-black text-marfim">
          {profile?.display_name ?? "Atleta"}
        </p>
        <p className="mt-1 text-sm">
          <span className="font-black text-ouro">{rank.name}</span>
          <span className="text-muted">
            {" "}
            · nível global {globalLevel}
            {profile?.bodyweight_kg ? ` · ${fmt(Number(profile.bodyweight_kg))} kg` : ""}
            {profile?.goal ? ` · ${profile.goal}` : ""}
          </span>
        </p>
        <p className="mt-2 text-xs text-muted">
          {rank.nextName
            ? `Próxima patente (${rank.nextName}) no nível ${rank.nextAtLevel}`
            : "Patente máxima alcançada"}
        </p>
        <Link
          href="/perfil/plano"
          className="mt-4 flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2.5 text-sm text-marfim hover:border-brasa"
        >
          <span>📋 Meu plano · treino, corrida e alimentação</span>
          <span className="text-muted">›</span>
        </Link>
        <Link
          href="/perfil/dados"
          className="mt-2 flex items-center justify-between rounded-lg border border-line bg-carvao px-3 py-2.5 text-sm text-marfim hover:border-brasa"
        >
          <span>💾 Dados · backup e restauro (export/import)</span>
          <span className="text-muted">›</span>
        </Link>
      </section>

      {strengthSeries.length > 0 && <StrengthProgress series={strengthSeries} />}

      {/* suas áreas */}
      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
          Suas áreas
        </p>
        <ul className="flex flex-col gap-2">
          {areas.map((a) => (
            <li key={a.slug}>
              <Link
                href={a.route}
                className="flex items-center gap-3 rounded-lg border border-line bg-carvao px-3 py-2.5 hover:border-[var(--c)]"
                style={{ ["--c" as string]: a.accent }}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="flex-1">
                  <span className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-marfim">{a.name}</span>
                    <span className="text-xs tabular-nums text-muted">
                      Nv {a.level} · {fmt(a.xp)} XP
                    </span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-carvao-3">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.round(a.fraction * 100)}%`,
                        backgroundColor: a.accent,
                      }}
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* estatísticas gerais */}
      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
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

      {/* atributos do personagem (cruzam as áreas) */}
      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
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
    </main>
  );
}
