import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { levelProgress, minStreakForLevel, worldForLevel } from "@/lib/game/xp";

export default async function ResumoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: workout }, { data: events }, { data: profile }] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("id, total_volume_kg, xp_earned, performed_at")
        .eq("id", id)
        .single(),
      supabase
        .from("xp_events")
        .select("source, amount")
        .eq("workout_id", id)
        .order("amount", { ascending: false }),
      supabase
        .from("profiles")
        .select("xp_total, current_streak")
        .single(),
    ]);

  if (!workout) notFound();

  const progress = levelProgress(profile?.xp_total ?? 0);
  const world = worldForLevel(progress.level);
  const streak = profile?.current_streak ?? 0;
  const nextStreakMin = minStreakForLevel(progress.level + 1);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-10">
      <header className="text-center">
        <p className="text-xs font-black tracking-[0.42em] text-muted">FitQuest</p>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-brasa">
          Vitória
        </p>
        <h1 className="text-3xl font-black text-marfim">Treino concluído</h1>
        <p className="mt-1 text-sm text-muted">
          {Number(workout.total_volume_kg).toLocaleString("pt-BR")} kg movidos ·
          Mundo {world.id} · {world.name}
        </p>
      </header>

      <ul className="flex flex-col gap-1.5">
        {(events ?? []).map((e, i) => (
          <li
            key={i}
            className="flex items-center justify-between rounded-lg border border-line bg-carvao-2 px-4 py-2.5 text-sm"
          >
            <span className="text-marfim">{e.source}</span>
            <span className="font-black tabular-nums text-brasa">
              +{e.amount} XP
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between px-1">
        <span className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
          Total
        </span>
        <span className="text-4xl font-black tabular-nums text-brasa">
          +{workout.xp_earned} XP
        </span>
      </div>

      <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
        <div className="mb-2 flex justify-between text-sm">
          <b className="font-black text-marfim">Nível {progress.level}</b>
          <span className="tabular-nums text-muted">
            {progress.xpIntoLevel.toLocaleString("pt-BR")} /{" "}
            {progress.xpForNextLevel.toLocaleString("pt-BR")} XP
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-carvao">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brasa-deep to-brasa"
            style={{ width: `${Math.round(progress.fraction * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm">
          <span className="font-black text-brasa">
            🔥 {streak} {streak === 1 ? "dia" : "dias"}
          </span>
          <span className="text-muted">
            {" "}
            · ofensiva mín. p/ nível {progress.level + 1}: {nextStreakMin}
          </span>
        </p>
      </section>

      <Link
        href="/"
        className="mt-2 rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-4 text-center font-black tracking-wide text-carvao"
      >
        Continuar jornada
      </Link>
    </main>
  );
}
