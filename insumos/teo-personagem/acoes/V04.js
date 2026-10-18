// V04 — Abaixar o próprio corpo (agachar). De lado, na sala.
// Cada repetição: desce devagar (é a ação), segura um instante e volta rápido para a pose inicial.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { sala } = require('../lib/cenario');

module.exports = {
  id: 'V04', slug: 'abaixar-corpo', acao: 'Abaixar', contexto: 'Abaixar o próprio corpo (agachar)',
  criar() {
    const cen = sala();
    const s = 1.55, X = 900, Y0 = teoLado.emPe(cen.chao, s);
    // posição dos pés em pé (ficam presos no chão enquanto o quadril desce)
    const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
    const K = [[0, 0], [0.1, 0], [0.5, 1], [0.65, 1], [0.85, 0], [1, 0]];   // 0 = em pé, 1 = agachado
    return {
      eventos: [0, 1, 2].flatMap(i => [{ t: (i + 0.1) * B.CICLO, tipo: 'desce' }, { t: (i + 0.65) * B.CICLO, tipo: 'sobe' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = B.kf(K, u);
        const desce = 58 * k, atras = 22 * k;
        const teo = teoLado({
          x: X - atras * s, y: Y0 + desce * s, s,
          lean: 22 * k, cabeca: -10 * k,
          pernaPerto: { alvo: [PE_PERTO[0] + atras, PE_PERTO[1] - desce], dobra: -1 },
          pernaLonge: { alvo: [PE_LONGE[0] + atras, PE_LONGE[1] - desce], dobra: -1 },
          bracoPerto: { a1: B.mix(10, 82, k), a2: B.mix(25, 92, k) },
          bracoLonge: { a1: B.mix(-12, 74, k), a2: B.mix(8, 88, k) },
          expr: u > 0.12 && u < 0.7 ? 'concentrado' : 'feliz', piscar: B.piscando(t),
          sombraY: 135.7 - desce, sombraX: 15 + atras,
        });
        return B.quadro(cen.svg + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'desce') S.colocar(fx, S.SOM.vush(0.8), e.t, 0.25);
      if (e.tipo === 'sobe') { S.colocar(fx, S.SOM.vush(0.35), e.t, 0.3); S.colocar(fx, S.SOM.boing(), e.t + 0.38, 0.12); }
    }
    return { fx, amb: S.AMB.casa() };
  },
};
