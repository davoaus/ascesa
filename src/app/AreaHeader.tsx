import Link from "next/link";
import { levelProgress } from "@/lib/game/xp";
import type { Area } from "@/lib/areas";

const fmt = (n: number) => n.toLocaleString("pt-BR");

// Cabeçalho padrão de uma área: título, nível da área e barra de progresso.
export default function AreaHeader({
  area,
  xp,
  streak,
}: {
  area: Area;
  xp: number;
  streak: number;
}) {
  const prog = levelProgress(xp);
  return (
    <>
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Áreas
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">
          {area.icon} {area.name.toUpperCase()}
        </p>
      </header>

      <section
        className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-5"
        style={{ ["--c" as string]: area.accent }}
      >
        <div className="flex items-baseline justify-between">
          <div>
            <p
              className="border-l-[3px] pl-2.5 text-xs font-bold uppercase tracking-widest text-muted"
              style={{ borderColor: area.accent }}
            >
              {area.tagline}
            </p>
            <p className="text-4xl font-black tracking-tight text-marfim">
              Nível {prog.level}
            </p>
          </div>
          <p className="text-lg font-black" style={{ color: area.accent }}>
            🔥 {streak}
          </p>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs tabular-nums text-muted">
            <span>
              {fmt(prog.xpIntoLevel)} / {fmt(prog.xpForNextLevel)} XP
            </span>
            <span>{fmt(xp)} XP na área</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-carvao">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round(prog.fraction * 100)}%`,
                backgroundColor: area.accent,
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
