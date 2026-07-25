import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/entrar/actions";
import ConfigForm from "./ConfigForm";

export default async function ConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, bodyweight_kg, height_cm, goal, sleep_time, nutrition_kcal, nutrition_protein, nutrition_carb, nutrition_fat",
    )
    .eq("id", user!.id)
    .single();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/perfil" className="text-sm text-muted hover:text-marfim">
          ← Perfil
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">
          CONFIGURAÇÕES
        </p>
      </header>

      <ConfigForm
        profile={
          profile ?? {
            display_name: null,
            bodyweight_kg: null,
            height_cm: null,
            goal: null,
            sleep_time: null,
            nutrition_kcal: null,
            nutrition_protein: null,
            nutrition_carb: null,
            nutrition_fat: null,
          }
        }
      />

      <div className="mt-2 rounded-2xl border border-line bg-carvao-2 p-4">
        <p className="text-sm text-muted">
          Conta: <span className="text-marfim">{user?.email}</span>
        </p>
      </div>

      <form action={signOut} className="mt-auto">
        <button className="w-full rounded-xl border border-line px-4 py-3 text-sm text-muted hover:border-brasa-deep hover:text-brasa">
          Sair da conta
        </button>
      </form>
    </main>
  );
}
