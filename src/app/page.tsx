import {
  levelProgress,
  worldForLevel,
  minStreakForLevel,
  nextBoss,
  computeWorkoutXp,
  setVolume,
} from "@/lib/game/xp";

// Dados de demonstração (sem banco ainda). Trocar por leitura do Supabase
// quando a autenticação estiver pronta. Já passam pelo motor de XP real.
const DEMO = {
  name: "Davi",
  xpTotal: 8940,
  streak: 14,
};

// Um treino de exemplo, para a tela de resumo pós-treino ("o boss final é você").
const DEMO_WORKOUT = computeWorkoutXp({
  volumeKg:
    setVolume(62.5, 8) + setVolume(60, 10) * 3 + setVolume(100, 8) * 3,
  hadProgression: true,
  newPr: true,
  proteinHit: true,
  waterHit: true,
});

export default function Home() {
  const progress = levelProgress(DEMO.xpTotal);
  const world = worldForLevel(progress.level);
  const boss = nextBoss(progress.level);
  const streakMin = minStreakForLevel(progress.level + 1);

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-5 px-5 py-10">
      <header className="text-center">
        <p className="text-xs font-black tracking-[0.42em] text-muted">ASCESA</p>
        <p className="mt-1 text-sm text-muted">O boss final é você.</p>
      </header>

      {/* Nível + mundo */}
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
          <p className="text-lg font-black text-brasa">🔥 {DEMO.streak}</p>
        </div>

        {/* Barra de XP */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted tabular-nums">
            <span>
              {progress.xpIntoLevel.toLocaleString("pt-BR")} /{" "}
              {progress.xpForNextLevel.toLocaleString("pt-BR")} XP
            </span>
            <span>próximo nível</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-carvao">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brasa-deep to-brasa"
              style={{ width: `${Math.round(progress.fraction * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Ofensiva mínima p/ nível {progress.level + 1}:{" "}
            <span className={DEMO.streak >= streakMin ? "text-ok" : "text-brasa"}>
              {streakMin} dias {DEMO.streak >= streakMin ? "✓" : ""}
            </span>
          </p>
        </div>
      </section>

      {/* Próximo boss */}
      {boss && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted">
            ⚔️ Próximo boss · nível {boss.level}
          </p>
          <p className="mt-1 text-xl font-black text-marfim">{boss.challenge}</p>
        </section>
      )}

      {/* Resumo pós-treino */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-5">
        <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-brasa">
          Vitória
        </p>
        <p className="text-center text-2xl font-black text-marfim">
          Treino concluído
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {DEMO_WORKOUT.lines.map((line) => (
            <li
              key={line.label}
              className="flex items-center justify-between rounded-lg border border-line bg-carvao px-4 py-2.5 text-sm"
            >
              <span className="text-marfim">{line.label}</span>
              <span className="font-black tabular-nums text-brasa">
                +{line.xp} XP
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-baseline justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Total
          </span>
          <span className="text-3xl font-black tabular-nums text-brasa">
            +{DEMO_WORKOUT.total} XP
          </span>
        </div>
      </section>

      <p className="text-center text-xs text-muted">
        Dados de demonstração · motor de XP em <code>src/lib/game</code>
      </p>
    </main>
  );
}
