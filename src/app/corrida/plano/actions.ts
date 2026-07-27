"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { defaultRunWeeks, type RunSession } from "@/lib/runPlan";

const toJson = (s: RunSession[]): Json => s as unknown as Json;

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

/** Cria o plano padrão (do Davo) se o usuário ainda não tiver nenhuma semana. */
export async function seedRunPlan() {
  const { supabase, user } = await requireUser();

  const { count } = await supabase
    .from("run_weeks")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) > 0) return { seeded: false };

  const rows = defaultRunWeeks().map((w) => ({
    user_id: user.id,
    week_no: w.weekNo,
    sessions: toJson(w.sessions),
  }));
  await supabase.from("run_weeks").insert(rows);

  revalidatePath("/corrida/plano");
  revalidatePath("/corrida");
  revalidatePath("/perfil/plano");
  return { seeded: true };
}

/** Substitui as sessões de uma semana. */
export async function saveWeekSessions(weekId: string, sessions: RunSession[]) {
  const { supabase } = await requireUser();
  const clean = sessions
    .map((s) => ({ day: s.day.trim(), desc: s.desc.trim() }))
    .filter((s) => s.day || s.desc);

  await supabase.from("run_weeks").update({ sessions: toJson(clean) }).eq("id", weekId);

  revalidatePath("/corrida/plano");
  revalidatePath("/corrida");
  revalidatePath("/perfil/plano");
  return { ok: true };
}

/** Adiciona uma nova semana ao final, com uma sessão em branco. */
export async function addWeek() {
  const { supabase, user } = await requireUser();

  const { data: last } = await supabase
    .from("run_weeks")
    .select("week_no")
    .order("week_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNo = (last?.week_no ?? 0) + 1;
  await supabase.from("run_weeks").insert({
    user_id: user.id,
    week_no: nextNo,
    sessions: toJson([{ day: "Seg", desc: "" }]),
  });

  revalidatePath("/corrida/plano");
  revalidatePath("/corrida");
  revalidatePath("/perfil/plano");
  return { ok: true };
}

/** Remove uma semana. */
export async function removeWeek(weekId: string) {
  const { supabase } = await requireUser();
  await supabase.from("run_weeks").delete().eq("id", weekId);

  revalidatePath("/corrida/plano");
  revalidatePath("/corrida");
  revalidatePath("/perfil/plano");
  return { ok: true };
}
