// Sanidade do motor de XP: confirma que o código reproduz as âncoras da spec e
// a calibração da planilha. Roda com `npm run verify:xp` (sem dependências).

const A = 332.85, B = 1.3672, C = 0.1613, D = 1.5129;
const XP_PER_1000 = 16, EVO = 25, LIFESTYLE_DAY = 60, MISSION = 100, TREINOS = 5;
const VOL_START = 3500, VOL_ELITE = 14000;

const cumXp = (n) => (n <= 0 ? 0 : Math.round(A * Math.pow(n, B)));
const minStreak = (n) => (n <= 0 ? 0 : Math.round(C * Math.pow(n, D)));
const vol = (n) => Math.round(VOL_START + ((VOL_ELITE - VOL_START) * (n - 1)) / 99);
const xpTreino = (n) => Math.round((vol(n) / 1000) * XP_PER_1000);

// XP/dia coerente com a planilha: (treinos*xpTreino + treinos*evo + 7*lifestyle + missão)/7
const dailyXp = (n) =>
  Math.round((TREINOS * xpTreino(n) + TREINOS * EVO + 7 * LIFESTYLE_DAY + MISSION) / 7);

let fail = 0;
function check(label, got, want, tol = 1) {
  const ok = Math.abs(got - want) <= tol;
  if (!ok) fail++;
  console.log(`  ${ok ? "OK " : "XX "} ${label}: ${got} (esperado ~${want})`);
}

console.log("Âncoras da spec:");
check("XP L20", cumXp(20), 20000, 5);
check("XP L50", cumXp(50), 70000, 5);
check("Ofensiva L20", minStreak(20), 15);
check("Ofensiva L50", minStreak(50), 60);

console.log("Calibração (tempo até L100 ≈ 2,5 anos):");
let days = 0;
for (let n = 1; n <= 100; n++) {
  const delta = n > 1 ? cumXp(n) - cumXp(n - 1) : cumXp(1);
  days += delta / dailyXp(n);
}
check("meses até L100", Math.round(days / 30.4), 30, 2);
check("XP/dia iniciante (L1)", dailyXp(1), 132, 5);
check("XP/dia elite (L100)", dailyXp(100), 252, 5);

console.log(fail === 0 ? "\n✅ Motor de XP de acordo com a planilha." : `\n❌ ${fail} divergência(s).`);
process.exit(fail === 0 ? 0 : 1);
