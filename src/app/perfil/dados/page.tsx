import Link from "next/link";
import DataPortability from "./DataPortability";

export default function DadosPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-8">
      <header className="flex items-center justify-between">
        <Link href="/perfil" className="text-sm text-muted hover:text-marfim">
          ← Perfil
        </Link>
        <p className="text-xs font-black tracking-[0.3em] text-muted">DADOS</p>
      </header>

      <div>
        <p className="text-2xl font-black text-marfim">Backup & restauro</p>
        <p className="text-sm text-muted">
          Leve seu histórico de treino com você.
        </p>
      </div>

      <DataPortability />
    </main>
  );
}
