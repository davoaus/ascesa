"use client";

import { useState, useTransition } from "react";
import { changePassword } from "./security-actions";

export default function ChangePassword() {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    setMsg(null);
    if (pwd.length < 6) {
      setErr("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (pwd !== confirm) {
      setErr("As senhas não coincidem.");
      return;
    }
    start(async () => {
      const r = await changePassword(pwd);
      if (r?.error) setErr(r.error);
      else {
        setMsg("Senha alterada ✓");
        setPwd("");
        setConfirm("");
      }
    });
  }

  return (
    <details className="rounded-2xl border border-line bg-gradient-to-b from-carvao-2 to-carvao-3 p-4">
      <summary className="cursor-pointer border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted">
        Alterar senha
      </summary>
      <div className="mt-3 flex flex-col gap-2">
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Nova senha"
          autoComplete="new-password"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirmar nova senha"
          autoComplete="new-password"
          className="rounded-lg border border-line bg-carvao px-3 py-2.5 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || !pwd || !confirm}
          className="rounded-lg bg-gradient-to-r from-brasa to-ouro px-4 py-2.5 text-sm font-black text-carvao disabled:opacity-50"
        >
          {pending ? "..." : "Salvar nova senha"}
        </button>
        {err && <p className="text-sm text-brasa">{err}</p>}
        {msg && <p className="text-sm text-ok">{msg}</p>}
      </div>
    </details>
  );
}
