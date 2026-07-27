"use client";

import { useState, useTransition } from "react";
import {
  addHabit,
  toggleHabit,
  deleteHabit,
  moveHabit,
  setHabitStartDate,
} from "./actions";

export interface Habit {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  startDate?: string | null;
}

export default function HabitTracker({
  habits,
  initialLogs,
  days,
  today,
  monthLabel,
}: {
  habits: Habit[];
  initialLogs: Record<string, string[]>;
  days: string[]; // "YYYY-MM-DD" de cada dia do mês
  today: string;
  monthLabel: string;
}) {
  const [logs, setLogs] = useState<Record<string, Set<string>>>(() => {
    const m: Record<string, Set<string>> = {};
    for (const h of habits) m[h.id] = new Set(initialLogs[h.id] ?? []);
    return m;
  });
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [pending, start] = useTransition();

  function setFor(habitId: string): Set<string> {
    return logs[habitId] ?? new Set();
  }

  function toggle(habitId: string, date: string) {
    setLogs((prev) => {
      const s = new Set(prev[habitId] ?? []);
      if (s.has(date)) s.delete(date);
      else s.add(date);
      return { ...prev, [habitId]: s };
    });
    start(async () => {
      await toggleHabit({ habitId, date });
    });
  }

  function add() {
    const n = name.trim();
    if (!n) return;
    start(async () => {
      await addHabit({ name: n, emoji });
      setName("");
      setEmoji("");
    });
  }

  // Desempenho (dias decorridos do mês até hoje).
  const elapsedDays = days.filter((d) => d <= today);
  const elapsed = Math.max(1, elapsedDays.length);
  const perHabit = habits.map((h) => {
    const count = setFor(h.id).size;
    return { ...h, count, rate: count / elapsed };
  });
  const perDay = elapsedDays.map((d) => ({
    d,
    frac: habits.length
      ? habits.filter((h) => setFor(h.id).has(d)).length / habits.length
      : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          {monthLabel}
        </p>

        {habits.length === 0 ? (
          <p className="text-sm text-muted">
            Adicione seu primeiro hábito abaixo e comece a marcar os dias.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* cabeçalho: dias do mês */}
              <div className="flex">
                <div className="sticky left-0 z-10 w-28 shrink-0 bg-carvao-2" />
                {days.map((d) => {
                  const num = Number(d.slice(8));
                  const isToday = d === today;
                  return (
                    <div
                      key={d}
                      className={`w-7 shrink-0 text-center text-[10px] ${
                        isToday ? "font-black text-brasa" : "text-muted"
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>

              {/* linhas: hábitos */}
              {habits.map((h) => {
                const set = setFor(h.id);
                const color = h.color ?? "#f59a2d";
                return (
                  <div key={h.id} className="flex items-center border-t border-line/60">
                    <div className="sticky left-0 z-10 flex w-28 shrink-0 items-center gap-1.5 bg-carvao-2 py-1.5 pr-2">
                      <span>{h.emoji ?? "✅"}</span>
                      <span className="truncate text-xs text-marfim">{h.name}</span>
                      <span className="ml-auto text-[10px] tabular-nums text-muted">
                        {set.size}
                      </span>
                    </div>
                    {days.map((d) => {
                      const done = set.has(d);
                      const isToday = d === today;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggle(h.id, d)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center"
                          aria-label={`${h.name} ${d}`}
                        >
                          <span
                            className={`h-4 w-4 rounded-full border ${
                              isToday && !done ? "border-brasa" : "border-line"
                            }`}
                            style={done ? { backgroundColor: color, borderColor: color } : undefined}
                          />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* desempenho / padrões */}
      {habits.length > 0 && (
        <section className="rounded-2xl border border-line bg-carvao-2 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
            Desempenho no mês
          </p>

          {/* taxa por hábito */}
          <ul className="flex flex-col gap-2">
            {perHabit.map((h) => {
              const color = h.color ?? "#f59a2d";
              const pct = Math.round(h.rate * 100);
              return (
                <li key={h.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-marfim">
                      {h.emoji} {h.name}
                    </span>
                    <span className="tabular-nums text-muted">
                      {h.count}/{elapsed} · {pct}%
                    </span>
                  </div>
                  <span className="block h-2 overflow-hidden rounded-full bg-carvao-3">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>

          {/* constância dia a dia */}
          <p className="mb-2 mt-4 text-xs font-semibold text-muted">
            Constância · % de hábitos por dia
          </p>
          <div className="flex h-16 items-end gap-[3px] overflow-x-auto">
            {perDay.map((p) => {
              const isToday = p.d === today;
              return (
                <span
                  key={p.d}
                  title={`Dia ${Number(p.d.slice(8))}: ${Math.round(p.frac * 100)}%`}
                  className="flex h-full w-2 shrink-0 items-end"
                >
                  <span
                    className="w-full rounded-sm"
                    style={{
                      height: `${Math.max(6, p.frac * 100)}%`,
                      backgroundColor: isToday ? "#f59a2d" : "#efc75e",
                      opacity: p.frac === 0 ? 0.18 : isToday ? 1 : 0.6,
                    }}
                  />
                </span>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Barras mais cheias e seguidas = padrão se estabelecendo. Furos mostram
            onde a rotina escapa.
          </p>
        </section>
      )}

      {/* adicionar hábito */}
      <section className="rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
          Novo hábito
        </p>
        <div className="grid grid-cols-[3rem_1fr] gap-2">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="🙂"
            maxLength={2}
            className="rounded-lg border border-line bg-carvao px-2 py-2.5 text-center focus:border-brasa focus:outline-none"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Meditar, Estudar, Sem açúcar…"
            className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={pending || !name.trim()}
          className="mt-2 w-full rounded-lg bg-gradient-to-r from-brasa to-ouro px-3 py-2.5 text-sm font-black text-carvao disabled:opacity-50"
        >
          Adicionar hábito
        </button>
      </section>

      {habits.length > 0 && (
        <details className="rounded-2xl border border-line bg-carvao-2 p-4">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-muted">
            Gerenciar hábitos
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {habits.map((h, i) => (
              <li
                key={h.id}
                className="rounded-lg border border-line bg-carvao px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-marfim">
                    {h.emoji} {h.name}
                  </span>
                  <span className="flex items-center gap-2 text-muted">
                    <button
                      type="button"
                      aria-label="Mover para cima"
                      disabled={i === 0}
                      onClick={() => start(async () => void moveHabit(h.id, "up"))}
                      className="disabled:opacity-30 hover:text-marfim"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Mover para baixo"
                      disabled={i === habits.length - 1}
                      onClick={() => start(async () => void moveHabit(h.id, "down"))}
                      className="disabled:opacity-30 hover:text-marfim"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Apagar "${h.name}" e todas as marcações?`))
                          start(async () => void deleteHabit(h.id));
                      }}
                      className="text-xs hover:text-brasa-deep"
                    >
                      apagar
                    </button>
                  </span>
                </div>
                <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                  Início:
                  <input
                    type="date"
                    defaultValue={h.startDate ?? ""}
                    onChange={(e) =>
                      start(async () => void setHabitStartDate(h.id, e.target.value))
                    }
                    className="rounded-md border border-line bg-carvao-2 px-2 py-1 text-marfim focus:border-brasa focus:outline-none"
                  />
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
