import { APP_VERSION } from "@/lib/version";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-1 px-4 py-6 text-center text-sm text-ink/50">
      <p>Este site não coleta dados pessoais. Registramos apenas quais vídeos foram vistos, de forma anônima.</p>
      <p className="text-xs text-ink/40">NeuroMinds v{APP_VERSION}</p>
    </footer>
  );
}
