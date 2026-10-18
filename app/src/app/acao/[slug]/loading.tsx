import { BackButton } from "@/components/BackButton";
import { LoadingDots } from "@/components/LoadingDots";

/** Loading de rota: aparece enquanto a tela da ação é montada. */
export default function Loading() {
  return (
    <>
      <div className="nm-stripe" aria-hidden="true" />
      <BackButton href="/cartas" />
      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <LoadingDots label="Abrindo a carta..." />
      </main>
    </>
  );
}
