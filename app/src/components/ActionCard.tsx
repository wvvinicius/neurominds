"use client";

import Link from "next/link";
import type { Action, ActionColor } from "@/lib/data";
import { onHover, play } from "@/lib/sound";

/* Classes completas para o Tailwind enxergar. Fundo suave, emoji em disco branco, texto escuro. */
const colorClasses: Record<ActionColor, { card: string; label: string }> = {
  yellow: { card: "bg-nm-yellow-soft hover:bg-nm-yellow-mid/40", label: "text-nm-yellow-deep" },
  blue: { card: "bg-nm-blue-soft hover:bg-nm-blue-mid/40", label: "text-nm-blue-deep" },
  red: { card: "bg-nm-red-soft hover:bg-nm-red-mid/40", label: "text-nm-red-deep" },
  green: { card: "bg-nm-green-soft hover:bg-nm-green-mid/40", label: "text-nm-green-deep" },
};

type Props = { action: Action; index?: number };

export function ActionCard({ action, index = 0 }: Props) {
  const c = colorClasses[action.color];
  return (
    <Link
      href={`/acao/${action.slug}`}
      onClick={() => play("pop")}
      onPointerEnter={onHover}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group flex aspect-square min-h-36 flex-col items-center justify-center gap-3 rounded-2xl p-4 transition-[background-color,transform] duration-150 motion-safe:animate-pop motion-safe:active:scale-[0.97] ${c.card}`}
    >
      <span
        className="flex h-24 w-24 items-center justify-center rounded-full bg-paper text-5xl leading-none motion-safe:group-hover:animate-wiggle motion-safe:group-active:animate-wiggle sm:h-28 sm:w-28 sm:text-6xl"
        aria-hidden="true"
      >
        {action.emoji}
      </span>
      <span className={`text-2xl font-extrabold sm:text-3xl ${c.label}`}>{action.name}</span>
    </Link>
  );
}
