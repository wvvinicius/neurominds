/**
 * Versão semântica do app, vinda do package.json via next.config.ts.
 * Regra: minor sobe a cada spec entregue, patch a cada ajuste publicado.
 * 0.1 tela pública · 0.2 admin e métricas · 0.3 área do profissional.
 */
export const APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
