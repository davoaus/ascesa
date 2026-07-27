import { createClient } from "@/lib/supabase/server";
import { AREAS, areaXp, sumXpBySource } from "@/lib/areas";
import AreaHeader from "../AreaHeader";
import FinanceGoals from "./FinanceGoals";
import FinanceLogger from "./FinanceLogger";

const AREA = AREAS.find((a) => a.slug === "financas")!;

function monthBounds() {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(5, 7));
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const days = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(days).padStart(2, "0")}`;
  return { start, end };
}

export default async function FinancasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { start, end } = monthBounds();

  const [{ data: events }, { data: profile }, { data: logs }] = await Promise.all([
    supabase.from("xp_events").select("source, amount"),
    supabase
      .from("profiles")
      .select("current_streak, meta_poupar, meta_gastar, meta_dizimo")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("finance_logs")
      .select("kind, amount")
      .gte("log_date", start)
      .lte("log_date", end),
  ]);

  const xp = areaXp(AREA, sumXpBySource(events ?? []));

  const sum = (kind: string) =>
    (logs ?? [])
      .filter((l) => l.kind === kind)
      .reduce((t, l) => t + Number(l.amount), 0);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <AreaHeader area={AREA} xp={xp} streak={profile?.current_streak ?? 0} />

      <FinanceGoals
        data={{
          metaPoupar: profile?.meta_poupar ?? null,
          metaGastar: profile?.meta_gastar ?? null,
          metaDizimo: profile?.meta_dizimo ?? null,
          poupado: sum("poupar"),
          gasto: sum("gastar"),
          dizimado: sum("dizimo"),
        }}
      />

      <FinanceLogger />

      <p className="px-1 text-xs text-muted">
        Controle financeiro também é evolução. Poupar e dizimar somam XP para as
        Finanças e para o ranking, e reforçam a Disciplina.
      </p>
    </main>
  );
}
