"use client";

import { useState, useTransition } from "react";
import { toggleHabit } from "../habitos/actions";

export interface TodayHabit {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  doneToday: boolean;
}

export default function TodayHabits({
  habits,
  today,
}: {
  habits: TodayHabit[];
  today: string;
}) {
  const [done, setDone] = useState<Set<string>>(
    () => new Set(habits.filter((h) => h.doneToday).map((h) => h.id)),
  );
  const [pending, start] = useTransition();

  function toggle(id: string) {
    setDone((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
    start(async () => {
      await toggleHabit({ habitId: id, date: today });
    });
  }

  if (habits.length === 0) return null;
  const doneCount = habits.filter((h) => done.has(h.id)).length;

  return (
    <section className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
          Hábitos de hoje
        </p>
        <p className="text-xs font-bold tabular-nums text-brasa">
          {doneCount}/{habits.length}
        </p>
      </div>
      <ul className="flex flex-col gap-1.5">
        {habits.map((h) => {
          const isDone = done.has(h.id);
          const color = h.color ?? "#f59a2d";
          return (
            <li key={h.id}>
              <button
                type="button"
                disabled={pending}
                onClick={() => toggle(h.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                  isDone ? "border-line bg-carvao" : "border-line bg-carvao hover:border-muted"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full border text-xs"
                    style={
                      isDone
                        ? { backgroundColor: color, borderColor: color, color: "#131009" }
                        : { borderColor: "#6e6552", color: "transparent" }
                    }
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className={isDone ? "text-muted line-through" : "text-marfim"}>
                    {h.emoji} {h.name}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
