"use client";

/**
 * Aparece quando o navegador barrou o áudio automático (antes do primeiro
 * toque na página). Um toque libera o som do vídeo.
 */
export function UnmuteHint({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-1/2 top-4 flex h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-paper px-5 text-lg font-extrabold text-ink motion-safe:animate-pop motion-safe:active:scale-90"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
      Toque para ouvir
    </button>
  );
}
