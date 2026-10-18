import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getProfessional } from "@/lib/pro-auth";
import { ProLoginForm } from "./ProLoginForm";

export const metadata = { title: "Área do profissional · NeuroMinds" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ erro?: string }> };

export default async function ProLoginPage({ searchParams }: Props) {
  if (await getProfessional()) redirect("/pro");
  const { erro } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="nm-stripe" aria-hidden="true" />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <Link href="/" aria-label="Ir para o site">
          <Logo />
        </Link>
        <div className="w-full max-w-md rounded-2xl bg-paper p-6 ring-1 ring-fog motion-safe:animate-pop">
          <h1 className="mb-1 font-display text-3xl tracking-wide text-ink/85">Área do profissional</h1>
          <p className="mb-5 text-sm text-ink/60">
            Monte a prancha de cada criança e acompanhe o uso. Sem senha: você recebe um link por e-mail.
          </p>
          {erro === "link" && (
            <p className="mb-4 rounded-xl bg-nm-red-soft px-4 py-3 text-sm font-extrabold text-nm-red-deep">
              Esse link não vale mais. Peça um novo abaixo.
            </p>
          )}
          <ProLoginForm />
        </div>
      </main>
    </div>
  );
}
