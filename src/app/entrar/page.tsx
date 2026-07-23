"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initial: AuthState = {};

export default function EntrarPage() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const action = mode === "entrar" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <header className="text-center">
        <p className="text-sm font-black tracking-[0.42em] text-marfim">ASCESA</p>
        <p className="mt-3 text-3xl font-black leading-tight text-marfim">
          O seu maior adversário <span className="text-brasa">é você mesmo</span>.
        </p>
        <p className="mt-2 text-sm text-muted">
          Suba de nível na vida real. Cada treino é um duelo com a versão de ontem.
        </p>
      </header>

      <form action={formAction} className="flex flex-col gap-3">
        {mode === "criar" && (
          <input
            name="display_name"
            placeholder="Como quer ser chamado"
            autoComplete="nickname"
            className="rounded-xl border border-line bg-carvao-2 px-4 py-3 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
          />
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="E-mail"
          autoComplete="email"
          className="rounded-xl border border-line bg-carvao-2 px-4 py-3 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Senha"
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
          className="rounded-xl border border-line bg-carvao-2 px-4 py-3 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
        />

        {state.error && (
          <p className="rounded-lg border border-brasa-deep/50 bg-brasa-deep/10 px-3 py-2 text-sm text-brasa">
            {state.error}
          </p>
        )}
        {state.notice && (
          <p className="rounded-lg border border-ok/50 bg-ok/10 px-3 py-2 text-sm text-ok">
            {state.notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-3.5 font-black tracking-wide text-carvao disabled:opacity-60"
        >
          {pending
            ? "..."
            : mode === "entrar"
              ? "Entrar"
              : "Começar a jornada"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
        className="text-center text-sm text-muted underline-offset-4 hover:text-marfim hover:underline"
      >
        {mode === "entrar"
          ? "Ainda não tenho conta — criar"
          : "Já tenho conta — entrar"}
      </button>
    </main>
  );
}
