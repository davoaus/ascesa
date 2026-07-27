"use client";

import { useState } from "react";

export interface ExerciseSeries {
  name: string;
  points: { date: string; e1rm: number; ton: number }[];
}

const GOLD = "#efc75e";
const EMBER = "#f59a2d";

function fmtDate(d: string) {
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

function Line({ points }: { points: { date: string; e1rm: number }[] }) {
  const W = 300;
  const H = 120;
  const pad = { l: 8, r: 8, t: 12, b: 18 };
  const vals = points.map((p) => p.e1rm);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const n = points.length;
  const x = (i: number) =>
    pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : (i * (W - pad.l - pad.r)) / (n - 1));
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.e1rm)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Progressão de 1RM estimado">
      {[0, 0.5, 1].map((g) => (
        <line
          key={g}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + g * (H - pad.t - pad.b)}
          y2={pad.t + g * (H - pad.t - pad.b)}
          stroke="rgba(255,255,255,.06)"
          strokeWidth={1}
        />
      ))}
      {n > 1 && <path d={d} fill="none" stroke={GOLD} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.e1rm)} r={n === 1 ? 4 : 3} fill={EMBER} />
          {(i === 0 || i === n - 1 || n === 1) && (
            <text x={x(i)} y={H - 5} fill="#c1ccda" fontSize="9" textAnchor="middle">
              {fmtDate(p.date)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

export default function StrengthProgress({ series }: { series: ExerciseSeries[] }) {
  const [idx, setIdx] = useState(0);
  const s = series[Math.min(idx, series.length - 1)];
  const last = s.points[s.points.length - 1];
  const first = s.points[0];
  const delta = last.e1rm - first.e1rm;

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="border-l-[3px] border-ouro pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
          Progressão de força
        </p>
        <select
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          className="max-w-[55%] rounded-md border border-line bg-carvao px-2 py-1 text-xs text-marfim focus:border-ouro focus:outline-none"
        >
          {series.map((x, i) => (
            <option key={x.name} value={i}>
              {x.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2 flex items-baseline gap-3">
        <span className="text-2xl font-black tabular-nums text-ouro">
          {last.e1rm.toLocaleString("pt-BR")} kg
        </span>
        <span className="text-xs text-muted">1RM estimado (Epley)</span>
        {s.points.length > 1 && delta !== 0 && (
          <span className={`text-xs font-bold ${delta > 0 ? "text-ok" : "text-brasa-deep"}`}>
            {delta > 0 ? "▲" : "▼"} {Math.abs(Math.round(delta * 10) / 10)} kg
          </span>
        )}
      </div>

      <Line points={s.points} />

      <p className="mt-2 text-[11px] text-muted">
        Tonelagem na última sessão:{" "}
        <span className="tabular-nums text-marfim">
          {last.ton.toLocaleString("pt-BR")} kg
        </span>
        {s.points.length === 1 && " · registre mais sessões para ver a curva."}
      </p>
    </section>
  );
}
