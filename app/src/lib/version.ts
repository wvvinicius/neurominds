import pkg from "../../package.json";

/**
 * Versão semântica do app, lida do package.json e mostrada nos rodapés.
 * Regra: minor sobe a cada spec entregue, patch a cada ajuste publicado.
 * 0.1 tela pública · 0.2 admin e métricas · 0.3 área do profissional.
 */
export const APP_VERSION: string = pkg.version;
