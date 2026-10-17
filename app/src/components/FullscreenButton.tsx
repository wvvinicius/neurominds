"use client";

import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  document.addEventListener("fullscreenchange", cb);
  return () => document.removeEventListener("fullscreenchange", cb);
};
const isActive = () => !!document.fullscreenElement;
const isSupported = () => !!document.documentElement.requestFullscreen;
const serverFalse = () => false;

/** Modo stand (NM-08): coloca o navegador em tela cheia para o tablet da Mostra. */
export function FullscreenButton() {
  const active = useSyncExternalStore(subscribe, isActive, serverFalse);
  const supported = useSyncExternalStore(subscribe, isSupported, serverFalse);

  if (!supported) return null;

  const toggle = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* alguns navegadores em tablet negam; sem consequência */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full border-2 border-ink/15 px-4 text-base font-extrabold text-ink/70 transition-transform motion-safe:active:scale-95"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {active ? (
          <>
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </>
        ) : (
          <>
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
          </>
        )}
      </svg>
      <span className="hidden sm:inline">{active ? "Sair" : "Tela cheia"}</span>
    </button>
  );
}
