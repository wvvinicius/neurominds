"use client";

import { useState } from "react";
import { ui } from "@/components/admin/ui";

export function CopyButton({ text, label = "Copiar link" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      window.prompt("Copie o link:", text);
    }
  };
  return (
    <button type="button" onClick={copy} className={`${ui.btn} ${done ? ui.success : ui.primary}`}>
      {done ? "Copiado!" : label}
    </button>
  );
}
