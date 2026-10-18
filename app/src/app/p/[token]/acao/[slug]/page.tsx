import { notFound } from "next/navigation";
import { ActionPlayer } from "@/components/ActionPlayer";
import { BackButton } from "@/components/BackButton";
import { BoardSession } from "@/components/BoardSession";
import { Track } from "@/components/Track";
import { getBoardByToken } from "@/lib/pro";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { token, slug } = await params;
  const board = await getBoardByToken(token);
  const action = board?.actions.find((a) => a.slug === slug);
  return { title: action ? `${action.name} · NeuroMinds` : "NeuroMinds", robots: { index: false } };
}

/** Ação dentro da prancha da criança. Igual à tela pública, com volta para a prancha. */
export default async function BoardActionPage({ params }: Props) {
  const { token, slug } = await params;
  const board = await getBoardByToken(token);
  const action = board?.actions.find((a) => a.slug === slug);
  if (!board || !action) notFound();

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <BoardSession token={token} />
      <Track type="open_action" actionId={action.id} />
      <div className="nm-stripe shrink-0" aria-hidden="true" />
      <BackButton href={`/p/${token}`} />

      <header className="flex shrink-0 items-center justify-center px-24 py-3 sm:py-4">
        <h1 className="flex items-center gap-3 font-display text-4xl tracking-wide motion-safe:animate-slide-up sm:text-5xl">
          <span className="inline-block motion-safe:animate-wiggle" style={{ animationDelay: "250ms" }} aria-hidden="true">
            {action.emoji}
          </span>
          {action.name}
        </h1>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center px-4 pb-4 sm:px-6">
        {action.videos.length > 0 ? (
          <ActionPlayer videos={action.videos} color={action.color} actionId={action.id} />
        ) : (
          <div className="flex max-w-md flex-col items-center gap-4 pt-10 text-center motion-safe:animate-pop">
            <span className="text-7xl" aria-hidden="true">
              🎬
            </span>
            <p className="text-2xl font-extrabold">Os vídeos de {action.name.toLowerCase()} ainda estão chegando.</p>
          </div>
        )}
      </main>
    </div>
  );
}
