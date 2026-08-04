"use client";

import { useRef, useState, useTransition } from "react";
import { exportTrainingData, importTrainingData } from "./actions";

export default function DataPortability() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function doExport() {
    setErr(null);
    setMsg(null);
    start(async () => {
      const data = await exportTrainingData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitquest-treino-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg(`Backup gerado: ${data.workouts.length} treinos.`);
    });
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(reader.result));
      } catch {
        setErr("Não consegui ler o arquivo (JSON inválido).");
        return;
      }
      start(async () => {
        const r = await importTrainingData(parsed);
        if (r?.error) setErr(r.error);
        else setMsg(`Importado: ${r?.imported ?? 0} treino(s) novo(s).`);
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-3 border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Seus dados
      </p>
      <p className="mb-3 text-xs text-muted">
        Faça um backup do seu histórico de treino ou restaure de um arquivo. O
        restauro só adiciona treinos que ainda não existem — não duplica nem
        recontabiliza XP.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={doExport}
          disabled={pending}
          className="flex-1 rounded-lg bg-gradient-to-r from-brasa to-ouro px-4 py-2.5 text-sm font-black text-carvao disabled:opacity-50"
        >
          {pending ? "..." : "⬇︎ Exportar JSON"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="flex-1 rounded-lg border border-line bg-carvao px-4 py-2.5 text-sm font-bold text-marfim hover:border-aco disabled:opacity-50"
        >
          ⬆︎ Importar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onFile}
          className="hidden"
        />
      </div>
      {err && <p className="mt-2 text-sm text-brasa">{err}</p>}
      {msg && <p className="mt-2 text-sm text-ok">{msg}</p>}
    </section>
  );
}
