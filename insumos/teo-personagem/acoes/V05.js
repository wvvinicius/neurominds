// V05 — Abaixar a tampa do vaso sanitário. De lado, no banheiro.
// Cada repetição: inclina, pega a tampa aberta, abaixa devagar; solta no finzinho e ela fecha com "toc".
// Volta rápida: levanta a tampa de novo.
const B = require('../lib/base');
const { banheiro } = require('../lib/cenario');
const { cenaVaso } = require('./obj-lote1');

const ABERTA = 95;
// fechamento: a mão acompanha até 28°, depois a tampa cai sozinha (acelerando) até 0
const T_SOLTA = 0.6, T_TOC = 0.665;
function angTampa(u) {
  if (u < 0.24) return ABERTA;
  if (u < T_SOLTA) return B.mix(ABERTA, 28, B.ease((u - 0.24) / (T_SOLTA - 0.24)));
  if (u < T_TOC) { const k = (u - T_SOLTA) / (T_TOC - T_SOLTA); return 28 * (1 - k * k); }
  if (u < 0.84) return 0;
  return B.kf([[0.84, 0], [0.94, ABERTA]], u);
}

module.exports = {
  id: 'V05', slug: 'abaixar-tampa-vaso', acao: 'Abaixar', contexto: 'Abaixar a tampa do vaso sanitário',
  criar() {
    const cen = banheiro();
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.26) * B.CICLO, tipo: 'range' },
        { t: (i + T_TOC) * B.CICLO, tipo: 'toc' },
        { t: (i + 0.84) * B.CICLO, tipo: 'sobe' },
        { t: (i + 0.94) * B.CICLO, tipo: 'encosta' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const ang = angTampa(u);
        // mão na tampa: pega em 0.14–0.24, segura até soltar; volta pega em 0.8–0.84 e solta em 0.94–1
        const naTampa = B.kf([[0, 0], [0.12, 0], [0.22, 1], [T_SOLTA, 1], [0.7, 0], [0.79, 0], [0.84, 1], [0.94, 1], [1, 0]], u);
        const contato = B.kf([[0, 82], [0.24, 82], [T_SOLTA, 150], [0.84, 150], [0.94, 82], [1, 82]], u);
        const corpo = B.kf([[0, [0, 0]], [0.12, [0, 0]], [0.22, [32, 8]], [T_SOLTA, [34, 26]], [0.72, [2, 0]], [0.79, [0, 0]], [0.84, [38, 34]], [0.94, [32, 8]], [1, [0, 0]]], u);
        const feliz = u > T_TOC && u < 0.82;
        const expr = u < 0.12 ? 'feliz' : u < T_TOC ? 'concentrado' : feliz ? (u < 0.72 ? 'riso' : 'orgulho') : 'concentrado';
        const pulinho = 10 * B.bump(u, T_TOC + 0.01, 0.75);
        const c = cenaVaso({ cen, ang, naTampa, contato, lean: corpo[0], desce: corpo[1], pulinho, expr, t,
          brilho: feliz ? B.bump(u, T_TOC, 0.8) : 0 });
        return B.quadro(cen.svg + c);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'range') S.colocar(fx, S.SOM.rangido(0.6), e.t, 0.05);
      if (e.tipo === 'toc') { S.colocar(fx, S.SOM.toc(), e.t, 0.9); S.colocar(fx, S.SOM.pof(), e.t, 0.25); }
      if (e.tipo === 'sobe') S.colocar(fx, S.SOM.vush(0.25), e.t, 0.2);
      if (e.tipo === 'encosta') S.colocar(fx, S.SOM.clique(), e.t, 0.4);
    }
    return { fx, amb: S.AMB.banheiro() };
  },
};
