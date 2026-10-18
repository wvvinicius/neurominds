import Link from "next/link";
import { logoutProAction } from "@/app/pro/actions";
import { ui } from "@/components/admin/ui";
import { Logo } from "@/components/Logo";
import { requireProfessional } from "@/lib/pro-auth";

export const metadata = { title: "Área do profissional · NeuroMinds" };

/** Guarda de acesso e moldura da área do profissional. */
export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const me = await requireProfessional();

  return (
    <div className="flex min-h-dvh flex-col bg-mist/40">
      <div className="nm-stripe" aria-hidden="true" />
      <header className="bg-paper">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/pro" className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-ink/60 sm:inline">PROFISSIONAL</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <span className="hidden text-ink/50 md:inline">{me.name ?? me.email}</span>
            <Link href="/pro" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Alunos
            </Link>
            <a href="/api/export/uso.csv" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Exportar CSV
            </a>
            <Link href="/" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Ver site
            </Link>
            <form action={logoutProAction}>
              <button type="submit" className={`${ui.btn} h-10 px-4 text-ink/50 hover:bg-mist`}>
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

      <footer className="px-4 py-4 text-center text-xs text-ink/50">
        Use apelidos. Nunca cadastre nome real, diagnóstico ou qualquer dado de saúde da criança.
      </footer>
    </div>
  );
}
