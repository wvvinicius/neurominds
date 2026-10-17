import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modo de cache do Next 16 desligado de propósito: exige Suspense ou "use cache"
  // em toda leitura dinâmica e vai atrapalhar a troca de seed.json por Supabase.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
