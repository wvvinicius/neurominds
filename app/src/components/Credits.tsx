import { APP_VERSION } from "@/lib/version";

/** Linha de créditos dos rodapés: versão e "feito com amor pela Sunter". */
export function Credits() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-ink/40">
      <span>NeuroMinds v{APP_VERSION}</span>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        Feito com
        <svg width="12" height="12" viewBox="0 0 24 24" className="text-nm-red" fill="currentColor" aria-label="amor">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.5 5c2 0 3.4 1.1 4.3 2.4h2.4C14.1 6.1 15.5 5 17.5 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
        </svg>
        pela{" "}
        <a
          href="https://sunter.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="font-extrabold text-ink/60 underline-offset-4 hover:text-nm-blue-deep hover:underline"
        >
          Sunter
        </a>
      </span>
    </p>
  );
}
