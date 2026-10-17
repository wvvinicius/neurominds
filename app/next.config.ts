import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Modo de cache do Next 16 desligado de propósito: exige Suspense ou "use cache"
  // em toda leitura dinâmica; o conteúdo vem do banco e muda pelo admin.
  cacheComponents: false,
  partialPrefetching: false,
  // libSQL tem binário nativo; não pode ser empacotado pelo bundler.
  serverExternalPackages: ["@libsql/client", "libsql"],
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
