// V06 — Levantar o próprio corpo. De lado, na sala (mesmo agachamento do V04).
// Começa agachado, sobe devagar até ficar em pé e se espreguiça, arqueando para trás com os braços para cima ("tchan!").
// Volta rápida: agacha de novo.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');
const { brilho } = require('./obj-lote1');

module.exports = {
  id: 'V06', slug: 'levantar-corpo', acao: 'Levantar', contexto: 'Levantar o próprio corpo (ficar em pé)',
  criar() {
    const cen = sala();
    const s = 1.55, X = 930, Y0 = teoLado.emPe(cen.chao, s);
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const K = [[0, 1], [0.08, 1], [0.46, 0], [1, 0]];                         // 1 = agachado, 0 = em pé
    const BR = [[0, 0], [0.42, 0], [0.56, 1], [0.8, 1], [0.88, 0], [1, 0]];   // espreguiçar
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.08) * B.CICLO, tipo: 'sobe' }, { t: (i + 0.54) * B.CICLO, tipo: 'tchan' }, { t: (i + 0.84) * B.CICLO, tipo: 'desce' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = u < 0.84 ? B.kf(K, u) : B.kf([[0.84, 0], [0.97, 1]], u);
        const br = B.kf(BR, u);
        const ponta = 8 * br;                         // sobe na ponta dos pés ao se espreguiçar
        const desce = 58 * k - ponta, atras = 22 * k;
        const pe = (P, m) => ({ alvo: [P[0] + atras + (m ? 3 * br : 0), P[1] - desce], dobra: -1, giroPe: br > 0.05 ? -20 * br : undefined });
        const teo = teoLado({
          x: X - atras * s, y: Y0 + desce * s, s,
          lean: 22 * k - 12 * br, cabeca: -10 * k - 10 * br,
          pernaPerto: pe(PE_PERTO, 1), pernaLonge: pe(PE_LONGE, 0),
          bracoPerto: { a1: B.mix(B.mix(10, 82, k), 114, br), a2: B.mix(B.mix(25, 92, k), 122, br) },
          bracoLonge: { a1: B.mix(B.mix(-12, 74, k), -84, br), a2: B.mix(B.mix(8, 88, k), -112, br) },
          expr: br > 0.5 ? (u < 0.7 ? { base: 'riso', olho: 'fechado' } : 'orgulho') : (u > 0.08 && u < 0.44 ? 'esforco' : 'feliz'),
          piscar: br < 0.5 && B.piscando(t),
          sombraY: 135.7 - desce - ponta, sombraX: 15 + atras,
        });
        // "tchan!": brilhinhos em volta das mãos lá em cima
        let br2 = '';
        const a = B.bump(u, 0.52, 0.86);
        if (a > 0.01) {
          const m = teo.info.aCena(teo.info.maoPerto);
          [[80, -50, 32, 0], [30, -120, 24, 25], [120, 40, 20, 10], [150, -110, 18, 30], [90, -190, 16, 5]].forEach(([dx, dy, r, rot], i) =>
            br2 += brilho(m[0] + dx * (0.8 + 0.3 * a), m[1] + dy * (0.8 + 0.3 * a), r * B.clamp(a * 1.6 - i * 0.08), a, rot + 40 * a));
        }
        return B.quadro(cen.svg + teo.svg + br2);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'sobe') S.colocar(fx, S.SOM.vush(0.9), e.t, 0.22);
      if (e.tipo === 'tchan') { S.colocar(fx, S.SOM.nota('sol', 0.18), e.t, 0.35); S.colocar(fx, S.SOM.nota('do2', 0.4), e.t + 0.12, 0.4); S.colocar(fx, S.SOM.ding(1760), e.t + 0.12, 0.08); }
      if (e.tipo === 'desce') { S.colocar(fx, S.SOM.vush(0.3), e.t, 0.25); S.colocar(fx, S.SOM.pisadaFofa(), e.t + 0.26, 0.4); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
