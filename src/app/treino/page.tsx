import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WorkoutLogger from "./WorkoutLogger";

export default async function TreinoPage() {
  const supabase = await createClient();
  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, name, primary_muscle")
    .order("name");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-muted hover:text-marfim">
          ← Voltar
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">TREINO</p>
      </header>

      <p className="text-2xl font-black text-marfim">
        Um duelo com a versão de ontem.
      </p>

      <WorkoutLogger exercises={exercises ?? []} />
    </main>
  );
}
