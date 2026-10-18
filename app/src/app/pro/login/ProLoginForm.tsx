"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginProAction } from "@/app/pro/actions";
import { ui } from "@/components/admin/ui";

export function ProLoginForm() {
  const [state, formAction, pending] = useActionState(loginProAction, {});

  if (state.sentTo) {
    return (
      <div className="flex flex-col gap-4">
        <p className="rounded-xl bg-nm-green-soft px-4 py-3 text-sm font-extrabold text-nm-green-deep">
          {state.devLink ? "Ambiente sem e-mail configurado. Use o botão abaixo." : `Enviamos um link para ${state.sentTo}. Ele vale por 20 minutos.`}
        </p>
        {state.devLink && (
          <Link href={state.devLink} className={`${ui.btn} ${ui.primary}`}>
            Entrar agora (modo de desenvolvimento)
          </Link>
        )}
        <p className="text-xs text-ink/50">Não chegou? Veja a caixa de spam ou peça de novo recarregando a página.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={ui.label} htmlFor="email">
          Seu e-mail
        </label>
        <input id="email" name="email" type="email" required autoFocus autoComplete="email" placeholder="voce@exemplo.com" className={ui.input} />
      </div>
      <div>
        <label className={ui.label} htmlFor="name">
          Como quer ser chamado (opcional, só na primeira vez)
        </label>
        <input id="name" name="name" maxLength={60} autoComplete="name" placeholder="Ex.: Fono Ana" className={ui.input} />
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      <button type="submit" disabled={pending} className={`${ui.btn} ${ui.primary}`}>
        {pending ? "Enviando..." : "Receber link de acesso"}
      </button>
    </form>
  );
}
