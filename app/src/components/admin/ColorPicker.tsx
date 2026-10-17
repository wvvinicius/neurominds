import { ACTION_COLORS, type ActionColor } from "@/lib/types";
import { colorDot, colorLabel } from "./ui";

/** Quatro bolinhas nas cores da logo. Radio nativo, sem JS. */
export function ColorPicker({ name = "color", value }: { name?: string; value?: ActionColor }) {
  return (
    <div className="flex gap-3">
      {ACTION_COLORS.map((c) => (
        <label key={c} className="cursor-pointer">
          <input type="radio" name={name} value={c} defaultChecked={value === c} className="peer sr-only" />
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ring-4 ring-transparent transition-[box-shadow,transform] peer-checked:ring-ink/80 peer-checked:scale-110 peer-focus-visible:ring-nm-blue-deep ${colorDot[c]}`}
            title={colorLabel[c]}
          >
            <span className="sr-only">{colorLabel[c]}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
