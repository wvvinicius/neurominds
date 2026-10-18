"use client";

import { useActionState } from "react";
import { createProLinkAction } from "@/app/admin/actions";
import { CopyButton } from "@/components/pro/CopyButton";
import { ui } from "./ui";

/** Gera um link de acesso de profissional para enviar por WhatsApp. */
export function ProLinkForm() {
  const [state, formAction, pending] = useActionState(createProLinkAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="pro-email">
            E-mail do profissional
          </label>
          <input id="pro-email" name="email" type="email" required placeholder="fono@exemplo.com" className={ui.input} />
        </div>
        <div>
          <label className={ui.label} htmlFor="pro-name">
            Nome (opcional)
          </label>
          <input id="pro-name" name="name" maxLength={60} placeholder="Ex.: Fono Ana" className={ui.input} />
        </div>
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      {state.link && (
        <div className="flex flex-col gap-3 rounded-xl bg-nm-green-soft p-4">
          <p className="text-sm font-extrabold text-nm-green-deep">
            Link de acesso para {state.email}. Vale por 24 horas e só pode ser usado uma vez.
          </p>
          <code className="break-all rounded-xl bg-paper px-4 py-3 text-sm">{state.link}</code>
          <div>
            <CopyButton text={state.link} />
          </div>
        </div>
      )}
      <div>
        <button type="submit" disabled={pending} className={`${ui.btn} ${ui.primary}`}>
          {pending ? "Gerando..." : "Gerar link de acesso"}
        </button>
      </div>
    </form>
  );
}
