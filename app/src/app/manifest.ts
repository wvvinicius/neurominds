import type { MetadataRoute } from "next";

/** Ícone de tela inicial e nome ao "adicionar à tela de início" no tablet (NM-44). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NeuroMinds",
    short_name: "NeuroMinds",
    description: "Cartas de ações com vídeos curtos para crianças com TEA.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "pt-BR",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
