/**
 * Única porta de leitura de ações e vídeos (FR-010 da spec 001).
 * Fase 1: lê de src/data/seed.json.
 * Quando o admin existir (NM-12, NM-13), estas duas funções passam a consultar
 * o Supabase. As telas não mudam.
 */
import seed from "@/data/seed.json";

export type ActionColor = "yellow" | "blue" | "red" | "green";

export type Video = {
  id: string;
  /** URL absoluta ou caminho em /public, ex.: /videos/chutar/chutar-bola-campo.mp4 */
  src: string;
  caption?: string;
  sortOrder: number;
  isActive: boolean;
};

export type Action = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: ActionColor;
  sortOrder: number;
  isActive: boolean;
  videos: Video[];
};

const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder;

function normalize(action: Action): Action {
  return {
    ...action,
    videos: action.videos.filter((v) => v.isActive).sort(bySortOrder),
  };
}

export async function getActions(): Promise<Action[]> {
  const actions = seed.actions as Action[];
  return actions.filter((a) => a.isActive).sort(bySortOrder).map(normalize);
}

export async function getActionBySlug(slug: string): Promise<Action | null> {
  const actions = await getActions();
  return actions.find((a) => a.slug === slug) ?? null;
}
