"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/pro/actions";
import { ui } from "@/components/admin/ui";

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: { nickname: string; guardianEmail: string | null };
  submitLabel: string;
};

/** Cadastro e edição de aluno (NM-20): apelido e e-mail do responsável. */
export function StudentForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={ui.label} htmlFor="nickname">
            Apelido da criança
          </label>
          <input id="nickname" name="nickname" required maxLength={40} defaultValue={initial?.nickname} placeholder="Ex.: Joca, Estrelinha" className={ui.input} />
          <p className="mt-1 text-xs text-ink/50">Use um apelido, não o nome real.</p>
        </div>
        <div>
          <label className={ui.label} htmlFor="guardianEmail">
            E-mail do responsável (opcional)
          </label>
          <input id="guardianEmail" name="guardianEmail" type="email" maxLength={120} defaultValue={initial?.guardianEmail ?? ""} placeholder="mae@exemplo.com" className={ui.input} />
          <p className="mt-1 text-xs text-ink/50">Só para você lembrar a quem mandar o link.</p>
        </div>
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-nm-green-soft px-4 py-3 text-sm font-extrabold text-nm-green-deep">Salvo.</p>}
      <div>
        <button type="submit" disabled={pending} className={`${ui.btn} ${ui.primary}`}>
          {pending ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
