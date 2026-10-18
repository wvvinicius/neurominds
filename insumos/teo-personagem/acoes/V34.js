// V34 — Descer a escada. Mesmo cenário da V33 (3 degraus e patamar), o Teo virado para a esquerda.
// Cada repetição (2 s): desce devagar, um pé em cada degrau, olhando os degraus e segurando o corrimão
// (ação principal); chega no chão contente e volta rapidinho de ré para o patamar (volta neutra).
const B = require('../lib/base');
const { cenarioEscada, teoNaEscada } = require('./V33');

module.exports = {
  id: 'V34', slug: 'descer-escada', acao: 'Descer', contexto: 'Descer a escada',
  criar() {
    const cen = cenarioEscada();
    // progresso na escada: 1 = patamar, 0 = chão
    const K = [[0, 1], [0.06, 1], [0.66, 0], [0.82, 0], [0.98, 1], [1, 1]];
    // instantes em que cada pé encosta no degrau de baixo (fim de cada um dos 4 passos)
    const PASSOS = [0.21, 0.36, 0.51, 0.66].map(a => a - 0.15 * 0.15);
    return {
      eventos: [0, 1, 2].flatMap(i => [...PASSOS.map(u => ({ t: (i + u) * B.CICLO, tipo: 'passo' })),
        { t: (i + 0.7) * B.CICLO, tipo: 'oba' }, { t: (i + 0.84) * B.CICLO, tipo: 'volta' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = u < 0.66 ? 1 - B.clamp((u - 0.06) / 0.6) : B.kf(K, u);
        const oba = B.bump(u, 0.66, 0.84);
        const voltando = u > 0.82;
        const descendo = u > 0.04 && u < 0.66;
        const teo = teoNaEscada(k, {
          espelhar: true, maoFrente: 34,
          lean: voltando ? 2 : descendo ? -3 : 2 - 4 * oba, cabeca: voltando ? 0 : descendo ? 14 : -10 * oba,
          expr: oba > 0.3 ? 'riso' : descendo ? { base: 'concentrado', olhar: [6, 10] } : 'feliz',
          piscar: B.piscando(t) && !descendo && oba < 0.3,
          bracoPerto: { a1: B.mix(14, 50, oba) + (descendo ? 12 : 0), a2: B.mix(30, 168, oba) + (descendo ? 20 : 0) },
        });
        return B.quadro(cen.fundo + cen.degraus + teo.svg);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'passo') S.colocar(fx, S.SOM.toc(), e.t, 0.5);
      if (e.tipo === 'oba') S.colocar(fx, S.SOM.ding(1320), e.t, 0.18);
      if (e.tipo === 'volta') S.colocar(fx, S.SOM.vush(0.3), e.t, 0.2);
    }
    return { fx, amb: S.AMB.casa() };
  },
};
