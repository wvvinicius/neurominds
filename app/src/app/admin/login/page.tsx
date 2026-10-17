import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { adminPassword, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar · NeuroMinds" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const enabled = !!adminPassword();
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="nm-stripe" aria-hidden="true" />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
        <Logo />
        <div className="w-full max-w-sm rounded-2xl bg-paper p-6 ring-1 ring-fog motion-safe:animate-pop">
          <h1 className="mb-1 font-display text-3xl tracking-wide text-ink/85">Gerenciador</h1>
          <p className="mb-5 text-sm text-ink/60">Área da equipe de conteúdo.</p>
          {enabled ? (
            <LoginForm />
          ) : (
            <p className="rounded-xl bg-nm-yellow-soft px-4 py-3 text-sm font-extrabold text-nm-yellow-deep">
              O admin está desligado: defina ADMIN_PASSWORD na hospedagem.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
