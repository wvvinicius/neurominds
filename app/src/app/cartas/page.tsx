import { AboutButton } from "@/components/AboutButton";
import { ActionCard } from "@/components/ActionCard";
import { BackButton } from "@/components/BackButton";
import { Footer } from "@/components/Footer";
import { FullscreenButton } from "@/components/FullscreenButton";
import { Logo } from "@/components/Logo";
import { SoundToggle } from "@/components/SoundToggle";
import { Track } from "@/components/Track";
import { getActions } from "@/lib/data";

/* Conteúdo vem do banco e muda pelo admin: nunca pré-renderizar. */
export const dynamic = "force-dynamic";

/** Biblioteca aberta de cartas, sem login. Usada no stand da Mostra. */
export default async function CardsPage() {
  const actions = await getActions();

  return (
    <>
      <Track type="open_home" />
      <div className="nm-stripe" aria-hidden="true" />
      <BackButton />
      <header className="flex items-center justify-between py-4 pl-24 pr-4 sm:pr-6">
        <div className="motion-safe:animate-slide-left">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <AboutButton />
          <SoundToggle />
          <FullscreenButton />
        </div>
      </header>

      <main className="flex-1 px-4 pb-8 sm:px-6">
        <h1 className="sr-only">Cartas de ações</h1>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {actions.map((action, i) => (
            <ActionCard key={action.id} action={action} index={i} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
