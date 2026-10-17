"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { ui } from "@/components/admin/ui";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label className={ui.label} htmlFor="password">
          Senha
        </label>
        <input id="password" name="password" type="password" required autoFocus autoComplete="current-password" className={ui.input} />
      </div>
      {state.error && <p className={ui.error}>{state.error}</p>}
      <button type="submit" disabled={pending} className={`${ui.btn} ${ui.primary}`}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
