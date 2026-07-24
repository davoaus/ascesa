import type { SupabaseClient } from "@supabase/supabase-js";
import { MISSIONS, missionState, type Metrics, type MissionState } from "@/lib/missions";

function spDate(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date(d));
}

function mondayOf(dateStr: string): string {
  const u = new Date(dateStr + "T12:00:00Z");
  u.setUTCDate(u.getUTCDate() - ((u.getUTCDay() + 6) % 7));
  return u.toISOString().slice(0, 10);
}

export interface MissionBundle {
  daily: MissionState[];
  weekly: MissionState[];
  dailyDone: number;
  dailyTotal: number;
  weeklyDone: number;
  weeklyTotal: number;
}

/** Calcula o progresso de todas as missões a partir da atividade real. */
export async function loadMissions(
  supabase: SupabaseClient,
  userId: string,
): Promise<MissionBundle> {
  const today = spDate(new Date());
  const weekStart = mondayOf(today);

  const [{ data: workouts }, { data: checkins }, { data: events }, { data: habitLogs }] =
    await Promise.all([
      supabase
        .from("workouts")
        .select("performed_at")
        .order("performed_at", { ascending: false })
        .limit(60),
      supabase
        .from("daily_checkins")
        .select("checkin_date, protein_hit")
        .gte("checkin_date", weekStart),
      supabase
        .from("xp_events")
        .select("source, occurred_at")
        .in("source", ["Corrida", "Leitura"])
        .order("occurred_at", { ascending: false })
        .limit(200),
      supabase
        .from("habit_logs")
        .select("log_date")
        .gte("log_date", weekStart),
    ]);

  const workoutDates = (workouts ?? []).map((w) => spDate(w.performed_at));
  const runDates = (events ?? [])
    .filter((e) => e.source === "Corrida")
    .map((e) => spDate(e.occurred_at));
  const readDates = (events ?? [])
    .filter((e) => e.source === "Leitura")
    .map((e) => spDate(e.occurred_at));
  const todayCheckin = (checkins ?? []).find((c) => c.checkin_date === today);
  const habitDates = (habitLogs ?? []).map((h) => h.log_date);

  const inWeek = (d: string) => d >= weekStart;

  const metrics: Metrics = {
    workoutToday: workoutDates.includes(today) ? 1 : 0,
    proteinToday: todayCheckin?.protein_hit ? 1 : 0,
    habitToday: habitDates.includes(today) ? 1 : 0,
    readToday: readDates.includes(today) ? 1 : 0,
    workoutsWeek: workoutDates.filter(inWeek).length,
    runsWeek: runDates.filter(inWeek).length,
    readDaysWeek: new Set(readDates.filter(inWeek)).size,
    habitDaysWeek: new Set(habitDates.filter(inWeek)).size,
  };

  const states = MISSIONS.map((m) => missionState(m, metrics));
  const daily = states.filter((m) => m.period === "daily");
  const weekly = states.filter((m) => m.period === "weekly");

  return {
    daily,
    weekly,
    dailyDone: daily.filter((m) => m.done).length,
    dailyTotal: daily.length,
    weeklyDone: weekly.filter((m) => m.done).length,
    weeklyTotal: weekly.length,
  };
}
