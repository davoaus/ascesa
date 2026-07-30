"use client";

import { useState, useTransition } from "react";
import { claimMission } from "./actions";
import { celebrateFrom } from "../celebrate";

export default function ClaimButton({
  missionId,
  reward,
}: {
  missionId: string;
  reward: number;
}) {
  const [pending, start] = useTransition();
  const [claimed, setClaimed] = useState(false);

  if (claimed)
    return <span className="text-xs font-bold text-ok">+{reward} XP ✓</span>;

  return (
    <button
      type="button"
      onClick={(e) => {
        const el = e.currentTarget;
        start(async () => {
          const r = await claimMission(missionId);
          if (!r?.error) {
            celebrateFrom(el, 24);
            setClaimed(true);
          }
        });
      }}
      disabled={pending}
      className="rounded-md bg-gradient-to-r from-brasa to-ouro px-2.5 py-1 text-xs font-black text-carvao disabled:opacity-50"
    >
      {pending ? "..." : `Resgatar +${reward}`}
    </button>
  );
}
