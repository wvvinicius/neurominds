"use client";

import Link from "next/link";
import type { Action, ActionColor } from "@/lib/types";
import { onHover, play } from "@/lib/sound";

/* Classes completas para o Tailwind enxergar. Carta inteira na cor média, texto escuro. */
const colorClasses: Record<ActionColor, string> = {
  yellow: "bg-nm-yellow-mid hover:bg-nm-yellow",
  blue: "bg-nm-blue-mid hover:bg-nm-blue",
  red: "bg-nm-red-mid hover:bg-nm-red",
  green: "bg-nm-green-mid hover:bg-nm-green",
};

type Props = { action: Action; index?: number; href?: string };

export function ActionCard({ action, index = 0, href }: Props) {
  return (
    <Link
      href={href ?? `/acao/${action.slug}`}
      onClick={() => play("pop")}
      onPointerEnter={onHover}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group flex aspect-square min-h-36 flex-col items-center justify-center gap-2 rounded-2xl p-4 text-ink ring-4 ring-inset ring-paper/60 transition-[background-color,transform] duration-150 motion-safe:animate-pop motion-safe:active:scale-[0.97] ${colorClasses[action.color]}`}
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
