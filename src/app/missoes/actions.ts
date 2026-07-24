"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MISSIONS, missionState } from "@/lib/missions";
import { computeContext } from "./data";

/** Resgata a recompensa de uma missão concluída (uma vez por período). */
export async function claimMission(missionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) return { error: "Missão inválida." };

  const { metrics, dailyKey, weeklyKey } = await computeContext(supabase, user.id);
  const state = missionState(mission, metrics, new Set(), dailyKey, weeklyKey);
  if (!state.done) return { error: "Missão ainda não concluída." };

  // registra o resgate (unique impede duplicar); se já existe, aborta sem pagar.
  const { error: claimErr } = await supabase.from("mission_claims").insert({
    user_id: user.id,
    mission_id: mission.id,
    period_key: state.periodKey,
  });
  if (claimErr) return { error: "Recompensa já resgatada." };

  await supabase.from("xp_events").insert({
    user_id: user.id,
    source: `bonus:${mission.areaSlug}`,
    amount: mission.reward,
  });
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total")
    .eq("id", user.id)
    .single();
  await supabase
    .from("profiles")
    .update({ xp_total: (profile?.xp_total ?? 0) + mission.reward })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  return { reward: mission.reward };
}
