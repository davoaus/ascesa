import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import HabitTracker from "./HabitTracker";

const AREA = AREAS.find((a) => a.slug === "habitos")!;

function spNow() {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date()); // YYYY-MM-DD
  return { today: s, year: Number(s.slice(0, 4)), month: Number(s.slice(5, 7)) };
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default async function HabitosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { today, year, month } = spNow();
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
  );
  const monthStart = days[0];
  const monthEnd = days[days.length - 1];

  const [{ data: events }, { data: profile }, { data: habits }, { data: hlogs }] =
    await Promise.all([
      supabase.from("xp_events").select("source, amount"),
      supabase
        .from("profiles")
        .select("current_streak")
        .eq("id", user!.id)
        .single(),
      supabase
        .from("habits")
        .select("id, name, emoji, color")
        .eq("archived", false)
        .order("sort_order"),
      supabase
        .from("habit_logs")
        .select("habit_id, log_date")
        .gte("log_date", monthStart)
        .lte("log_date", monthEnd),
    ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));
  const initialLogs: Record<string, string[]> = {};
  for (const l of hlogs ?? []) {
    (initialLogs[l.habit_id] ??= []).push(l.log_date);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />

      <HabitTracker
        habits={habits ?? []}
        initialLogs={initialLogs}
        days={days}
        today={today}
        monthLabel={`${MONTHS[month - 1]} ${year}`}
      />
    </main>
  );
}
