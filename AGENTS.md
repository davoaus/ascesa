# ASCESA — notas para agentes

App de fitness gamificado (RPG). Filosofia central: **o XP mede trabalho real,
não presença; o maior adversário do usuário é ele mesmo ("o boss final é você").**

## Regras que não podem quebrar

- **`src/lib/game/config.ts` é a fonte única dos números do jogo.** São os mesmos
  "levers" da planilha de balanceamento (`ASCESA - Balanceamento XP e Níveis.xlsx`).
  Ao mudar qualquer número, atualize a planilha junto e rode `npm run verify:xp`.
- **XP = volume + evolução.** O XP do treino vem do volume levantado (carga × reps
  × séries); progressão e PR dão bônus. Nunca dar XP fixo só por "aparecer".
- **Duplo requisito de nível:** XP suficiente **E** ofensiva mínima. É a trava
  anti-atalho — não remover.
- **RLS em tudo:** cada tabela de usuário filtra por `auth.uid()`. Toda tabela nova
  com dados de usuário precisa de RLS.

## Identidade

- Nome **ASCESA** (italiano: ascensão). Paleta brasa/carvão (ver `globals.css`).
- Tagline de produto: "Suba de nível na vida real." · Manifesto: "O boss final é você."
- Fonte: Archivo (peso 900 para números e títulos).

## Convenções

- Segue o padrão do fk-app (POUPLAY): Next 16, App Router, Supabase SSR, Tailwind v4.
- Migrations numeradas em `supabase/migrations/`.
- Textos de UI em português (pt-BR).
