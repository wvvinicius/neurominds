/* Classes compartilhadas do admin. Mesmos tokens do site, versão utilitária. */
export const ui = {
  input:
    "h-12 w-full rounded-xl border-2 border-fog bg-paper px-4 text-base font-semibold text-ink outline-none transition-colors focus:border-nm-blue-deep",
  label: "mb-1 block text-sm font-extrabold text-ink/60",
  btn: "inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-base font-extrabold transition-[background-color,transform] motion-safe:active:scale-95 disabled:opacity-40",
  primary: "bg-nm-blue-deep text-paper hover:bg-nm-blue",
  secondary: "bg-mist text-ink/80 hover:bg-fog",
  success: "bg-nm-green-soft text-nm-green-deep hover:bg-nm-green-mid/50",
  danger: "bg-nm-red-soft text-nm-red-deep hover:bg-nm-red-mid/50",
  icon: "inline-flex h-11 w-11 items-center justify-center rounded-full bg-mist text-ink/70 transition-[background-color,transform] hover:bg-fog motion-safe:active:scale-90 disabled:opacity-30",
  card: "rounded-2xl bg-paper p-5 ring-1 ring-fog",
  error: "rounded-xl bg-nm-red-soft px-4 py-3 text-sm font-extrabold text-nm-red-deep",
  h2: "font-display text-3xl tracking-wide text-ink/85",
};

export const colorDot: Record<string, string> = {
  yellow: "bg-nm-yellow-mid",
  blue: "bg-nm-blue-mid",
  red: "bg-nm-red-mid",
  green: "bg-nm-green-mid",
};

export const colorLabel: Record<string, string> = {
  yellow: "Amarelo",
  blue: "Azul",
  red: "Vermelho",
  green: "Verde",
};
