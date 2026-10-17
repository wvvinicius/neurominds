"use client";

import Link from "next/link";
import type { Action, ActionColor } from "@/lib/data";
import { onHover, play } from "@/lib/sound";

/* Classes completas para o Tailwind enxergar. Texto branco só sobre azul, vermelho e verde. */
const colorClasses: Record<ActionColor, string> = {
  yellow: "bg-nm-yellow text-ink",
  blue: "bg-nm-blue text-paper",
  red: "bg-nm-red text-paper",
  green: "bg-nm-green text-paper",
};

type Props = { action: Action; index?: number };

export function ActionCard({ action, index = 0 }: Props) {
  return (
    <Link
      href={`/acao/${action.slug}`}
      onClick={() => play("pop")}
      onPointerEnter={onHover}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group flex aspect-square min-h-36 flex-col items-center justify-center gap-2 rounded-3xl p-4 shadow-md transition-[transform,box-shadow] duration-150 motion-safe:animate-pop motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl motion-safe:active:scale-95 ${colorClasses[action.color]}`}
    >
      <span
        className="text-6xl leading-none motion-safe:group-hover:animate-wiggle motion-safe:group-active:animate-wiggle sm:text-7xl"
        aria-hidden="true"
      >
        {action.emoji}
      </span>
      <span className="text-2xl font-extrabold sm:text-3xl">{action.name}</span>
    </Link>
  );
}
