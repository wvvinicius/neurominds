import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { ui } from "@/components/admin/ui";
import { Logo } from "@/components/Logo";
import { isAdmin } from "@/lib/auth";
import { isPersistent } from "@/lib/db";
import { APP_VERSION } from "@/lib/version";

export const metadata = { title: "Gerenciador · NeuroMinds" };

/** Guarda de acesso e moldura do admin. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh flex-col bg-mist/40">
      <div className="nm-stripe" aria-hidden="true" />
      <header className="bg-paper">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-ink/60 sm:inline">
              GERENCIADOR
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/admin" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Ações
            </Link>
            <Link href="/admin/profissionais" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Profissionais
            </Link>
            <Link href="/admin/uso" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Uso
            </Link>
            <Link href="/" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
              Ver site
            </Link>
            <form action={logoutAction}>
              <button type="submit" className={`${ui.btn} ${ui.danger} h-10 px-4`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="M16 17l5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      {!isPersistent() && (
        <div className="bg-nm-yellow-soft px-4 py-2 text-center text-sm font-extrabold text-nm-yellow-deep">
          Banco temporário: o que você gravar aqui some quando a hospedagem reinicia. Configure TURSO_DATABASE_URL.
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
      <footer className="px-4 py-4 text-center text-xs text-ink/40">NeuroMinds v{APP_VERSION}</footer>
    </div>
  );
}
