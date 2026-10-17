import Link from "next/link";
import { createActionAction, moveActionAction, toggleActionAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { colorDot, ui } from "@/components/admin/ui";
import { listActionsAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

/** Lista de ações (NM-12): ordem, ativar/desativar, editar, criar. */
export default async function AdminHome() {
  const actions = await listActionsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h1 className={ui.h2}>Ações</h1>
          <span className="text-sm font-extrabold text-ink/50">{actions.length} cadastradas</span>
        </div>

        {actions.length === 0 ? (
          <p className={`${ui.card} text-ink/60`}>Nenhuma ação ainda. Crie a primeira abaixo.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {actions.map((a, i) => (
              <li key={a.id} className={`${ui.card} flex flex-wrap items-center gap-3 py-3 ${a.isActive ? "" : "opacity-60"}`}>
                <div className="flex flex-col gap-1">
                  <form action={moveActionAction.bind(null, a.id, "up")}>
                    <button type="submit" disabled={i === 0} aria-label="Subir" className={`${ui.icon} h-8 w-8`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveActionAction.bind(null, a.id, "down")}>
                    <button type="submit" disabled={i === actions.length - 1} aria-label="Descer" className={`${ui.icon} h-8 w-8`}>
                      ↓
                    </button>
                  </form>
                </div>

                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${colorDot[a.color]}`} aria-hidden="true">
                  {a.emoji}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xl font-extrabold">{a.name}</p>
                  <p className="text-sm text-ink/50">
                    /acao/{a.slug} · {a.videoCount} {a.videoCount === 1 ? "vídeo" : "vídeos"}
                    {!a.isActive && " · oculta no site"}
                  </p>
                </div>

                <form action={toggleActionAction.bind(null, a.id, !a.isActive)}>
                  <button type="submit" className={`${ui.btn} h-10 px-4 ${a.isActive ? ui.success : ui.secondary}`}>
                    {a.isActive ? "Ativa" : "Inativa"}
                  </button>
                </form>
                <Link href={`/admin/acoes/${a.id}`} className={`${ui.btn} ${ui.primary} h-10 px-4`}>
                  Vídeos e edição
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${ui.card} flex flex-col gap-4`}>
        <h2 className={ui.h2}>Nova ação</h2>
        <ActionForm action={createActionAction} submitLabel="Criar ação" />
      </section>
    </div>
  );
}
