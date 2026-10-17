/**
 * Tipos e constantes compartilhados entre servidor e navegador.
 * Sem imports: pode ser usado em Client Components sem puxar o banco.
 */

export type ActionColor = "yellow" | "blue" | "red" | "green";
export const ACTION_COLORS: ActionColor[] = ["yellow", "blue", "red", "green"];

export type Video = {
  id: string;
  /** URL absoluta (Blob) ou caminho em /public, ex.: /videos/chutar/chutar-futebol.mp4 */
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
