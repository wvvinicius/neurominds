import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteActionAction,
  deleteVideoAction,
  moveVideoAction,
  toggleVideoAction,
  updateActionAction,
  updateVideoCaptionAction,
} from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { colorDot, ui } from "@/components/admin/ui";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { getActionAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

/** Edição da ação e dos seus vídeos (NM-12, NM-13, NM-14). */
export default async function ActionAdminPage({ params }: Props) {
  const { id } = await params;
  const action = await getActionAdmin(id);
  if (!action) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin" className={`${ui.btn} ${ui.secondary} h-10 px-4`}>
          ← Ações
        </Link>
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${colorDot[action.color]}`} aria-hidden="true">
          {action.emoji}
        </span>
        <h1 className={ui.h2}>{action.name}</h1>
        <Link href={`/acao/${action.slug}`} className="text-sm font-extrabold text-nm-blue-deep underline-offset-4 hover:underline">
          ver no site
        </Link>
      </div>

      <section className={`${ui.card} flex flex-col gap-4`}>
        <h2 className="text-lg font-extrabold">Dados da ação</h2>
        <ActionForm action={updateActionAction.bind(null, action.id)} initial={action} submitLabel="Salvar" />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className={ui.h2}>Vídeos</h2>
          <span className="text-sm font-extrabold text-ink/50">{action.videos.length} nesta ação</span>
        </div>

        {action.videos.length === 0 ? (
          <p className={`${ui.card} text-ink/60`}>Nenhum vídeo ainda. Adicione abaixo.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {action.videos.map((v, i) => (
              <li key={v.id} className={`${ui.card} flex flex-wrap items-start gap-4 ${v.isActive ? "" : "opacity-60"}`}>
                <div className="flex flex-col gap-1">
                  <form action={moveVideoAction.bind(null, v.id, "up")}>
                    <button type="submit" disabled={i === 0} aria-label="Subir" className={`${ui.icon} h-8 w-8`}>
                      ↑
                    </button>
                  </form>
                  <form action={moveVideoAction.bind(null, v.id, "down")}>
                    <button type="submit" disabled={i === action.videos.length - 1} aria-label="Descer" className={`${ui.icon} h-8 w-8`}>
                      ↓
                    </button>
                  </form>
                </div>

                {/* Pré-visualização (NM-14) */}
                <video src={v.src} controls preload="metadata" playsInline className="aspect-video w-full max-w-72 rounded-xl bg-ink" />

                <div className="flex min-w-60 flex-1 flex-col gap-3">
                  <form action={updateVideoCaptionAction.bind(null, v.id)} className="flex gap-2">
                    <input name="caption" defaultValue={v.caption ?? ""} maxLength={80} placeholder="Legenda curta" className={ui.input} />
                    <button type="submit" className={`${ui.btn} ${ui.secondary} shrink-0`}>
                      Salvar
                    </button>
                  </form>
                  <p className="break-all text-xs text-ink/40">{v.src}</p>
                  <div className="flex flex-wrap gap-2">
                    <form action={toggleVideoAction.bind(null, v.id, !v.isActive)}>
                      <button type="submit" className={`${ui.btn} h-10 px-4 ${v.isActive ? ui.success : ui.secondary}`}>
                        {v.isActive ? "Ativo" : "Inativo"}
                      </button>
                    </form>
                    <form action={deleteVideoAction.bind(null, v.id)}>
                      <ConfirmSubmit message="Excluir este vídeo? Não dá para desfazer." className={`${ui.btn} ${ui.danger} h-10 px-4`}>
                        Excluir
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <VideoUploader actionId={action.id} />
      </section>

      <section className={`${ui.card} flex flex-wrap items-center justify-between gap-3`}>
        <div>
          <h2 className="text-lg font-extrabold">Excluir ação</h2>
          <p className="text-sm text-ink/60">Remove a ação e todos os seus vídeos. Para só tirar do site, use o botão Inativo.</p>
        </div>
        <form action={deleteActionAction.bind(null, action.id)}>
          <ConfirmSubmit message={`Excluir a ação "${action.name}" e seus ${action.videos.length} vídeos?`} className={`${ui.btn} ${ui.danger}`}>
            Excluir ação
          </ConfirmSubmit>
        </form>
      </section>
    </div>
  );
}
