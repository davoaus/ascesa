"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveStreak } from "@/lib/game/progression";

export type FinanceKind = "poupar" | "gastar" | "dizimo";

function todayLocal(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

/**
 * Registra um lançamento financeiro categorizado do dia.
 * - `poupar` e `dizimo` são construtivos: dão XP (proporcional, com teto),
 *   reforçam a Disciplina e mantêm a ofensiva.
 * - `gastar` é apenas acompanhamento contra o limite do mês: registra o valor,
 *   sem XP.
 */
export async function logFinance(input: { kind: FinanceKind; amount: number }) {
  const { supabase, user } = await requireUser();

  const v = Number(input.amount);
  if (!Number.isFinite(v) || v <= 0) return { error: "Informe um valor válido." };
  const today = todayLocal();

  await supabase.from("finance_logs").insert({
    user_id: user.id,
    log_date: today,
    kind: input.kind,
    amount: v,
  });

  // Gasto não gera XP nem ofensiva — só entra no acompanhamento do limite.
  if (input.kind === "gastar") {
    revalidatePath("/financas");
    revalidatePath("/hoje");
    return { xp: 0 };
  }

  // R$ 10 = 1 XP, com teto de 60 XP por registro (evita farmar valor alto).
  const xp = Math.min(60, Math.max(3, Math.round(v / 10)));

  await supabase
    .from("xp_events")
    .insert({ user_id: user.id, source: "Finanças", amount: xp });

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total, current_streak, longest_streak, last_completed_date")
    .eq("id", user.id)
    .single();

  const { streak } = resolveStreak(
    {
      lastCompletedDate: profile?.last_completed_date ?? null,
      currentStreak: profile?.current_streak ?? 0,
    },
    today,
  );

  await supabase
    .from("profiles")
    .update({
      xp_total: (profile?.xp_total ?? 0) + xp,
      current_streak: streak,
      longest_streak: Math.max(streak, profile?.longest_streak ?? 0),
      last_completed_date: today,
    })
    .eq("id", user.id);

  await supabase.from("streak_log").upsert(
    { user_id: user.id, log_date: today, completed: true },
    { onConflict: "user_id,log_date" },
  );

  const { data: a } = await supabase
    .from("user_attributes")
    .select("disciplina")
    .eq("user_id", user.id)
    .single();
  if (a) {
    await supabase
      .from("user_attributes")
      .update({ disciplina: a.disciplina + 1 })
      .eq("user_id", user.id);
  }

  revalidatePath("/", "layout");
  return { xp };
}

/** Compat: registrar economia = poupar. */
export async function logSaving(input: { amount: number }) {
  return logFinance({ kind: "poupar", amount: input.amount });
}

/** Define as metas mensais recorrentes. Campos em branco/0 = sem meta. */
export async function setFinanceGoals(input: {
  poupar: number | null;
  gastar: number | null;
  dizimo: number | null;
}) {
  const { supabase, user } = await requireUser();

  const clean = (n: number | null) =>
    n != null && Number.isFinite(n) && n > 0 ? n : null;

  await supabase
    .from("profiles")
    .update({
      meta_poupar: clean(input.poupar),
      meta_gastar: clean(input.gastar),
      meta_dizimo: clean(input.dizimo),
    })
    .eq("id", user.id);

  revalidatePath("/financas");
  return { ok: true };
}
