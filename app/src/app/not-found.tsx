import { BackButton } from "@/components/BackButton";

export default function NotFound() {
  return (
    <>
      <BackButton />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center motion-safe:animate-pop">
        <span className="text-7xl" aria-hidden="true">
          🃏
        </span>
        <p className="text-2xl font-extrabold">Essa carta não existe.</p>
        <p className="text-lg text-ink/60">Toque na seta para voltar às cartas.</p>
      </main>
    </>
  );
}
