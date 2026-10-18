"use client";

import Image from "next/image";
import { useRef } from "react";
import { onHover, play } from "@/lib/sound";

/** Botão "?" que abre um resumo da NeuroMinds com o Teo ao lado. */
export function AboutButton() {
  const ref = useRef<HTMLDialogElement>(null);

  const open = () => {
    play("pop");
    ref.current?.showModal();
  };
  const close = () => {
    play("tick");
    ref.current?.close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        onPointerEnter={onHover}
        className="flex h-14 items-center justify-center rounded-full bg-mist px-4 text-base font-extrabold text-ink/70 transition-[background-color,transform] hover:bg-fog motion-safe:active:scale-90"
      >
        A NeuroMinds
      </button>

      <dialog
        ref={ref}
        onClick={(e) => e.target === ref.current && close()}
        className="m-auto w-[min(92vw,44rem)] rounded-3xl bg-paper p-0 text-ink shadow-none backdrop:bg-ink/40 open:motion-safe:animate-pop"
      >
        <div className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-stretch sm:gap-8 sm:p-8">
          <Image
            src="/teo-acenando.svg"
            alt="Teo acenando"
            width={184}
            height={248}
            unoptimized
            className="h-48 w-auto shrink-0 sm:h-60"
          />
          <div className="flex flex-1 flex-col gap-3">
            <h2 className="font-display text-4xl tracking-wide text-ink/85">Sobre a NeuroMinds</h2>
            <p className="text-base font-semibold leading-relaxed text-ink/80">
              A NeuroMinds é uma biblioteca de ações em vídeos curtos, feita para crianças com TEA.
              <br />
              Cada carta mostra uma ação, como chutar ou esperar, em vários contextos do dia a dia.
              <br />
              Profissionais montam uma prancha para cada criança e acompanham como ela usa.
              <br />
              Projeto educativo e sem fins lucrativos, nascido num trabalho escolar, com o Teo como guia.
            </p>
            <div className="mt-auto flex justify-end">
              <button
                type="button"
                onClick={close}
                autoFocus
                className="flex h-12 items-center justify-center rounded-full bg-nm-blue-deep px-6 text-base font-extrabold text-paper transition-[background-color,transform] hover:bg-nm-blue motion-safe:active:scale-90"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
