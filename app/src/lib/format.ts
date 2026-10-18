/** Datas do SQLite vêm em UTC ("YYYY-MM-DD HH:MM:SS"). Mostramos no horário de Brasília. */
export function fmtDateTime(sqlite: string | null): string {
  if (!sqlite) return "—";
  const d = new Date(sqlite.replace(" ", "T") + "Z");
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function fmtDate(sqlite: string | null): string {
  if (!sqlite) return "—";
  const d = new Date(sqlite.replace(" ", "T") + "Z");
  return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function fmtDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} s` : `${m} min`;
}
