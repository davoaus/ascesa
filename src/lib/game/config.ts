// Fonte única dos números do jogo. Estes valores são os mesmos "levers" da
// planilha `ASCESA - Balanceamento XP e Níveis.xlsx` (aba Parâmetros). Ao
// rebalancear, mude aqui E na planilha para que continuem de acordo.

export const GAME_CONFIG = {
  // XP acumulado até o nível N = a × N^b. Ajustado para L20=20.000, L50=70.000.
  xpCurve: { a: 332.85, b: 1.3672 },

  // Ofensiva mínima no nível N = c × N^d. Ajustado para L20=15, L50=60 dias.
  // É a trava anti-atalho: subir de nível exige XP suficiente E ofensiva mínima.
  streakCurve: { c: 0.1613, d: 1.5129 },

  // XP do treino é proporcional ao VOLUME (tonelagem = séries × reps × carga).
  // Quanto mais forte a pessoa fica, mais volume move, mais XP ganha.
  workout: {
    xpPer1000Kg: 16,
    // Progressão de carga + reps extras + PR, média por sessão.
    evolutionBonusPerSession: 25,
  },

  // Estilo de vida: XP menor e constante. A soma é o "XP por dia" da planilha (60).
  lifestyle: {
    protein: 20,
    water: 15,
    sleep: 20,
    mobility: 5,
    weeklyMissionXp: 100,
  },

  streak: {
    protectedRestDaysPerWeek: 2,
  },

  maxLevel: 100,

  // Cada mundo vai até maxLevel (inclusive).
  worlds: [
    { id: 1, name: "Iniciante", maxLevel: 20 },
    { id: 2, name: "Construção", maxLevel: 40 },
    { id: 3, name: "Disciplina", maxLevel: 60 },
    { id: 4, name: "Elite", maxLevel: 80 },
    { id: 5, name: "Lendário", maxLevel: 100 },
  ],

  // Desafios físicos obrigatórios a cada 10 níveis.
  bosses: {
    10: "Correr 5 km",
    20: "10 barras fixas",
    30: "Supinar o peso corporal",
    40: "Meia maratona (21 km)",
    50: "Meta de % de gordura",
    60: "100 kg no agachamento",
    70: "Corrida de 15 km",
    80: "15 barras fixas",
    90: "Supino 1,2× o peso corporal",
    100: "Maratona (42 km)",
  } as Record<number, string>,
} as const;

// XP total de estilo de vida em um dia com todas as metas batidas.
export const LIFESTYLE_DAILY_XP =
  GAME_CONFIG.lifestyle.protein +
  GAME_CONFIG.lifestyle.water +
  GAME_CONFIG.lifestyle.sleep +
  GAME_CONFIG.lifestyle.mobility;
