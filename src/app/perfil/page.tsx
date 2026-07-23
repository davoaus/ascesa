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
    .select("total_volume_kg");
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
