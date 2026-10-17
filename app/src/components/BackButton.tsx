"use client";

import Link from "next/link";
import { onHover, play } from "@/lib/sound";

/**
 * Botão de voltar (NM-03): sempre no canto superior esquerdo, 64 px,
 * mesmo ícone em todas as telas.
 */
export function BackButton() {
  return (
    <Link
      href="/"
      aria-label="Voltar para as cartas"
      onClick={() => play("tick")}
      onPointerEnter={onHover}
      className="fixed left-4 top-4 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-nm-blue-deep text-paper transition-[background-color,transform] hover:bg-nm-blue motion-safe:animate-slide-left motion-safe:active:scale-90"
    >
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
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
    </Link>
  );
}
