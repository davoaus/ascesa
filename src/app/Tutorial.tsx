"use client";

import { useState, useTransition } from "react";
import { markOnboarded } from "./onboard";

const STEPS = [
  {
    icon: "🔥",
    title: "Bem-vindo ao FitQuest",
    body:
      "Uma plataforma para você evoluir em várias áreas da vida — e virar a melhor versão de si mesmo. O seu maior adversário é você mesmo.",
  },
  {
    icon: "🎬",
    title: "Áreas são seus perfis",
    body:
      "Musculação, Alimentação, Corrida, Hábitos, Leitura, Sono, Finanças… Escolha uma área na tela inicial e evolua nela. Cada uma tem seu nível.",
  },
  {
    icon: "🏆",
    title: "Tudo soma no ranking",
    body:
      "Cada ação registrada dá XP para a área e para o seu ranking global (patente Bronze → Lendário). O objetivo é ser melhor, em tudo.",
  },
  {
    icon: "✅",
    title: "Registre e marque",
    body:
      "Anote o treino, marque os hábitos no calendário, registre corrida, leitura, sono, economia. Manter os dias seguidos protege sua ofensiva 🔥.",
  },
  {
    icon: "🎯",
    title: "Missões e personalização",
    body:
      "As missões mostram o que fazer hoje e dão recompensa. E dá para personalizar tudo: seu programa de treino, seus hábitos e seus dados no perfil.",
  },
];

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [closed, setClosed] = useState(false);
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  function finish() {
    setClosed(true);
    start(async () => {
      await markOnboarded();
    });
  }

  if (closed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-carvao/80 backdrop-blur-sm sm:items-center">
      <div className="m-4 w-full max-w-sm rounded-2xl border border-line bg-carvao-2 p-6">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brasa/10 text-4xl">
          {s.icon}
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-brasa">
          Passo {step + 1} de {STEPS.length}
        </p>
        <h2 className="mt-1 text-2xl font-black text-marfim">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            disabled={pending}
            className="text-xs text-muted hover:text-marfim"
          >
            Pular
          </button>
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-4 bg-brasa" : "w-1.5 bg-line"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => (last ? finish() : setStep((v) => v + 1))}
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-brasa to-ouro px-4 py-2 text-sm font-black text-carvao disabled:opacity-60"
          >
            {last ? "Começar" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
