"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";
import type { Action } from "@/lib/types";
import { ColorPicker } from "./ColorPicker";
import { ui } from "./ui";

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: Pick<Action, "name" | "emoji" | "color">;
  submitLabel: string;
};

/** Formulário de ação (criar e editar). Nome, emoji, cor. */
export function ActionForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className={ui.label} htmlFor="name">
            Nome da ação
          </label>
          <input id="name" name="name" required maxLength={40} defaultValue={initial?.name} placeholder="Ex.: Chutar" className={ui.input} />
        </div>
        <div>
          <label className={ui.label} htmlFor="emoji">
            Emoji
          </label>
          <input id="emoji" name="emoji" required maxLength={8} defaultValue={initial?.emoji} placeholder="⚽" className={`${ui.input} text-center text-2xl`} />
        </div>
      </div>
      <div>
        <span className={ui.label}>Cor da carta</span>
        <ColorPicker value={initial?.color ?? "blue"} />
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      <div>
        <button type="submit" disabled={pending} className={`${ui.btn} ${ui.primary}`}>
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
