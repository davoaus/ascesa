// Missões — objetivos que dão direção ao dia/semana. O progresso é calculado
// da atividade real (treinos, check-ins, corridas, leitura), então completam
// sozinhas quando você faz. Cada missão puxa para uma área.

import { AREAS } from "./areas";

export interface Mission {
  id: string;
  title: string;
  areaSlug: string;
  period: "daily" | "weekly";
  target: number;
  metric: string;
  reward: number;
}

export const MISSIONS: Mission[] = [
  // diárias
  { id: "treino-hoje", title: "Treinar hoje", areaSlug: "musculacao", period: "daily", target: 1, metric: "workoutToday", reward: 15 },
  { id: "proteina-hoje", title: "Bater a proteína", areaSlug: "alimentacao", period: "daily", target: 1, metric: "proteinToday", reward: 15 },
  { id: "habito-hoje", title: "Marcar um hábito", areaSlug: "habitos", period: "daily", target: 1, metric: "habitToday", reward: 15 },
  { id: "ler-hoje", title: "Ler um pouco", areaSlug: "leitura", period: "daily", target: 1, metric: "readToday", reward: 15 },
  // semanais
  { id: "treino-5", title: "Treinar 5× na semana", areaSlug: "musculacao", period: "weekly", target: 5, metric: "workoutsWeek", reward: 60 },
  { id: "corrida-3", title: "Correr 3× na semana", areaSlug: "corrida", period: "weekly", target: 3, metric: "runsWeek", reward: 60 },
  { id: "habitos-5", title: "Hábitos em 5 dias", areaSlug: "habitos", period: "weekly", target: 5, metric: "habitDaysWeek", reward: 60 },
  { id: "ler-4", title: "Ler em 4 dias", areaSlug: "leitura", period: "weekly", target: 4, metric: "readDaysWeek", reward: 60 },
];

export function accentFor(slug: string): string {
  return AREAS.find((a) => a.slug === slug)?.accent ?? "#f59a2d";
}

export type Metrics = Record<string, number>;

export interface MissionState extends Mission {
  value: number;
  done: boolean;
  claimed: boolean;
  accent: string;
  periodKey: string;
}

export function missionState(
  m: Mission,
  metrics: Metrics,
  claimedKeys: Set<string>,
  dailyKey: string,
  weeklyKey: string,
): MissionState {
  const value = metrics[m.metric] ?? 0;
  const periodKey = m.period === "daily" ? dailyKey : weeklyKey;
  return {
    ...m,
    value: Math.min(value, m.target),
    done: value >= m.target,
    claimed: claimedKeys.has(`${m.id}:${periodKey}`),
    accent: accentFor(m.areaSlug),
    periodKey,
  };
}
