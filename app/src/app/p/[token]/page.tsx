import { notFound } from "next/navigation";
import { ActionCard } from "@/components/ActionCard";
import { BoardSession } from "@/components/BoardSession";
import { Footer } from "@/components/Footer";
import { FullscreenButton } from "@/components/FullscreenButton";
import { Logo } from "@/components/Logo";
import { SoundToggle } from "@/components/SoundToggle";
import { Track } from "@/components/Track";
import { getBoardByToken } from "@/lib/pro";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props) {
  const { token } = await params;
  const board = await getBoardByToken(token);
  return { title: board ? `${board.student.nickname} · NeuroMinds` : "NeuroMinds", robots: { index: false } };
}

/** Prancha da criança (NM-23): só as ações escolhidas pelo profissional. Sem login. */
export default async function BoardPage({ params }: Props) {
  const { token } = await params;
  const board = await getBoardByToken(token);
  if (!board) notFound();

  return (
    <>
      <BoardSession token={token} />
      <Track type="open_home" />
      <div className="nm-stripe" aria-hidden="true" />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="motion-safe:animate-slide-left">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <FullscreenButton />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 sm:px-6">
        <h1 className="mb-5 flex items-center justify-center gap-3 font-display text-4xl tracking-wide motion-safe:animate-slide-up sm:text-5xl">
          <span className="inline-block motion-safe:animate-wiggle" style={{ animationDelay: "250ms" }} aria-hidden="true">
            👋
          </span>
          Oi, {board.student.nickname}!
        </h1>

        {board.actions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 pt-6 text-center motion-safe:animate-pop">
            <span className="text-7xl" aria-hidden="true">
              🧩
            </span>
            <p className="text-2xl font-extrabold">Sua prancha ainda está sendo montada.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {board.actions.map((action, i) => (
              <ActionCard key={action.id} action={action} index={i} href={`/p/${token}/acao/${action.slug}`} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
