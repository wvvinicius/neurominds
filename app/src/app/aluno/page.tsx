import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { Logo } from "@/components/Logo";
import { GuardianForm } from "./GuardianForm";

export const metadata = { title: "Sou aluno · NeuroMinds" };

/** "Sou aluno": o responsável pede o link da prancha por e-mail. */
export default function AlunoPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="nm-stripe" aria-hidden="true" />
      <BackButton />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <Link href="/" aria-label="Início">
          <Logo />
        </Link>
        <div className="w-full max-w-md rounded-2xl bg-paper p-6 ring-1 ring-fog motion-safe:animate-pop">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-5xl" aria-hidden="true">
              🧒
            </span>
            <h1 className="font-display text-3xl tracking-wide text-ink/85">Sou aluno</h1>
          </div>
          <p className="mb-5 text-sm text-ink/60">
            O painel de verbos abre por um link, sem senha. Digite o e-mail do responsável cadastrado pelo profissional e enviamos o link.
          </p>
          <GuardianForm />
          <p className="mt-5 text-xs text-ink/50">
            Não tem painel ainda? Peça ao profissional que acompanha a criança. Ou{" "}
            <Link href="/cartas" className="font-extrabold text-nm-blue-deep underline-offset-4 hover:underline">
              explore as cartas abertas
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
