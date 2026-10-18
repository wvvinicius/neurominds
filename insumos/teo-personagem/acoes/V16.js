// V16 — Tirar o sapato. De lado, sentado num banquinho, no quarto (o inverso do V15).
// Cada repetição: levanta o pé calçado, puxa o tênis pelo calcanhar, tira devagar até sair ("ploc")
// e fica segurando o tênis no colo, contente. Volta rápida: calça de novo.
const B = require('../lib/base');
const { quarto } = require('../lib/cenario');
const { cenaSapato, brilho } = require('./obj-lote1');

const U0 = 0.04, U1 = 0.74, U2 = 0.86;   // tira devagar em U0–U1, orgulho até U2, volta rápida até 1
// q (da cena do sapato): 1 = calçado, 0 = tênis na mão
const qDe = u => u < U0 ? 1 : u < U1 ? 1 - (u - U0) / (U1 - U0) : u < U2 ? 0 : B.ease((u - U2) / (1 - U2));
const uDe = q => U0 + (1 - q) * (U1 - U0);

module.exports = {
  id: 'V16', slug: 'tirar-sapato', acao: 'Tirar', contexto: 'Tirar o sapato',
  criar() {
    const cen = quarto();
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + uDe(0.95)) * B.CICLO, tipo: 'levanta' }, { t: (i + uDe(0.72)) * B.CICLO, tipo: 'calcanhar' },
        { t: (i + uDe(0.5)) * B.CICLO, tipo: 'sai' }, { t: (i + uDe(0.21)) * B.CICLO, tipo: 'ploc' },
        { t: (i + U2) * B.CICLO, tipo: 'calca' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const q = qDe(u);
        const orgulho = u >= U1 - 0.02 && u < U2 + 0.02;
        const expr = orgulho ? (u < U1 + 0.05 ? 'riso' : 'orgulho') : q > 0.97 ? 'feliz' : q > 0.55 && q < 0.75 ? 'esforco' : 'concentrado';
        const c = cenaSapato({ cen, q, expr, piscar: q > 0.97 && B.piscando(t) });
        let br = '';
        const a = orgulho ? B.bump(u, U1 - 0.02, U2 + 0.02) : 0;
        if (a > 0.01) {
          const [tx, ty] = c.tenisCena;
          [[70, -100, 26, 0], [120, -30, 20, 20], [100, 40, 16, 10]].forEach(([dx, dy, r, rot], j) =>
            br += brilho(tx + dx, ty + dy, r * B.clamp(a * 1.6 - j * 0.1), a, rot + 30 * a));
        }
        return B.quadro(cen.svg + c.svg + br);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'levanta') S.colocar(fx, S.SOM.vush(0.3), e.t, 0.15);
      if (e.tipo === 'calcanhar') S.colocar(fx, S.SOM.encaixe(), e.t, 0.3);
      if (e.tipo === 'sai') S.colocar(fx, S.SOM.esfrega(0.55, 900), e.t, 0.18);
      if (e.tipo === 'ploc') { S.colocar(fx, S.SOM.plop(), e.t, 0.5); S.colocar(fx, S.SOM.ding(1568), e.t + 0.25, 0.1); }
      if (e.tipo === 'calca') S.colocar(fx, S.SOM.vush(0.25), e.t, 0.2);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
