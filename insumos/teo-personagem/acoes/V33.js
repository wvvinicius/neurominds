// V33 — Subir a escada. De lado, dentro de casa: 3 degraus até um patamar, segurando o corrimão.
// Cada repetição (2 s): sobe devagar, um pé em cada degrau (ação principal), comemora lá em cima
// e volta rapidinho para o chão (volta neutra, de ré) para repetir.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { piso, quadroParede, janelaParede } = require('../lib/cenario');
const { ESCADA, desenharEscada, passosEscada, corrimaoY } = require('./obj-lote3');
const { W, H } = B;

const S = 1.25;
function cenarioEscada() {
  const esc = desenharEscada(ESCADA, W);
  return {
    fundo: `<rect width="${W}" height="${H}" fill="#FBEFD9"/>${quadroParede(240, 250)}${janelaParede(1460, 120, 260, 220)}
      <rect x="-10" y="840" width="${W + 20}" height="24" fill="#C89B6D" stroke="#1A0F0A" stroke-width="6"/>${piso(864)}${esc.fundo}`,
    degraus: esc.degraus,
  };
}
// k = progresso na escada (0 = chão, 1 = patamar)
function teoNaEscada(k, o) {
  const { pe, xQ, yQ } = passosEscada(k, S);
  const esp = o.espelhar ? -1 : 1;
  const loc = ([x, y]) => [(x - xQ) * esp / S, (y - yQ) / S];
  // mão de longe no corrimão, um pouco à frente do ombro
  const xm = xQ + esp * (o.maoFrente ?? 40) * S;
  return teoLado({
    x: xQ, y: yQ, s: S, espelhar: o.espelhar, lean: o.lean, cabeca: o.cabeca, expr: o.expr, piscar: o.piscar,
    pernaPerto: { alvo: loc([pe[0].x, pe[0].y]), dobra: -1 },
    pernaLonge: { alvo: loc([pe[1].x, pe[1].y]), dobra: -1 },
    bracoLonge: { alvo: loc([xm, corrimaoY(xm) + 8]), dobra: 1 },
    bracoPerto: o.bracoPerto,
    sombra: false,
  });
}

module.exports = {
  id: 'V33', slug: 'subir-escada', acao: 'Subir', contexto: 'Subir a escada',
  cenarioEscada, teoNaEscada,
  criar() {
    const cen = cenarioEscada();
    // progresso: sobe devagar (0.06 → 0.66), comemora, desce de ré rápido (0.82 → 0.98)
    const K = [[0, 0], [0.06, 0], [0.66, 1], [0.82, 1], [0.98, 0], [1, 0]];
    const PASSOS = [0.06, 0.21, 0.36, 0.51].map(a => a + 0.15 * 0.85);   // pé encosta no degrau
    return {
      eventos: [0, 1, 2].flatMap(i => [...PASSOS.map(u => ({ t: (i + u) * B.CICLO, tipo: 'passo' })),
        { t: (i + 0.7) * B.CICLO, tipo: 'oba' }, { t: (i + 0.84) * B.CICLO, tipo: 'volta' }]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const k = u < 0.66 ? B.clamp((u - 0.06) / 0.6) : B.kf(K, u);   // subida linear por passos (cada passo já tem ease)
        const oba = B.bump(u, 0.66, 0.84);
        const voltando = u > 0.82;
        const teo = teoNaEscada(k, {
          lean: voltando ? 2 : 8 - 6 * oba, cabeca: voltando ? 0 : 6 - 14 * oba,
          expr: oba > 0.3 ? 'riso' : voltando ? 'feliz' : { base: 'concentrado', olhar: [6, 6] },
          piscar: B.piscando(t) && !(oba > 0.3),
          bracoPerto: { a1: B.mix(14, 50, oba), a2: B.mix(30, 168, oba) },
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
