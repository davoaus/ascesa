"use client";

import { useState, useTransition } from "react";
import { setRunStartDate } from "./plano/actions";

export default function RunStartControl({ startDate }: { startDate: string | null }) {
  const [value, setValue] = useState(startDate ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      Início do plano:
      <input
        type="date"
        value={value}
        disabled={pending}
        onChange={(e) => {
          setValue(e.target.value);
          start(async () => {
            await setRunStartDate(e.target.value);
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          });
        }}
        className="rounded-md border border-line bg-carvao px-2 py-1 text-marfim focus:border-aco focus:outline-none"
      />
      {saved && <span className="text-ok">✓</span>}
    </label>
  );
}
