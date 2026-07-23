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

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: String(formData.get("display_name") ?? "").trim() || "Atleta",
      bodyweight_kg: num(formData.get("bodyweight_kg")),
      height_cm: num(formData.get("height_cm")),
      goal: String(formData.get("goal") ?? "").trim() || null,
      sleep_time: String(formData.get("sleep_time") ?? "").trim() || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível salvar. Tente de novo." };

  revalidatePath("/", "layout");
  return { saved: true };
}
