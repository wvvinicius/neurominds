"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestBoardLinksAction } from "@/app/aluno/actions";
import { ui } from "@/components/admin/ui";

export function GuardianForm() {
  const [state, formAction, pending] = useActionState(requestBoardLinksAction, {});

  if (state.done) {
    return (
      <div className="flex flex-col gap-3">
        <p className="rounded-xl bg-nm-green-soft px-4 py-3 text-sm font-extrabold text-nm-green-deep">
          Se houver um painel de verbos cadastrado com esse e-mail, o link já foi enviado. Veja a caixa de entrada e o spam.
        </p>
        {state.devLinks?.map((l) => (
          <Link key={l.url} href={l.url} className={`${ui.btn} bg-nm-yellow-mid text-ink hover:bg-nm-yellow`}>
            Abrir o painel de {l.nickname} (modo de desenvolvimento)
          </Link>
        ))}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={ui.label} htmlFor="email">
          E-mail do responsável
        </label>
        <input id="email" name="email" type="email" required autoFocus autoComplete="email" placeholder="mae@exemplo.com" className={ui.input} />
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      <button type="submit" disabled={pending} className={`${ui.btn} bg-nm-yellow-mid text-ink hover:bg-nm-yellow`}>
        {pending ? "Enviando..." : "Receber o link do painel"}
      </button>
    </form>
  );
}
