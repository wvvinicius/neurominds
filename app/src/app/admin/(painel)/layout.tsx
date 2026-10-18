import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { ui } from "@/components/admin/ui";
import { Logo } from "@/components/Logo";
import { isAdmin } from "@/lib/auth";
import { isPersistent } from "@/lib/db";

export const metadata = { title: "Gerenciador · NeuroMinds" };

/** Guarda de acesso e moldura do admin. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-dvh flex-col bg-mist/40">
      <div className="nm-stripe" aria-hidden="true" />
      <header className="bg-paper">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-ink/60 sm:inline">
              GERENCIADOR
            </span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
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
              <button type="submit" className={`${ui.btn} h-10 px-4 text-ink/50 hover:bg-mist`}>
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
    </div>
  );
}
