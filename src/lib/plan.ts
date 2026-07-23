// Plano do Davo (rotina, corrida e nutrição), a partir do dados.json que ele
// trouxe. Referência exibida no app; a musculação em si está no banco (programs).
// Quando virar editável por usuário, isto migra para tabelas.

export const WEEK_PLAN: {
  day: string;
  focus: string;
  run: string | null;
  rest?: boolean;
}[] = [
  { day: "Segunda", focus: "Peito + Tríceps", run: "Intervalado" },
  { day: "Terça", focus: "Costas + Bíceps", run: null },
  { day: "Quarta", focus: "Ombros + Abdômen", run: "Tempo Run" },
  { day: "Quinta", focus: "Perna (completo)", run: null },
  { day: "Sexta", focus: "Bíceps + Tríceps", run: null },
  { day: "Sábado", focus: "Descanso da academia", run: "Longão", rest: true },
  { day: "Domingo", focus: "Descanso total", run: null, rest: true },
];

export const REST_REFERENCE =
  "90–150s compostos · 60–75s intermediários · 45–60s isoladores/abdômen";

export const RUN_PLAN = {
  days: ["Segunda · Intervalado", "Quarta · Tempo Run", "Sábado · Longão"],
  weeks: [
    { n: 1, seg: "8×400m a 5:30/km (1:30 trote)", qua: "20 min contínuo a 6:00/km", sab: "6 km leve a 6:30/km" },
    { n: 2, seg: "6×600m a 5:30/km (2:00 trote)", qua: "3 km a 5:50/km + 5 min trote + 1 km forte", sab: "7 km leve a 6:30/km" },
    { n: 3, seg: "5×800m a 5:35/km (2:00 trote)", qua: "25 min contínuo a 5:55/km", sab: "8 km leve a 6:25/km" },
    { n: 4, seg: "3×1km a 5:40/km (3:00 trote)", qua: "15 min leve a 6:30/km", sab: "Teste de 3 km" },
  ],
};

export const NUTRITION = {
  objetivo: "Recomposição",
  metas: { kcal: "2500–2700", proteina: "170 g", carbo: "250–300 g", gordura: "70–80 g" },
  carboPorDia: [
    { day: "Seg", carbo: "mod-alto" },
    { day: "Ter", carbo: "moderado" },
    { day: "Qua", carbo: "moderado" },
    { day: "Qui", carbo: "alto" },
    { day: "Sex", carbo: "moderado" },
    { day: "Sáb", carbo: "alto" },
    { day: "Dom", carbo: "baixo" },
  ],
  refeicoes: [
    {
      nome: "Café da manhã",
      hora: "07:30",
      proteina: "35 g",
      opcoes: [
        "3–4 ovos mexidos + 2 fatias de pão integral + 1 fruta",
        "40 g de aveia + 1 scoop de whey + banana + canela",
        "Tapioca com ovo e queijo + café",
        "Iogurte grego + granola + fruta + castanhas",
      ],
    },
    {
      nome: "Almoço",
      hora: "12:30",
      proteina: "45 g",
      opcoes: [
        "Frango grelhado + arroz + feijão + salada",
        "Patinho/carne magra + batata + legumes refogados",
        "Tilápia/peixe + arroz + brócolis + azeite",
        "Estrogonofe fit de frango + arroz + salada",
        "Escondidinho de frango com batata-doce",
      ],
    },
    {
      nome: "Pós-treino (Whey)",
      hora: "após treinar",
      proteina: "40 g",
      opcoes: [
        "1–2 scoops de whey + 1 banana",
        "Whey + 1 tapioca simples",
        "Whey + pão integral com geleia",
        "Vitamina: whey + leite + aveia + fruta",
      ],
    },
    {
      nome: "Lanche da noite",
      hora: "20:30",
      proteina: "38 g",
      opcoes: [
        "Sanduíche natural: pão integral + frango/atum + queijo + folhas",
        "Iogurte grego + 1 scoop de whey + fruta",
        "Ovos mexidos (3–4) + 1 fatia de pão + tomate",
        "Crepioca (2 ovos + tapioca) recheada com frango/queijo",
        "Cottage ou requeijão + pão integral + peito de peru",
        "Shake: whey + leite + banana + pasta de amendoim",
      ],
    },
  ],
  refeicaoLivre:
    "1× por semana (fim de semana): troque UMA refeição pela que quiser, sem pular as outras nem exagerar.",
  notas:
    "Proteína e as 4 refeições iguais todo dia. Só o carbo varia (mais na quinta e sábado, menos no domingo). Whey = praticidade pós-treino ou pra fechar a proteína.",
};
