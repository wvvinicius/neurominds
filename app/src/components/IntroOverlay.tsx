"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { play, useSoundOn } from "@/lib/sound";
import { SoundToggle } from "./SoundToggle";

const KEY = "nm-intro-seen";
const VIDEO = "/intro/apresentacao-teo.mp4";

/* Mostrada uma vez por sessão do navegador. No servidor sempre renderiza, para aparecer na hora. */
const subscribe = () => () => {};
const seenOnClient = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const seenOnServer = () => false;

/**
 * Introdução com o Teo. Tela animada enquanto o vídeo carrega, vídeo com
 * botão de pular, some ao terminar. Som segue o interruptor global.
 */
export function IntroOverlay() {
  const seen = useSyncExternalStore(subscribe, seenOnClient, seenOnServer);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const soundOn = useSoundOn();
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.muted = !soundOn;
  }, [soundOn]);

  if (seen || gone) return null;

  const finish = () => {
    if (leaving) return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* sem storage: a intro aparece de novo no próximo carregamento */
    }
    setLeaving(true);
    // Timer em vez de onAnimationEnd: com reduced-motion a animação não roda.
    setTimeout(() => setGone(true), 420);
  };

  const skip = () => {
    play("tick");
    finish();
  };

  const replay = () => {
    play("pop");
    setEnded(false);
    if (ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(() => {});
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Apresentação do Teo"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper ${leaving ? "motion-safe:animate-fade-out" : ""}`}
    >
      <div className="nm-stripe absolute inset-x-0 top-0" aria-hidden="true" />

      {/* Vídeo: invisível até poder tocar, depois aparece com pop */}
      <div
        className={`relative w-full max-w-5xl px-4 transition-opacity duration-300 ${ready ? "opacity-100" : "pointer-events-none absolute opacity-0"}`}
      >
        <video
          ref={ref}
          src={VIDEO}
          autoPlay
          muted
          playsInline
          preload="auto"
          onCanPlay={() => setReady(true)}
          onEnded={() => {
            setEnded(true);
            play("done");
          }}
          onError={finish}
          className={`aspect-video w-full rounded-2xl bg-ink ${ready ? "motion-safe:animate-pop" : ""}`}
        />

        {/* Terminou: repetir ou seguir */}
        {ended && (
          <div className="absolute inset-4 flex flex-col items-center justify-center gap-5 rounded-2xl bg-ink/55 motion-safe:animate-pop sm:flex-row sm:gap-8">
            <button
              type="button"
              onClick={replay}
              className="flex h-20 min-w-48 items-center justify-center gap-3 rounded-full bg-paper px-8 text-2xl font-extrabold text-ink transition-[background-color,transform] hover:bg-mist motion-safe:active:scale-90"
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 4v5h5" />
              </svg>
              Repetir
            </button>
            <button
              type="button"
              onClick={skip}
              className="flex h-20 min-w-48 items-center justify-center gap-3 rounded-full bg-nm-green-deep px-8 text-2xl font-extrabold text-paper transition-[background-color,transform] hover:bg-nm-green motion-safe:active:scale-90"
            >
              Seguir
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tela de carregamento animada */}
      {!ready && (
        <div className="flex flex-col items-center gap-8">
          <Image
            src="/logo-mark.svg"
            alt=""
            width={240}
            height={144}
            priority
            unoptimized
            className="h-36 w-auto motion-safe:animate-pop"
          />
          <span className="font-display text-5xl tracking-[0.1em] text-ink/85 motion-safe:animate-slide-up">
            NEUROMINDS
          </span>
          <div className="flex items-center gap-3" aria-hidden="true">
            {[
              "bg-nm-yellow-mid",
              "bg-nm-blue-mid",
              "bg-nm-red-mid",
              "bg-nm-green-mid",
            ].map((c, i) => (
              <span
                key={c}
                className={`h-5 w-5 rounded-full motion-safe:animate-bounce-dot ${c}`}
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="text-xl font-extrabold text-ink/60" aria-live="polite">
            O Teo está chegando...
          </p>
        </div>
      )}

      {/* Controles: som e pular. "Pular" some quando o vídeo termina. */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3">
        {ready && <SoundToggle />}
        {!ended && (
          <button
            type="button"
            onClick={skip}
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-nm-blue-deep px-6 text-lg font-extrabold text-paper transition-[background-color,transform] hover:bg-nm-blue motion-safe:active:scale-90"
          >
            Pular
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M5 4l10 8-10 8z" />
              <rect x="17" y="4" width="3" height="16" rx="1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
