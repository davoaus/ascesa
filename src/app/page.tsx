import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./entrar/actions";
import {
  AREAS,
  areaXp,
  sumXpBySource,
  rankForLevel,
  levelForXp,
} from "@/lib/areas";
import { loadMissions } from "./missoes/data";

const fmt = (n: number) => n.toLocaleString("pt-BR");

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: events }, missions] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, xp_total, current_streak")
      .eq("id", user!.id)
      .single(),
    supabase.from("xp_events").select("source, amount"),
    loadMissions(supabase, user!.id),
  ]);

  const xpBySource = sumXpBySource(events ?? []);
  const xpTotal = profile?.xp_total ?? 0;
  const globalLevel = levelForXp(xpTotal);
  const rank = rankForLevel(globalLevel);
  const streak = profile?.current_streak ?? 0;

  const areas = AREAS.map((a) => {
    const xp = areaXp(a, xpBySource);
    return { ...a, xp, level: levelForXp(xp) };
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-5 py-8">
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

      {/* Ranking global — o objetivo é ser melhor */}
      <section className="rounded-2xl border border-line bg-gradient-to-br from-carvao-3 to-carvao-2 p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted">
              Ranking · Patente
            </p>
            <p className="text-3xl font-black text-ouro">{rank.name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums text-marfim">
              {fmt(xpTotal)}
            </p>
            <p className="text-xs text-muted">pontos · 🔥 {streak}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          Nível global {globalLevel}
          {rank.nextName
            ? ` · próxima patente (${rank.nextName}) no nível ${rank.nextAtLevel}`
            : " · patente máxima"}
        </p>
      </section>

      {/* Missões de hoje */}
      <Link
        href="/missoes"
        className="flex items-center justify-between rounded-2xl border border-line bg-carvao-2 px-4 py-3.5 hover:border-brasa"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-marfim">
          🎯 Missões de hoje
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-black tabular-nums text-brasa">
            {missions.dailyDone}/{missions.dailyTotal}
          </span>
          <span className="text-muted">›</span>
        </span>
      </Link>

      {/* Seletor de áreas (estilo Netflix) */}
      <div>
        <p className="mb-3 text-sm text-muted">
          Escolha a área. Toda evolução soma para o ranking.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {areas.map((a) => (
            <Link
              key={a.slug}
              href={a.route}
              className="group flex flex-col rounded-2xl border border-line bg-carvao-2 p-4 transition-colors hover:border-[var(--c)]"
              style={{ ["--c" as string]: a.accent }}
            >
              <div
                className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl text-3xl"
                style={{ backgroundColor: `${a.accent}22` }}
              >
                {a.icon}
              </div>
              <p className="text-lg font-black text-marfim">{a.name}</p>
              <p className="text-xs text-muted">{a.tagline}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span
                  className="text-sm font-black"
                  style={{ color: a.accent }}
                >
                  Nível {a.level}
                </span>
                <span className="text-xs tabular-nums text-muted">
                  {fmt(a.xp)} XP
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-auto pt-2 text-center text-xs text-muted">
        O seu maior adversário é você mesmo.
      </p>
    </main>
  );
}
