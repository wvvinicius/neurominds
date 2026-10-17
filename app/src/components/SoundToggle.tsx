"use client";

import { onHover, toggleSound, useSoundOn } from "@/lib/sound";

type Props = { variant?: "pill" | "round" };

/**
 * Interruptor único de som (NM-04). Desligado por padrão.
 * Quando ligado, as ondinhas do ícone pulsam.
 */
export function SoundToggle({ variant = "pill" }: Props) {
  const on = useSoundOn();

  const base =
    "flex items-center justify-center gap-2 transition-[background-color,transform] motion-safe:active:scale-90";
  const shape =
    variant === "round"
      ? "h-16 w-16 rounded-full"
      : "h-14 min-w-14 rounded-full px-4 text-base font-extrabold";
  const color = on
    ? "bg-nm-green-soft text-nm-green-deep hover:bg-nm-green-mid/40"
    : "bg-mist text-ink/70 hover:bg-fog";

  return (
    <button
      type="button"
      onClick={toggleSound}
      onPointerEnter={onHover}
      aria-label={on ? "Desligar som" : "Ligar som"}
      aria-pressed={on}
      className={`${base} ${shape} ${color}`}
    >
      <svg
        width={variant === "round" ? 30 : 22}
        height={variant === "round" ? 30 : 22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" className="motion-safe:animate-wave" />
            <path
              d="M18.5 5.5a9 9 0 0 1 0 13"
              className="motion-safe:animate-wave"
              style={{ animationDelay: "0.3s" }}
            />
          </>
        ) : (
          <>
            <path d="M22 9l-6 6" />
            <path d="M16 9l6 6" />
          </>
        )}
      </svg>
      {variant === "pill" && (
        <span className="hidden sm:inline">{on ? "Som" : "Sem som"}</span>
      )}
    </button>
  );
}
