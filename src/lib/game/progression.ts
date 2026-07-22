// Ofensiva e atributos do personagem — a parte da progressão que não é XP puro.

import { GAME_CONFIG } from "./config";

export interface StreakState {
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  currentStreak: number;
}

/** Dias inteiros entre duas datas "YYYY-MM-DD" (b - a). */
export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Resolve a ofensiva ao concluir um dia. Regra: dias de descanso protegidos
 * (2/semana por padrão) absorvem folgas curtas sem quebrar a sequência; uma
 * folga maior que isso zera. É o que mantém a constância como o verdadeiro
 * adversário — não dá pra sumir e voltar como se nada tivesse acontecido.
 */
export function resolveStreak(
  state: StreakState,
  today: string,
): { streak: number; broke: boolean; alreadyCountedToday: boolean } {
  const { lastCompletedDate: last, currentStreak } = state;

  if (last === today)
    return { streak: currentStreak, broke: false, alreadyCountedToday: true };
  if (!last) return { streak: 1, broke: false, alreadyCountedToday: false };

  const gap = daysBetween(last, today);
  const tolerated = 1 + GAME_CONFIG.streak.protectedRestDaysPerWeek;
  if (gap <= tolerated)
    return { streak: currentStreak + 1, broke: false, alreadyCountedToday: false };
  return { streak: 1, broke: true, alreadyCountedToday: false };
}

export type Attributes = {
  forca: number;
  resistencia: number;
  disciplina: number;
  mobilidade: number;
  saude: number;
  velocidade: number;
};

export interface AttributeGainInput {
  volumeKg: number;
  streak: number;
  sleepHit?: boolean;
  mobilityHit?: boolean;
  isCardio?: boolean;
}

/**
 * Ganho de atributos de um treino. Cada atividade alimenta atributos
 * diferentes, então dois usuários com o mesmo nível podem ter personagens
 * bem distintos (o levantador forte vs. o corredor resistente).
 */
export function attributeGains(input: AttributeGainInput): Partial<Attributes> {
  const gains: Partial<Attributes> = {};
  const forca = Math.round(input.volumeKg / 500); // ~2 por tonelada movida
  if (forca > 0) gains.forca = forca;
  if (input.isCardio) gains.resistencia = 2;
  gains.disciplina = input.streak >= 7 ? 2 : 1; // constância vira disciplina
  if (input.mobilityHit) gains.mobilidade = 1;
  if (input.sleepHit) gains.saude = 1;
  return gains;
}
