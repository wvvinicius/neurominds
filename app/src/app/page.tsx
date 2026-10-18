import Link from "next/link";
import { AboutButton } from "@/components/AboutButton";
import { Footer } from "@/components/Footer";
import { FullscreenButton } from "@/components/FullscreenButton";
import { IntroOverlay } from "@/components/IntroOverlay";
import { Logo } from "@/components/Logo";
import { ProfileChoice } from "@/components/ProfileChoice";
import { SoundToggle } from "@/components/SoundToggle";

export const dynamic = "force-dynamic";

/** Entrada do site: vídeo do Teo e depois a escolha de perfil. */
export default function HomePage() {
  return (
    <>
      <IntroOverlay />
      <div className="nm-stripe" aria-hidden="true" />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="motion-safe:animate-slide-left">
          <Logo />
        </div>
        <div className="flex items-center gap-2">
          <AboutButton />
          <SoundToggle />
          <FullscreenButton />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-8 sm:px-6">
        <h1 className="text-center font-display text-4xl tracking-wide text-ink/85 motion-safe:animate-slide-up sm:text-5xl">
          Quem está aqui?
        </h1>
        <ProfileChoice />
        <Link
          href="/cartas"
          className="text-base font-extrabold text-ink/50 underline-offset-4 transition-colors hover:text-nm-blue-deep hover:underline"
        >
          Só quero ver as cartas
        </Link>
      </main>

      <Footer />
    </>
  );
}
