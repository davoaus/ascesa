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
}

export const MISSIONS: Mission[] = [
  // diárias
  { id: "treino-hoje", title: "Treinar hoje", areaSlug: "musculacao", period: "daily", target: 1, metric: "workoutToday" },
  { id: "proteina-hoje", title: "Bater a proteína", areaSlug: "alimentacao", period: "daily", target: 1, metric: "proteinToday" },
  { id: "agua-hoje", title: "Beber água", areaSlug: "habitos", period: "daily", target: 1, metric: "waterToday" },
  { id: "ler-hoje", title: "Ler um pouco", areaSlug: "leitura", period: "daily", target: 1, metric: "readToday" },
  // semanais
  { id: "treino-5", title: "Treinar 5× na semana", areaSlug: "musculacao", period: "weekly", target: 5, metric: "workoutsWeek" },
  { id: "corrida-3", title: "Correr 3× na semana", areaSlug: "corrida", period: "weekly", target: 3, metric: "runsWeek" },
  { id: "habitos-5", title: "Hábitos em 5 dias", areaSlug: "habitos", period: "weekly", target: 5, metric: "habitDaysWeek" },
  { id: "ler-4", title: "Ler em 4 dias", areaSlug: "leitura", period: "weekly", target: 4, metric: "readDaysWeek" },
];

export function accentFor(slug: string): string {
  return AREAS.find((a) => a.slug === slug)?.accent ?? "#f59a2d";
}

export type Metrics = Record<string, number>;

export interface MissionState extends Mission {
  value: number;
  done: boolean;
  accent: string;
}

export function missionState(m: Mission, metrics: Metrics): MissionState {
  const value = metrics[m.metric] ?? 0;
  return {
    ...m,
    value: Math.min(value, m.target),
    done: value >= m.target,
    accent: accentFor(m.areaSlug),
  };
}
