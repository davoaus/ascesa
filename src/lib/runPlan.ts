// Modelo editável do plano de corrida. A fonte de verdade passa a ser a tabela
// run_weeks (uma linha por semana, com as sessões em JSONB). O RUN_PLAN estático
// de plan.ts vira apenas o SEED inicial (plano do Davo) quando o usuário ainda
// não tem nada salvo.

import { RUN_PLAN } from "./plan";

export interface RunSession {
  day: string;
  desc: string;
}

export interface RunWeek {
  id: string;
  weekNo: number;
  sessions: RunSession[];
}

/** Sessões padrão por semana, derivadas do plano do Davo em plan.ts. */
export function defaultRunWeeks(): { weekNo: number; sessions: RunSession[] }[] {
  return RUN_PLAN.weeks.map((w) => ({
    weekNo: w.n,
    sessions: [
      { day: "Seg", desc: w.seg },
      { day: "Qua", desc: w.qua },
      { day: "Sáb", desc: w.sab },
    ],
  }));
}

/** Normaliza o JSONB vindo do banco para RunSession[]. */
export function parseSessions(raw: unknown): RunSession[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({
      day: typeof s.day === "string" ? s.day : "",
      desc: typeof s.desc === "string" ? s.desc : "",
    }));
}
