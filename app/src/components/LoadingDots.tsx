/**
 * Indicador de espera: quatro pontos nas cores da logo saltando em sequência.
 * Usar sempre que a criança precisar esperar (vídeo preparando, troca de tela).
 */
export function LoadingDots({ label, size = "md" }: { label?: string; size?: "sm" | "md" }) {
  const dot = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex flex-col items-center gap-4" role="status">
      <div className="flex items-center gap-3" aria-hidden="true">
        {["bg-nm-yellow-mid", "bg-nm-blue-mid", "bg-nm-red-mid", "bg-nm-green-mid"].map((c, i) => (
          <span
            key={c}
            className={`${dot} rounded-full motion-safe:animate-bounce-dot ${c}`}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      {label && <p className="text-xl font-extrabold text-ink/60">{label}</p>}
      <span className="sr-only">{label ?? "Carregando"}</span>
    </div>
  );
}
