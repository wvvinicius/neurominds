"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionColor, Video } from "@/lib/data";
import { onHover, play, startWithSound, useSoundOn } from "@/lib/sound";
import { LoadingDots } from "./LoadingDots";
import { SoundToggle } from "./SoundToggle";
import { UnmuteHint } from "./UnmuteHint";

type Props = {
  videos: Video[];
  color: ActionColor;
  /** Pontos de extensão para a spec de métricas (NM-17). Sem uso por enquanto. */
  onPlay?: (video: Video) => void;
  onEnded?: (video: Video) => void;
  onChange?: (video: Video, index: number) => void;
};

type Dir = "next" | "prev";

const chipOn: Record<ActionColor, string> = {
  yellow: "bg-nm-yellow-mid text-ink",
  blue: "bg-nm-blue-mid text-ink",
  red: "bg-nm-red-mid text-ink",
  green: "bg-nm-green-mid text-ink",
};

const arrowBtn =
  "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-nm-blue-deep text-paper transition-[background-color,transform] hover:bg-nm-blue motion-safe:active:scale-90 sm:h-20 sm:w-20";

const SWIPE_PX = 60;

/**
 * Galeria de vídeos da ação. Um vídeo por vez, deslizando na direção do
 * movimento. Setas dão a volta no fim. Arrastar com o dedo também navega.
 * Nunca avança sozinho (FR-004).
 */
export function ActionPlayer({ videos, color, onPlay, onEnded, onChange }: Props) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<Dir>("next");
  const [turn, setTurn] = useState(0); // muda a cada navegação, para reanimar mesmo índice
  const soundOn = useSoundOn();
  const stageRef = useRef<{ replay: () => void } | null>(null);
  const swipeStart = useRef<number | null>(null);

  const total = videos.length;
  const video = videos[index];

  const go = (d: Dir) => {
    const next = d === "next" ? (index + 1) % total : (index - 1 + total) % total;
    play("tick");
    setDir(d);
    setIndex(next);
    setTurn((n) => n + 1);
    onChange?.(videos[next], next);
  };

  const jump = (i: number) => {
    if (i === index) return stageRef.current?.replay();
    play("tick");
    setDir(i > index ? "next" : "prev");
    setIndex(i);
    setTurn((n) => n + 1);
    onChange?.(videos[i], i);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (total < 2) return;
    if (dx <= -SWIPE_PX) go("next");
    else if (dx >= SWIPE_PX) go("prev");
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Palco: seta · vídeo · seta */}
      <div className="flex w-full max-w-6xl items-center gap-3 sm:gap-5">
        <button
          type="button"
          onClick={() => go("prev")}
          onPointerEnter={onHover}
          aria-label="Vídeo anterior"
          className={`${arrowBtn} hidden sm:flex`}
        >
          <IconChevron dir="left" />
        </button>

        <div
          className="min-w-0 flex-1 touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
        >
          <VideoStage
            key={`${video.id}-${turn}`}
            ref={stageRef}
            video={video}
            muted={!soundOn}
            enter={dir}
            onPlay={onPlay}
            onEnded={onEnded}
          />
        </div>

        <button
          type="button"
          onClick={() => go("next")}
          onPointerEnter={onHover}
          aria-label="Próximo vídeo"
          className={`${arrowBtn} hidden sm:flex`}
        >
          <IconChevron dir="right" />
        </button>
      </div>

      {/* Legenda (NM-05) */}
      {video.caption && (
        <p
          key={`cap-${video.id}-${turn}`}
          className="text-center text-2xl font-extrabold motion-safe:animate-slide-up sm:text-3xl"
        >
          {video.caption}
        </p>
      )}

      {/* Controles: anterior (só celular) · repetir · som · próximo (só celular) */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => go("prev")}
          aria-label="Vídeo anterior"
          className={`${arrowBtn} sm:hidden`}
        >
          <IconChevron dir="left" />
        </button>

        <button
          type="button"
          onClick={() => stageRef.current?.replay()}
          onPointerEnter={onHover}
          aria-label="Repetir este vídeo"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-nm-yellow-soft text-nm-yellow-deep transition-[background-color,transform] hover:bg-nm-yellow-mid motion-safe:active:scale-90"
        >
          <IconReplay size={32} />
        </button>

        <SoundToggle variant="round" />

        <button
          type="button"
          onClick={() => go("next")}
          aria-label="Próximo vídeo"
          className={`${arrowBtn} sm:hidden`}
        >
          <IconChevron dir="right" />
        </button>
      </div>

      {/* Fichas: uma por vídeo, toque pula direto */}
      <div className="flex max-w-full flex-wrap items-center justify-center gap-2 px-2" role="tablist" aria-label="Vídeos">
        {videos.map((v, i) => {
          const on = i === index;
          return (
            <button
              key={v.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={`Vídeo ${i + 1}${v.caption ? `: ${v.caption}` : ""}`}
              onClick={() => jump(i)}
              onPointerEnter={onHover}
              className={`flex h-14 min-w-14 items-center justify-center gap-2 rounded-full px-4 text-base font-extrabold transition-[background-color,transform] duration-200 motion-safe:active:scale-90 ${on ? `${chipOn[color]} scale-110` : "bg-mist text-ink/60 hover:bg-fog"}`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${on ? "bg-paper/70" : "bg-paper"}`}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {v.caption && <span className="hidden sm:inline">{v.caption}</span>}
            </button>
          );
        })}
      </div>

      <span className="sr-only" aria-live="polite">
        Vídeo {index + 1} de {total}
      </span>
    </div>
  );
}

/* ---------- palco de um vídeo ---------- */

type StageProps = {
  video: Video;
  muted: boolean;
  enter: Dir;
  ref: React.Ref<{ replay: () => void }>;
  onPlay?: (video: Video) => void;
  onEnded?: (video: Video) => void;
};

function VideoStage({ video, muted, enter, ref, onPlay, onEnded }: StageProps) {
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [missing, setMissing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const el = useRef<HTMLVideoElement>(null);
  const started = useRef(false);

  // React não sincroniza a propriedade `muted` de forma confiável; fazemos à mão.
  useEffect(() => {
    if (el.current) el.current.muted = muted;
  }, [muted]);

  // Expõe "repetir" para o pai sem precisar de estado compartilhado.
  useEffect(() => {
    const api = {
      replay: () => {
        if (!el.current || missing) return;
        play("pop");
        el.current.currentTime = 0;
        startWithSound(el.current).then(setBlocked);
      },
    };
    if (typeof ref === "function") ref(api);
    else if (ref) ref.current = api;
  }, [ref, missing]);

  // canplay dispara de novo após seek; inicia só uma vez.
  const start = () => {
    if (started.current || !el.current) return;
    started.current = true;
    setLoading(false);
    startWithSound(el.current).then(setBlocked);
  };

  const unmute = () => {
    if (el.current) el.current.muted = false;
    setBlocked(false);
  };

  const togglePlay = () => {
    if (!el.current) return;
    if (el.current.paused) el.current.play().catch(() => setPaused(true));
    else el.current.pause();
  };

  const replay = () => {
    if (!el.current) return;
    play("pop");
    el.current.currentTime = 0;
    startWithSound(el.current).then(setBlocked);
  };

  const enterClass = enter === "next" ? "motion-safe:animate-slide-in-right" : "motion-safe:animate-slide-in-left";

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-ink ${enterClass}`}>
      <video
        ref={el}
        src={video.src}
        playsInline
        preload="auto"
        onCanPlay={start}
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
        onWaiting={() => setLoading(true)}
        onPlaying={() => setLoading(false)}
        onError={() => {
          setMissing(true);
          setLoading(false);
        }}
        className="aspect-video w-full"
      />

      {/* Preparando o vídeo: pontos saltando sobre o palco */}
      {loading && !missing && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
          <div className="rounded-full bg-paper px-6 py-4">
            <LoadingDots size="sm" />
          </div>
        </div>
      )}

      {blocked && !missing && !ended && <UnmuteHint onClick={unmute} />}

      {/* Arquivo ainda não existe: cartão amigável, navegação continua */}
      {missing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-nm-blue-soft p-6 text-center">
          <span className="text-7xl motion-safe:animate-wiggle" aria-hidden="true">
            🎬
          </span>
          <p className="text-2xl font-extrabold text-ink">Esse vídeo está chegando!</p>
          {video.caption && <p className="text-lg font-extrabold text-ink/60">{video.caption}</p>}
        </div>
      )}

      {/* Terminou ou pausou: botão grande para ver de novo ou continuar */}
      {!missing && (ended || paused) && (
        <button
          type="button"
          onClick={ended ? replay : togglePlay}
          aria-label={ended ? "Ver de novo" : "Continuar"}
          className="absolute inset-0 flex items-center justify-center bg-ink/30"
        >
          <span
            className={`flex h-24 w-24 items-center justify-center rounded-full motion-safe:animate-pop ${ended ? "bg-nm-yellow-soft text-nm-yellow-deep" : "bg-paper text-ink"}`}
          >
            <span className={ended ? "motion-safe:animate-pulse-soft" : ""}>
              {ended ? <IconReplay size={44} /> : <IconPlay />}
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

/* Ícones inline. Sem biblioteca. */
const svgProps = {
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
    <svg {...svgProps} width={34} height={34} strokeWidth={3}>
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

function IconReplay({ size }: { size: number }) {
  return (
    <svg {...svgProps} width={size} height={size}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}
