import Link from "next/link";
import { logoutProAction } from "@/app/pro/actions";
import { ui } from "@/components/admin/ui";
import { Logo } from "@/components/Logo";
import { requireProfessional } from "@/lib/pro-auth";
import { Credits } from "@/components/Credits";

export const metadata = { title: "Área do profissional · NeuroMinds" };

function IconExit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

/** Guarda de acesso e moldura da área do profissional. */
export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const me = await requireProfessional();

  return (
    <div className="flex min-h-dvh flex-col bg-mist/40">
      <div className="nm-stripe" aria-hidden="true" />
      <header className="bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/pro" className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-ink/60 sm:inline">PROFISSIONAL</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <span className="mr-1 hidden text-ink/50 xl:inline">{me.name ?? me.email}</span>
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
              <button type="submit" className={`${ui.btn} ${ui.danger} h-10 px-4`}>
                <IconExit />
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>

      <footer className="flex flex-col items-center gap-1 px-4 py-4 text-center text-xs text-ink/50">
        <p>Use apelidos. Nunca cadastre nome real, diagnóstico ou qualquer dado de saúde da criança.</p>
        <Credits />
      </footer>
    </div>
  );
}
