"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ConfigState = { saved?: boolean; error?: string };

function num(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).replace(",", ".").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function saveProfile(
  _prev: ConfigState,
  formData: FormData,
): Promise<ConfigState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const str = (k: string) => String(formData.get(k) ?? "").trim() || null;
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? "").trim() || "Atleta",
      bodyweight_kg: num(formData.get("bodyweight_kg")),
      height_cm: num(formData.get("height_cm")),
      goal: str("goal"),
      sleep_time: str("sleep_time"),
      nutrition_kcal: str("nutrition_kcal"),
      nutrition_protein: str("nutrition_protein"),
      nutrition_carb: str("nutrition_carb"),
      nutrition_fat: str("nutrition_fat"),
    })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível salvar. Tente de novo." };

  revalidatePath("/", "layout");
  return { saved: true };
}
