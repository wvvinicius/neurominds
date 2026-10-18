// V15 — Calçar o sapato. De lado, sentado num banquinho, no quarto.
// Cada repetição: levanta o pé de meia, encaixa o tênis na ponta do pé, enfia, puxa o calcanhar
// e põe o pé no chão ("toc"). Volta rápida: tira o tênis e volta a segurá-lo no colo.
const B = require('../lib/base');
const { quarto } = require('../lib/cenario');
const { cenaSapato, brilho } = require('./obj-lote1');

const U0 = 0.04, U1 = 0.74, U2 = 0.86;   // calça devagar em U0–U1, orgulho até U2, volta rápida até 1
const qDe = u => u < U0 ? 0 : u < U1 ? (u - U0) / (U1 - U0) : u < U2 ? 1 : 1 - B.ease((u - U2) / (1 - U2));
const uDe = q => U0 + q * (U1 - U0);

module.exports = {
  id: 'V15', slug: 'calcar-sapato', acao: 'Calçar', contexto: 'Calçar o sapato',
  criar() {
    const cen = quarto();
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + uDe(0.25)) * B.CICLO, tipo: 'enfia' }, { t: (i + uDe(0.7)) * B.CICLO, tipo: 'encaixa' },
        { t: (i + U1) * B.CICLO, tipo: 'pisa' }, { t: (i + U2) * B.CICLO, tipo: 'tira' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const q = qDe(u);
        const orgulho = u >= U1 - 0.02 && u < U2 + 0.02;
        const expr = orgulho ? (u < U1 + 0.05 ? 'riso' : 'orgulho') : q < 0.03 ? 'feliz' : q > 0.55 && q < 0.75 ? 'esforco' : 'concentrado';
        const c = cenaSapato({ cen, q, expr, piscar: q < 0.03 && B.piscando(t) });
        let br = '';
        const a = orgulho ? B.bump(u, U1 - 0.02, U2 + 0.02) : 0;
        if (a > 0.01) {
          const [tx, ty] = c.tenisCena;
          [[-50, -70, 26, 0], [90, -60, 20, 20], [120, 10, 16, 10]].forEach(([dx, dy, r, rot], j) =>
            br += brilho(tx + dx, ty + dy, r * B.clamp(a * 1.6 - j * 0.1), a, rot + 30 * a));
        }
        return B.quadro(cen.svg + c.svg + br);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'enfia') S.colocar(fx, S.SOM.esfrega(0.6, 900), e.t, 0.18);
      if (e.tipo === 'encaixa') S.colocar(fx, S.SOM.encaixe(), e.t, 0.4);
      if (e.tipo === 'pisa') { S.colocar(fx, S.SOM.passo(), e.t, 0.6); S.colocar(fx, S.SOM.ding(1568), e.t + 0.08, 0.1); }
      if (e.tipo === 'tira') S.colocar(fx, S.SOM.vush(0.25), e.t, 0.2);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
