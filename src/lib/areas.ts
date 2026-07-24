// As áreas da vida que o usuário evolui — cada uma é um "perfil" (estilo
// Netflix). Todas somam XP para o ranking global: o objetivo é ser melhor.
//
// O XP de cada área é derivado dos eventos de XP (xp_events) pela origem
// (source), então não há dado duplicado: a mesma ação que dá XP global já
// classifica a área.

import { levelForXp } from "./game/xp";

export interface Area {
  slug: string;
  name: string;
  icon: string;
  accent: string; // hex, para o cartão
  tagline: string;
  route: string;
  sources: string[]; // labels de xp_events.source que contam para a área
}

export const AREAS: Area[] = [
  {
    slug: "musculacao",
    name: "Musculação",
    icon: "🏋️",
    accent: "#f59a2d",
    tagline: "Força & volume",
    route: "/musculacao",
    sources: ["Treino concluído", "Progressão de carga", "Novo recorde"],
  },
  {
    slug: "alimentacao",
    name: "Alimentação",
    icon: "🥗",
    accent: "#a4c46b",
    tagline: "Proteína & disciplina",
    route: "/alimentacao",
    sources: ["Meta de proteína"],
  },
  {
    slug: "corrida",
    name: "Corrida",
    icon: "🏃",
    accent: "#8fb6c9",
    tagline: "Resistência & fôlego",
    route: "/corrida",
    sources: ["Corrida"],
  },
  {
    slug: "habitos",
    name: "Hábitos",
    icon: "🔥",
    accent: "#efc75e",
    tagline: "Constância & rotina",
    route: "/habitos",
    sources: ["Hábito", "Hidratação", "Meta de sono", "Mobilidade", "Missão semanal"],
  },
  {
    slug: "leitura",
    name: "Leitura",
    icon: "📚",
    accent: "#b3a4e0",
    tagline: "Mente & foco",
    route: "/leitura",
    sources: ["Leitura"],
  },
];

export function areaBySlug(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}

export function areaXp(area: Area, xpBySource: Map<string, number>): number {
  return area.sources.reduce((sum, src) => sum + (xpBySource.get(src) ?? 0), 0);
}

/** Soma o XP por origem a partir dos eventos — base do XP por área. */
export function sumXpBySource(
  events: { source: string; amount: number }[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of events) map.set(e.source, (map.get(e.source) ?? 0) + e.amount);
  return map;
}

// Patente no ranking global, pelo nível global (do XP total somando as áreas).
const RANKS = [
  { min: 0, name: "Bronze" },
  { min: 8, name: "Prata" },
  { min: 20, name: "Ouro" },
  { min: 40, name: "Platina" },
  { min: 65, name: "Diamante" },
  { min: 100, name: "Lendário" },
];

export function rankForLevel(level: number): {
  name: string;
  nextName: string | null;
  nextAtLevel: number | null;
} {
  let current = RANKS[0];
  let nextName: string | null = null;
  let nextAtLevel: number | null = null;
  for (const r of RANKS) {
    if (level >= r.min) current = r;
    else {
      nextName = r.name;
      nextAtLevel = r.min;
      break;
    }
  }
  return { name: current.name, nextName, nextAtLevel };
}

export { levelForXp };
