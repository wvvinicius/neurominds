// V42 — Jogar um objeto: arremessar a bola no parque. De lado.
// Cada repetição (2 s): agacha e pega uma bola do balde, leva a bola por cima da cabeça
// e arremessa com uma mão, por cima do ombro, para fora do quadro (para cima e para a direita). O balde continua cheio.
const B = require('../lib/base');
const { teoLado } = require('../lib/teo');
const { parque } = require('../lib/cenario');
const { balde, bolaColor } = require('./obj-lote3');
const { r2 } = B;

const S = 1.5, X = 680, BX = 905, BS = 1.25, G = 2600;
const R = 26;                                     // raio da bola em unidades locais (≈ 34 px)
const PE_PERTO = [5.75, 114.7], PE_LONGE = [-9.75, 111.7];
const SOLTA = 0.58;                               // instante (u) em que a bola sai das mãos

// tudo em coordenadas "do Teo em pé" (quadril parado = 0,0)
const AGACHA = [[0, 0], [0.08, 0], [0.24, 1], [0.32, 1], [0.44, 0], [1, 0]];
const LEAN = [[0, 0], [0.08, 0], [0.24, 50], [0.32, 50], [0.46, -12], [0.53, -16], [SOLTA, 24], [0.66, 28], [0.76, 4], [0.9, 0], [1, 0]];
const BOLA = [[0.2, [150, 34]], [0.24, [150, 34]], [0.32, [144, 26]], [0.46, [-96, -100]], [0.53, [-102, -104]], [0.555, [-40, -196]], [SOLTA, [96, -172]]];
const MAO_P = [[0, [33, -31]], [0.08, [33, -31]], [0.22, [154, 40]], [0.86, [36, -40]], [1, [33, -31]]];   // fora do "segurar"
const MAO_L = [[0, [3, -27]], [0.08, [3, -27]], [0.22, [136, 40]], [0.32, [126, 30]], [0.46, [78, -128]], [0.53, [82, -132]], [SOLTA, [30, -60]], [0.7, [-10, -40]], [0.86, [10, -36]], [1, [3, -27]]];
const DEPOIS = [[SOLTA, [96, -172]], [0.63, [108, -96]], [0.72, [70, -30]], [0.86, [36, -40]]];

function segurando(u) { return u >= 0.24 && u < SOLTA; }
function posBola(u) { return B.kf(BOLA, u); }

function pose(u) {
  const ag = B.kf(AGACHA, u), desce = 40 * ag, atras = 18 * ag, lean = B.kf(LEAN, u);
  const off = ([x, y]) => [x + atras, y - desce];          // ponto "em pé" → local do quadril atual
  let mp;
  if (segurando(u)) mp = off(posBola(u));
  else if (u >= SOLTA && u < 0.86) mp = off(B.kf(DEPOIS, u));
  else mp = off(B.kf(MAO_P, u));
  const ml = off(B.kf(MAO_L, u));
  return { ag, desce, atras, lean, mp, ml, off };
}

module.exports = {
  id: 'V42', slug: 'jogar-bola', acao: 'Jogar', contexto: 'Jogar um objeto (arremessar a bola)',
  criar() {
    const cen = parque();
    const Y0 = teoLado.emPe(cen.chao, S);
    // ponto e velocidade de saída da bola (cena)
    const pSolta = posBola(SOLTA - 1e-4), pAntes = posBola(SOLTA - 0.02);
    const sx = X + pSolta[0] * S, sy = Y0 + pSolta[1] * S;
    const VX = 1250, VY = -1350;
    const voo = (a) => [sx + VX * a, sy + VY * a + 0.5 * G * a * a];
    return {
      eventos: [0, 1, 2].flatMap(i => [
        { t: (i + 0.25) * B.CICLO, tipo: 'pega' },
        { t: (i + SOLTA - 0.03) * B.CICLO, tipo: 'joga' },
        { t: (i + 0.42) * B.CICLO, tipo: 'sobe' },
      ]),
      frame(f) {
        const { t, u } = B.tempo(f);
        const q = pose(u);
        const olhaBola = u > SOLTA && u < 0.84;
        const teo = teoLado({
          x: X - q.atras * S, y: Y0 + q.desce * S, s: S, lean: q.lean, cabeca: olhaBola ? -16 : (u > 0.12 && u < 0.34 ? 8 : -4 * B.bump(u, 0.36, 0.55)),
          pernaPerto: { alvo: [PE_PERTO[0] + q.atras, PE_PERTO[1] - q.desce], dobra: -1 },
          pernaLonge: { alvo: [PE_LONGE[0] + q.atras, PE_LONGE[1] - q.desce], dobra: -1 },
          bracoPerto: { alvo: q.mp, dobra: u > 0.36 && u < 0.56 ? 1 : -1 },
          bracoLonge: { alvo: q.ml, dobra: -1 },
          expr: olhaBola ? { base: 'riso', olhar: [8, -10], olho: 'aberto' }
            : u > 0.5 && u < SOLTA ? { base: 'esforco', suor: false }
            : u > 0.36 && u <= 0.5 ? { base: 'concentrado', olhar: [8, -8] }
            : u > 0.12 && u < 0.34 ? { base: 'concentrado', olhar: [4, 8] } : 'feliz',
          piscar: !olhaBola && u < 0.1 && B.piscando(t),
          itensFrente: segurando(u) ? (i) => {
            const b = q.off(posBola(u));
            return bolaColor(b[0], b[1], R, '#E63946', u * 200);
          } : '',
          sombraY: 135.7 - q.desce, sombraX: 15 + q.atras,
        });
        // bola voando (só depois de sair das mãos; some fora do quadro antes do ciclo seguinte)
        let bola = '';
        const a = (u - SOLTA) * B.CICLO;
        if (a > 0 && a < 0.9) { const [bx, by] = voo(a); if (bx < 2000 && by > -80) bola = bolaColor(bx, by, R * S, '#E63946', 300 + a * 900); }
        // rastro (3 risquinhos atrás da bola)
        let rastro = '';
        if (a > 0 && a < 0.5) for (let j = 1; j <= 3; j++) {
          const [x1, y1] = voo(Math.max(0, a - 0.04 * j)), [x0, y0] = voo(Math.max(0, a - 0.04 * j - 0.03));
          rastro += B.tracoSvg(`M ${r2(x0)} ${r2(y0 + (j - 2) * 18)} L ${r2(x1)} ${r2(y1 + (j - 2) * 18)}`, 6, '#fff', `opacity="${r2(0.8 - 0.2 * j)}"`);
        }
        return B.quadro(cen.svg + balde(BX, cen.chao, BS) + teo.svg + rastro + bola);
      },
    };
  },
  som(S, eventos) {
    const fx = S.trilha();
    for (const e of eventos) {
      if (e.tipo === 'pega') S.colocar(fx, S.SOM.toc(), e.t, 0.35);
      if (e.tipo === 'sobe') S.colocar(fx, S.SOM.vush(0.3), e.t, 0.18);
      if (e.tipo === 'joga') { S.colocar(fx, S.SOM.vush(0.45), e.t, 0.5); }
    }
    return { fx, amb: S.AMB.parque() };
  },
};
