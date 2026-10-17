"use client";

import { useSyncExternalStore } from "react";

/**
 * Som do app: um único interruptor, LIGADO por padrão, lembrado no aparelho.
 * Controla o áudio dos vídeos e os efeitos sonoros da interface.
 * Efeitos são sintetizados com Web Audio: sem arquivos, sem download.
 *
 * Limite do navegador: antes do primeiro toque na página, vídeo só toca mudo.
 * `startWithSound` tenta com som e cai para mudo se for barrado.
 */

const KEY = "nm-sound";
const listeners = new Set<() => void>();

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

/**
 * Inicia o vídeo respeitando o interruptor. Retorna true se o navegador
 * barrou o áudio (vídeo seguiu mudo) e a tela deve oferecer "toque para ouvir".
 */
export async function startWithSound(el: HTMLVideoElement): Promise<boolean> {
  el.muted = !isSoundOn();
  try {
    await el.play();
    return false;
  } catch {
    el.muted = true;
    el.play().catch(() => {});
    return isSoundOn();
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* modo privado ou storage bloqueado: segue só em memória */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const serverDefault = () => true;

export function useSoundOn(): boolean {
  return useSyncExternalStore(subscribe, isSoundOn, serverDefault);
}

/* ---------- Sintetizador ---------- */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

type Wave = OscillatorType;

function tone(
  freq: number,
  dur: number,
  opts: { type?: Wave; gain?: number; slideTo?: number; delay?: number } = {},
) {
  const ac = getCtx();
  if (!ac) return;
  const { type = "sine", gain = 0.18, slideTo, delay = 0 } = opts;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const sfx = {
  /** Mouse passou por cima: blip bem curto e suave. */
  hover: () => tone(880, 0.05, { type: "triangle", gain: 0.06, slideTo: 1100 }),
  /** Toque em carta: "pop" subindo. */
  pop: () => tone(440, 0.14, { slideTo: 880, gain: 0.2 }),
  /** Próximo / anterior: tick curto. */
  tick: () => tone(600, 0.06, { type: "triangle", gain: 0.12 }),
  /** Som ligado: duas notas subindo. */
  on: () => {
    tone(523, 0.1);
    tone(784, 0.16, { delay: 0.09 });
  },
  /** Som desligado: duas notas descendo. */
  off: () => {
    tone(784, 0.1);
    tone(523, 0.16, { delay: 0.09 });
  },
  /** Vídeo terminou: "ding" suave. */
  done: () => {
    tone(659, 0.12, { gain: 0.14 });
    tone(988, 0.24, { gain: 0.14, delay: 0.12 });
  },
};

export type Sfx = keyof typeof sfx;

/** Toca um efeito, só se o som estiver ligado. Nunca lança erro. */
export function play(name: Sfx) {
  if (!isSoundOn()) return;
  try {
    sfx[name]();
  } catch {
    /* sem áudio disponível */
  }
}

/**
 * Handler de hover para onPointerEnter. Só toca com mouse de verdade:
 * no tablet o toque dispara pointerenter antes do click e o som dobraria.
 */
export function onHover(e: { pointerType: string }) {
  if (e.pointerType === "mouse") play("hover");
}

/** Alterna o som e dá o feedback sonoro da própria troca. */
export function toggleSound() {
  const next = !isSoundOn();
  setSoundOn(next);
  try {
    if (next) sfx.on();
    else sfx.off();
  } catch {
    /* sem áudio disponível */
  }
}
