// V07 — Levantar a tampa do vaso sanitário. De lado, no banheiro (mesmo vaso do V05, em obj-lote1.js).
// Cada repetição: inclina, pega a beirada da tampa fechada e levanta devagar até ela encostar na caixa ("toc").
// Volta rápida: abaixa a tampa de novo.
const B = require('../lib/base');
const { banheiro } = require('../lib/cenario');
const { cenaVaso } = require('./obj-lote1');

const ABERTA = 95, T_ENCOSTA = 0.6;
function angTampa(u) {
  if (u < 0.22) return 0;
  if (u < T_ENCOSTA) return ABERTA * B.ease((u - 0.22) / (T_ENCOSTA - 0.22)) ** 1.15;
  if (u < 0.84) return ABERTA;
  return B.kf([[0.84, ABERTA], [0.95, 0]], u);
}

module.exports = {
  id: 'V07', slug: 'levantar-tampa-vaso', acao: 'Levantar', contexto: 'Levantar a tampa do vaso sanitário',
  criar() {
    const cen = banheiro();
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.24) * B.CICLO, tipo: 'range' },
        { t: (i + T_ENCOSTA) * B.CICLO, tipo: 'toc' },
        { t: (i + 0.84) * B.CICLO, tipo: 'desce' },
        { t: (i + 0.95) * B.CICLO, tipo: 'fecha' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const ang = angTampa(u);
        const naTampa = B.kf([[0, 0], [0.1, 0], [0.2, 1], [T_ENCOSTA, 1], [0.7, 0], [0.8, 0], [0.84, 1], [0.95, 1], [1, 0]], u);
        const contato = B.kf([[0, 150], [0.22, 150], [T_ENCOSTA, 82], [0.84, 82], [0.95, 150], [1, 150]], u);
        const corpo = B.kf([[0, [0, 0]], [0.1, [0, 0]], [0.2, [36, 30]], [0.4, [34, 22]], [T_ENCOSTA, [32, 8]], [0.72, [0, 0]], [0.8, [0, 0]], [0.84, [32, 8]], [0.95, [36, 30]], [1, [0, 0]]], u);
        const feliz = u > T_ENCOSTA && u < 0.82;
        const expr = u < 0.1 ? 'feliz' : u < T_ENCOSTA ? 'concentrado' : feliz ? (u < 0.72 ? 'riso' : 'orgulho') : 'concentrado';
        const pulinho = 10 * B.bump(u, T_ENCOSTA + 0.02, 0.74);
        const c = cenaVaso({ cen, ang, naTampa, contato, lean: corpo[0], desce: corpo[1], pulinho, expr, t,
          brilho: feliz ? B.bump(u, T_ENCOSTA, 0.8) : 0 });
        return B.quadro(cen.svg + c);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'range') S.colocar(fx, S.SOM.rangido(0.7), e.t, 0.05);
      if (e.tipo === 'toc') S.colocar(fx, S.SOM.toc(), e.t, 0.7);
      if (e.tipo === 'desce') S.colocar(fx, S.SOM.vush(0.25), e.t, 0.2);
      if (e.tipo === 'fecha') S.colocar(fx, S.SOM.toc(), e.t, 0.35);
    }
    return { fx, amb: S.AMB.banheiro() };
  },
};
