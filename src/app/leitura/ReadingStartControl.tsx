"use client";

import { useState, useTransition } from "react";
import { setReadingStartDate } from "./actions";

export default function ReadingStartControl({
  startDate,
  today,
}: {
  startDate: string | null;
  today: string;
}) {
  const [value, setValue] = useState(startDate ?? "");
  const [pending, start] = useTransition();

  const days =
    value && value <= today
      ? Math.floor(
          (new Date(today + "T12:00:00Z").getTime() -
            new Date(value + "T12:00:00Z").getTime()) /
            86400000,
        ) + 1
      : null;

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <p className="mb-2 border-l-[3px] border-[#b3a4e0] pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Minha leitura
      </p>
      <label className="flex items-center justify-between gap-2 text-sm text-muted">
        Lendo desde
        <input
          type="date"
          value={value}
          disabled={pending}
          onChange={(e) => {
            setValue(e.target.value);
            start(async () => {
              await setReadingStartDate(e.target.value);
            });
          }}
          className="rounded-md border border-line bg-carvao px-2 py-1 text-marfim focus:border-[#b3a4e0] focus:outline-none"
        />
      </label>
      {days != null && (
        <p className="mt-2 text-sm text-marfim">
          <span className="font-black text-ouro tabular-nums">{days}</span>{" "}
          {days === 1 ? "dia" : "dias"} construindo o hábito de ler. 📚
        </p>
      )}
    </section>
  );
}
