// Motor de XP e níveis do ASCESA.
//
// Filosofia: o XP mede TRABALHO REAL, não presença. O XP de um treino é
// proporcional ao volume levantado; progressão e recordes dão bônus de
// evolução. Subir de nível exige XP suficiente E ofensiva mínima — seu maior
// adversário é você mesmo.

import { GAME_CONFIG } from "./config";

const { xpCurve, streakCurve, workout, lifestyle, maxLevel, worlds, bosses } =
  GAME_CONFIG;

/** XP acumulado necessário para ATINGIR o nível dado (nível 0 = 0 XP). */
export function cumulativeXpForLevel(level: number): number {
  if (level <= 0) return 0;
  const capped = Math.min(level, maxLevel);
  return Math.round(xpCurve.a * Math.pow(capped, xpCurve.b));
}

/** Nível bruto que um total de XP concede (antes da trava de ofensiva). */
export function levelForXp(xpTotal: number): number {
  if (xpTotal <= 0) return 0;
  // Curva monotônica: estimativa analítica + ajuste fino robusto.
  let level = Math.floor(Math.pow(xpTotal / xpCurve.a, 1 / xpCurve.b));
  level = Math.max(0, Math.min(level, maxLevel));
  while (level < maxLevel && cumulativeXpForLevel(level + 1) <= xpTotal) level++;
  while (level > 0 && cumulativeXpForLevel(level) > xpTotal) level--;
  return level;
}

/** Ofensiva mínima (em dias) exigida para o nível dado. */
export function minStreakForLevel(level: number): number {
  if (level <= 0) return 0;
  return Math.round(streakCurve.c * Math.pow(level, streakCurve.d));
}

/**
 * Nível efetivo: o duplo requisito. É o maior nível cujo XP a pessoa já tem E
 * cuja ofensiva mínima ela já cumpre. É isto que impede farmar nível sem
 * constância.
 */
export function effectiveLevel(xpTotal: number, streakDays: number): number {
  let level = levelForXp(xpTotal);
  while (level > 0 && minStreakForLevel(level) > streakDays) level--;
  return level;
}

/** Progresso dentro do nível atual, para a barra de XP. */
export function levelProgress(xpTotal: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  fraction: number;
} {
  const level = levelForXp(xpTotal);
  const floor = cumulativeXpForLevel(level);
  const ceil = cumulativeXpForLevel(Math.min(level + 1, maxLevel));
  const span = Math.max(1, ceil - floor);
  const into = xpTotal - floor;
  return {
    level,
    xpIntoLevel: into,
    xpForNextLevel: ceil - floor,
    fraction: level >= maxLevel ? 1 : Math.min(1, into / span),
  };
}

export function worldForLevel(level: number): { id: number; name: string } {
  const w = worlds.find((world) => level <= world.maxLevel) ?? worlds[worlds.length - 1];
  return { id: w.id, name: w.name };
}

/** Próximo boss (múltiplo de 10) a partir do nível atual, com o desafio. */
export function nextBoss(
  level: number,
): { level: number; challenge: string } | null {
  const target = (Math.floor(level / 10) + 1) * 10;
  if (target > maxLevel) return null;
  return { level: target, challenge: bosses[target] ?? "" };
}

export function bossForLevel(level: number): string | null {
  return bosses[level] ?? null;
}

// ---------- XP ganho ----------

/** Volume de uma série = carga × repetições. */
export function setVolume(weightKg: number, reps: number): number {
  return weightKg * reps;
}

/** XP do treino a partir do volume total movido. */
export function xpFromVolume(volumeKg: number): number {
  return Math.round((volumeKg / 1000) * workout.xpPer1000Kg);
}

export interface WorkoutXpInput {
  volumeKg: number;
  hadProgression?: boolean;
  newPr?: boolean;
  proteinHit?: boolean;
  waterHit?: boolean;
  sleepHit?: boolean;
  mobilityHit?: boolean;
  weeklyMissionComplete?: boolean;
}

export interface XpLine {
  label: string;
  xp: number;
}

/**
 * Decompõe o XP de um treino em linhas — é exatamente isto que a tela de
 * resumo pós-treino ("o boss final é você") mostra ao usuário.
 */
export function computeWorkoutXp(input: WorkoutXpInput): {
  lines: XpLine[];
  total: number;
} {
  const lines: XpLine[] = [];
  lines.push({ label: "Treino concluído", xp: xpFromVolume(input.volumeKg) });
  if (input.hadProgression)
    lines.push({ label: "Progressão de carga", xp: workout.evolutionBonusPerSession });
  if (input.newPr) lines.push({ label: "Novo recorde", xp: 80 });
  if (input.proteinHit) lines.push({ label: "Meta de proteína", xp: lifestyle.protein });
  if (input.waterHit) lines.push({ label: "Hidratação", xp: lifestyle.water });
  if (input.sleepHit) lines.push({ label: "Meta de sono", xp: lifestyle.sleep });
  if (input.mobilityHit) lines.push({ label: "Mobilidade", xp: lifestyle.mobility });
  if (input.weeklyMissionComplete)
    lines.push({ label: "Missão semanal", xp: lifestyle.weeklyMissionXp });

  const total = lines.reduce((sum, line) => sum + line.xp, 0);
  return { lines, total };
}
