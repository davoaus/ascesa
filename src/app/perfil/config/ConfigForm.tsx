"use client";

import { useActionState } from "react";
import { saveProfile, type ConfigState } from "./actions";

const initial: ConfigState = {};

const field =
  "w-full rounded-xl border border-line bg-carvao px-4 py-3 text-marfim placeholder:text-muted focus:border-brasa focus:outline-none";
const label = "border-l-[3px] border-brasa pl-2.5 text-xs font-bold uppercase tracking-widest text-muted";

export default function ConfigForm({
  profile,
}: {
  profile: {
    display_name: string | null;
    bodyweight_kg: number | null;
    height_cm: number | null;
    goal: string | null;
    sleep_time: string | null;
    nutrition_kcal: string | null;
    nutrition_protein: string | null;
    nutrition_carb: string | null;
    nutrition_fat: string | null;
  };
}) {
  const [state, action, pending] = useActionState(saveProfile, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className={label}>Nome</span>
        <input
          name="display_name"
          defaultValue={profile.display_name ?? ""}
          placeholder="Como quer ser chamado"
          className={field}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Peso (kg)</span>
          <input
            name="bodyweight_kg"
            inputMode="decimal"
            defaultValue={profile.bodyweight_kg ?? ""}
            placeholder="80"
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Altura (cm)</span>
          <input
            name="height_cm"
            inputMode="decimal"
            defaultValue={profile.height_cm ?? ""}
            placeholder="178"
            className={field}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={label}>Objetivo</span>
        <input
          name="goal"
          defaultValue={profile.goal ?? ""}
          placeholder="Recomposição"
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={label}>Horário de dormir</span>
        <input
          name="sleep_time"
          defaultValue={profile.sleep_time ?? ""}
          placeholder="22:00"
          className={field}
        />
      </label>

      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">
        Metas de nutrição
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Calorias</span>
          <input name="nutrition_kcal" defaultValue={profile.nutrition_kcal ?? ""} placeholder="2500–2700" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Proteína</span>
          <input name="nutrition_protein" defaultValue={profile.nutrition_protein ?? ""} placeholder="170 g" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Carboidrato</span>
          <input name="nutrition_carb" defaultValue={profile.nutrition_carb ?? ""} placeholder="250–300 g" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Gordura</span>
          <input name="nutrition_fat" defaultValue={profile.nutrition_fat ?? ""} placeholder="70–80 g" className={field} />
        </label>
      </div>

      {state.error && (
        <p className="rounded-lg border border-brasa-deep/50 bg-brasa-deep/10 px-3 py-2 text-sm text-brasa">
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="text-center text-sm text-ok">Configurações salvas ✓</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-brasa to-ouro px-4 py-3.5 font-black tracking-wide text-carvao disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
