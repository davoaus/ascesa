# ASCESA

O RPG onde sua evolução física real é o progresso. **O boss final é você.**

App de fitness gamificado: o usuário não registra treinos, ele constrói um
personagem que representa a melhor versão de si mesmo. O XP mede **trabalho
real** (volume levantado + progressão), não presença — chegar ao nível 100 é tão
difícil quanto conquistar um shape excelente (~2,5 anos).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + RLS) via `@supabase/ssr`
- PWA mobile-first, registro **local-first** (planejado — academia tem sinal ruim)

## Rodando

```bash
npm install
cp .env.local.example .env.local   # preencha com o projeto Supabase
npm run dev                        # http://localhost:3000
npm run verify:xp                  # confere o motor de XP vs. a planilha
```

A home renderiza com dados de demonstração passando pelo motor de XP real, então
funciona antes de configurar o Supabase.

## Estrutura

```
src/
  app/                 # rotas (App Router), layout, manifest PWA, home
  lib/
    game/
      config.ts        # NÚMEROS DO JOGO — mesmos "levers" da planilha de balanceamento
      xp.ts            # motor de XP, níveis, ofensiva, mundos, bosses
    supabase/          # clientes browser/server
supabase/
  migrations/          # schema (0001) + seed de exercícios (0002)
scripts/
  verify-xp.mjs        # sanidade: código de acordo com a planilha
```

## Fórmulas (fonte única em `src/lib/game/config.ts`)

- **XP acumulado até o nível N** = `a × N^b` (a=332,85, b=1,3672) → L20=20k, L50=70k.
- **Ofensiva mínima no nível N** = `c × N^d` (c=0,1613, d=1,5129) → L20=15, L50=60 dias.
- **XP do treino** = `volume(kg) ÷ 1000 × 16` — quanto mais você levanta, mais ganha.
- **Duplo requisito:** subir de nível exige XP suficiente **E** ofensiva mínima.

Balanceamento completo (editável) na planilha
`Obsidian Vault/ASCESA/ASCESA - Balanceamento XP e Níveis.xlsx`. Ao rebalancear,
mude a planilha **e** `config.ts` juntos.
