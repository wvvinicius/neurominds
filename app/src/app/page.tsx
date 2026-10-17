import { ActionCard } from "@/components/ActionCard";
import { Footer } from "@/components/Footer";
import { FullscreenButton } from "@/components/FullscreenButton";
import { Logo } from "@/components/Logo";
import { SoundToggle } from "@/components/SoundToggle";
import { getActions } from "@/lib/data";

export default async function HomePage() {
  const actions = await getActions();

  return (
    <>
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
