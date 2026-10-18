import type { NextConfig } from "next";
import pkg from "./package.json" with { type: "json" };

const nextConfig: NextConfig = {
  // Versão semântica do package.json, mostrada nos rodapés.
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version },
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
