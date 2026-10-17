"use client";

import { useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/data";
import { onHover, play, useSoundOn } from "@/lib/sound";
import { SoundToggle } from "./SoundToggle";

type Props = {
  videos: Video[];
  /** Pontos de extensão para a spec de métricas (NM-17). Sem uso por enquanto. */
  onPlay?: (video: Video) => void;
  onEnded?: (video: Video) => void;
  onChange?: (video: Video, index: number) => void;
};

const btn =
  "flex h-16 w-16 items-center justify-center rounded-full shadow-md transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-90 disabled:opacity-30 disabled:shadow-none disabled:hover:scale-100";

/**
 * Um vídeo por vez. Começa mudo. Nunca avança sozinho (FR-004).
 * O estado de cada vídeo vive em <VideoStage key={video.id}>, então trocar de
 * vídeo zera tudo sem precisar de effect.
 */
export function ActionPlayer({ videos, onPlay, onEnded, onChange }: Props) {
  const [index, setIndex] = useState(0);
  const soundOn = useSoundOn();

  const video = videos[index];
  const total = videos.length;

  const go = (next: number) => {
    if (next < 0 || next >= total) return;
    play("tick");
    setIndex(next);
    onChange?.(videos[next], next);
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <VideoStage
        key={video.id}
        video={video}
        muted={!soundOn}
        onPlay={onPlay}
        onEnded={onEnded}
      />

      {/* Legenda (NM-05) */}
      {video.caption && (
        <p
          key={`cap-${video.id}`}
          className="text-center text-2xl font-extrabold motion-safe:animate-slide-up"
        >
          {video.caption}
        </p>
      )}

      {/* Controles: anterior · som · próximo */}
      <div
        className="flex items-center gap-6 motion-safe:animate-slide-up"
        style={{ animationDelay: "120ms" }}
      >
        <button
          type="button"
          onClick={() => go(index - 1)}
          onPointerEnter={index > 0 ? onHover : undefined}
          disabled={index === 0}
          aria-label="Vídeo anterior"
          className={`${btn} bg-nm-blue text-paper`}
        >
          <IconChevron dir="left" />
        </button>

        <SoundToggle variant="round" />

        <button
          type="button"
          onClick={() => go(index + 1)}
          onPointerEnter={index < total - 1 ? onHover : undefined}
          disabled={index === total - 1}
          aria-label="Próximo vídeo"
          className={`${btn} bg-nm-blue text-paper`}
        >
          <IconChevron dir="right" />
        </button>
      </div>

      {/* Indicador "n de total" */}
      <div className="flex items-center gap-3" aria-live="polite">
        <span className="text-lg font-extrabold text-ink/60">
          {index + 1} de {total}
        </span>
        <span className="flex gap-2" aria-hidden="true">
          {videos.map((v, i) => (
            <span
              key={v.id}
              className={`h-3 w-3 rounded-full transition-[background-color,transform] duration-200 ${i === index ? "scale-125 bg-nm-blue" : "bg-ink/15"}`}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

type StageProps = {
  video: Video;
  muted: boolean;
  onPlay?: (video: Video) => void;
  onEnded?: (video: Video) => void;
};

function VideoStage({ video, muted, onPlay, onEnded }: StageProps) {
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  // React não sincroniza a propriedade `muted` de forma confiável; fazemos à mão.
  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  const doPlay = () => ref.current?.play().catch(() => setPaused(true));

  const replay = () => {
    if (!ref.current) return;
    play("pop");
    ref.current.currentTime = 0;
    doPlay();
  };

  const togglePlay = () => {
    if (!ref.current) return;
    if (ref.current.paused) doPlay();
    else ref.current.pause();
  };

  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-ink shadow-lg motion-safe:animate-pop">
      <video
        ref={ref}
        src={video.src}
        playsInline
        preload="auto"
        autoPlay
        muted
        onClick={togglePlay}
        onPlay={() => {
          setPaused(false);
          setEnded(false);
          onPlay?.(video);
        }}
        onPause={() => setPaused(true)}
        onEnded={() => {
          setEnded(true);
          play("done");
          onEnded?.(video);
        }}
        onError={() => setError(true)}
        className="aspect-video w-full"
      />

      {/* Erro de carregamento: mensagem curta, navegação continua */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/80 p-6 text-center text-xl font-extrabold text-paper">
          Não deu para carregar este vídeo.
        </div>
      )}

      {/* Terminou ou pausou: botão grande para ver de novo ou continuar */}
      {!error && (ended || paused) && (
        <button
          type="button"
          onClick={ended ? replay : togglePlay}
          aria-label={ended ? "Ver de novo" : "Continuar"}
          onPointerEnter={onHover}
          className="absolute inset-0 flex items-center justify-center bg-ink/30"
        >
          <span
            className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg motion-safe:animate-pop ${ended ? "bg-nm-yellow text-ink" : "bg-paper text-ink"}`}
          >
            <span className={ended ? "motion-safe:animate-pulse-soft" : ""}>
              {ended ? <IconReplay /> : <IconPlay />}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* Ícones inline. Sem biblioteca. */
const svgProps = {
  width: 32,
  height: 32,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function IconChevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg {...svgProps}>
      {dir === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

function IconPlay() {
  return (
    <svg {...svgProps} width={44} height={44} fill="currentColor" stroke="none">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function IconReplay() {
  return (
    <svg {...svgProps} width={44} height={44}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}
