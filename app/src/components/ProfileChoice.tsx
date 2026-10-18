"use client";

import Link from "next/link";
import { onHover, play } from "@/lib/sound";

/** Escolha de perfil depois do vídeo: duas cartas grandes, no mesmo estilo das ações. */
export function ProfileChoice() {
  const card =
    "group flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl p-6 text-ink ring-4 ring-inset ring-paper/60 transition-[background-color,transform] duration-150 motion-safe:animate-pop motion-safe:active:scale-[0.97]";
  const emoji = "text-7xl leading-none motion-safe:group-hover:animate-wiggle motion-safe:group-active:animate-wiggle";

  return (
    <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <Link href="/pro/login" onClick={() => play("pop")} onPointerEnter={onHover} className={`${card} bg-nm-blue-mid hover:bg-nm-blue`}>
        <span className={emoji} aria-hidden="true">
          🧑‍⚕️
        </span>
        <span className="text-3xl font-extrabold">Sou profissional</span>
        <span className="text-sm font-extrabold text-ink/60">Monto painéis de verbos e acompanho o uso</span>
      </Link>
      <Link
        href="/aluno"
        onClick={() => play("pop")}
        onPointerEnter={onHover}
        style={{ animationDelay: "90ms" }}
        className={`${card} bg-nm-yellow-mid hover:bg-nm-yellow`}
      >
        <span className={emoji} aria-hidden="true">
          🧒
        </span>
        <span className="text-3xl font-extrabold">Sou aluno</span>
        <span className="text-sm font-extrabold text-ink/60">Quero abrir o meu painel de verbos</span>
      </Link>
    </div>
  );
}
